import { config } from '../../../config/default';
import { useExtractionStore } from '../../../zustand-store/extractionStore';

export const useNodeJsDocumentExtractor = () => {
    const { extractionQueue, updateExtractionQueue, refreshExtractionQueue, startTimer, handleCompletion, handleError, addToExtractionQueue } =
        useExtractionStore();

    const addToNodeJsDocumentExtractor = (files: File[], template: any) => {
        const templateSettings = template?.settings;
        const nodeJsExtractor = templateSettings?.extractionEngine === 'node';

        const processStream = async (reader: ReadableStreamDefaultReader<Uint8Array>, fileName: string, timer: NodeJS.Timeout) => {
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

                            // Get fresh state
                            const processingFiles = extractionQueue.filter(queue => queue.status !== 'completed' && queue.status !== 'failed');

                            // Handle different status types
                            switch (parsed.status) {
                                case 'completed':
                                    handleCompletion(timer, processingFiles, fileName);
                                    break;

                                case 'failed':
                                case 'error':
                                    handleError(timer, processingFiles, fileName);
                                    break;

                                default:
                                    if (parsed.status) {
                                        updateExtractionQueue(fileName, {
                                            status: parsed.status,
                                            step: parsed.step,
                                            progress: parsed.progress
                                        });
                                    }
                                    break;
                            }
                        } catch (parseError) {
                            console.warn('Failed to parse SSE message:', parseError, 'Line:', line);
                            continue;
                        }
                    }
                }
            } catch (streamError) {
                console.error('Stream processing error:', streamError);
                const processingFiles = extractionQueue.filter(queue => queue.status !== 'completed' && queue.status !== 'failed');
                handleError(timer, processingFiles, fileName);
            } finally {
                clearInterval(timer);
            }
        };

        const sendApiRequest = async (file: File, template: any) => {
            let timer: NodeJS.Timeout | null = null;

            try {
                const abortController = new AbortController();
                timer = startTimer(file.name);

                updateExtractionQueue(file.name, {
                    status: 'processing',
                    time: 0,
                    abortController,
                    step: 'uploading',
                    progress: 5
                });

                const token = window?.sessionStorage?.getItem('accessToken') || '';
                const formData = new FormData();
                formData.append('template', JSON.stringify(template));
                formData.append('file', file);

                const apiEndPoint =
                    template?.settings?.templateType === 'sld'
                        ? `${config.mlServiceNodejs}/docsnap/extract-sld`
                        : `${config.mlServiceNodejs}/docsnap/extract-document`;

                const response = await fetch(apiEndPoint, {
                    method: 'POST',
                    headers: { authorization: `Bearer ${JSON.parse(token)}` },
                    body: formData,
                    signal: abortController.signal
                });

                // Check response status
                if (!response.ok) {
                    throw new Error(`HTTP error! status: ${response.status}`);
                }

                if (!response.body) {
                    throw new Error('ReadableStream not supported');
                }

                const reader = response.body.getReader();
                await processStream(reader, file.name, timer);
            } catch (error) {
                console.error('API request error:', error);

                if (timer) {
                    clearInterval(timer);
                }

                // Handle abort separately
                if (error instanceof Error && error.name === 'AbortError') {
                    console.log('Request was aborted');
                }

                updateExtractionQueue(file.name, { status: 'failed' });
            }
        };

        if (nodeJsExtractor) {
            for (const file of Array.from(files)) {
                // First, remove any existing entry for this file
                refreshExtractionQueue(file.name);
                // Then add the new entry
                addToExtractionQueue(file.name);
                // Finally, send the request
                sendApiRequest(file, template);
            }
        }
    };

    return {
        addToNodeJsDocumentExtractor
    };
};
