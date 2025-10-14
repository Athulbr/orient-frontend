import { create } from 'zustand';
import { config } from '../config/default';

interface ExtractionItem {
    fileName: string;
    status: 'completed' | 'failed' | 'processing';
    time: number;
    abortController: AbortController;
    step?: string;
    progress?: number;
}

interface DocsnapStoreIF {
    refreshRecord: number;
    extractionQueue: ExtractionItem[];
    clearExtractionQueue: () => void;
    updateRefreshRecord: () => void;
    addToNodeExtractorV1: (files: File[], template: any) => Promise<void>;
}

export const useDocsnapStore = create<DocsnapStoreIF>((set, get) => {
    const updateQueue = (fileName: string, changes: Partial<ExtractionItem>) => {
        set({
            extractionQueue: get().extractionQueue.map(item => (item.fileName === fileName ? { ...item, ...changes } : item))
        });
    };

    const removeCompletedAndFailedFiles = () => {
        set({
            extractionQueue: get().extractionQueue.filter(i => i.status === 'processing')
        });
    };

    const startTimer = (fileName: string) => {
        return setInterval(() => {
            updateQueue(fileName, {
                time: (get().extractionQueue.find(i => i.fileName === fileName)?.time || 0) + 1
            });
        }, 1000);
    };

    const processStream = async (reader: ReadableStreamDefaultReader<Uint8Array>, fileName: string, timer: any) => {
        const decoder = new TextDecoder('utf-8');
        let buffer = '';

        try {
            while (true) {
                const { done, value } = await reader.read();
                if (done) break;

                buffer += decoder.decode(value, { stream: true });
                const lines = buffer.split('\n');
                buffer = lines.pop() || '';

                for (const line of lines) {
                    if (!line.trim()) continue;

                    try {
                        // Handle SSE format: "data: {json}" or just "{json}"
                        let jsonString = line;
                        if (line.startsWith('data: ')) {
                            jsonString = line.substring(6); // Remove "data: " prefix
                        }

                        if (!jsonString.trim()) continue;

                        const parsed = JSON.parse(jsonString);

                        const processingFiles = get().extractionQueue.filter(queue => queue.status !== 'completed' && queue.status !== 'failed');

                        // Handle different status types
                        switch (parsed.status) {
                            case 'completed':
                                handleCompletion(timer, processingFiles, fileName);
                                break;

                            case 'failed':
                            case 'error':
                                handleError(timer, processingFiles, fileName);
                                break;

                            case 'Connected':
                                updateQueue(fileName, { status: 'processing' });
                                break;

                            default:
                                if (parsed.status) {
                                    updateQueue(fileName, { status: parsed.status, step: parsed.step, progress: parsed.progress });
                                }
                                break;
                        }
                    } catch (parseError) {
                        console.warn('Failed to parse SSE message:', parseError, 'Line:', line);
                        // Don't fail the entire stream for individual parse errors
                        continue;
                    }
                }
            }
        } catch (streamError) {
            console.error('Stream processing error:', streamError);
            handleError(
                timer,
                get().extractionQueue.filter(queue => queue.status !== 'completed' && queue.status !== 'failed'),
                fileName
            );
        } finally {
            // Always clear the timer when stream processing ends
            if (timer) {
                clearInterval(timer);
            }
        }
    };

    // Helper function to handle successful completion
    const handleCompletion = (timer: any, processingFiles: any[], fileName: string) => {
        clearInterval(timer);
        if (processingFiles.length < 2) {
            set({ refreshRecord: get().refreshRecord + 1 });
        }
        updateQueue(fileName, { status: 'completed' });
    };

    // Helper function to handle errors
    const handleError = (timer: any, processingFiles: any[], fileName: string) => {
        clearInterval(timer);
        if (processingFiles.length < 2) {
            set({ refreshRecord: get().refreshRecord + 1 });
        }
        updateQueue(fileName, { status: 'failed' });
        console.error(`File ${fileName} processing failed`);
    };

    const sendApiRequest = async (file: File, template: any) => {
        const timer = startTimer(file.name);

        try {
            const active = get().extractionQueue.filter(i => i.status !== 'completed');
            const abortController = new AbortController();
            set({
                extractionQueue: [...active, { fileName: file.name, status: 'processing', time: 0, abortController, step: 'uploading', progress: 5 }]
            });

            const token = window?.sessionStorage?.getItem('accessToken') || '';
            const formData = new FormData();
            formData.append('template', JSON.stringify(template));
            formData.append('file', file);

            const apiEndPoint =
                template?.settings?.templateType === 'sld'
                    ? `${config.mlServiceNodejs}/docsnap/extract-sld-v2`
                    : `${config.mlServiceNodejs}/docsnap/extract-document-v1`;

            const response = await fetch(apiEndPoint, {
                method: 'POST',
                headers: { authorization: `Bearer ${JSON.parse(token)}` },
                body: formData
            });

            if (!response.body) throw new Error('ReadableStream not supported');

            const reader = response.body.getReader();
            await processStream(reader, file.name, timer);
        } catch (error) {
            console.error('Streaming error:', error);
            clearInterval(timer);
            updateQueue(file.name, { status: 'failed' });
        }
    };

    return {
        refreshRecord: 1,
        extractionQueue: [],
        clearExtractionQueue: () => set({ extractionQueue: [] }),
        updateRefreshRecord: () => set({ refreshRecord: get().refreshRecord + 1 }),

        addToNodeExtractorV1: async (files, template) => {
            for (const [index, file] of Array.from(files).entries()) {
                removeCompletedAndFailedFiles();
                sendApiRequest(file, template);
            }
        }
    };
});
