import { create } from 'zustand';
import httpUploadRequest from '../global-utils/httpUploadRequest';
import httpRequest from '../global-utils/httpRequest';
import { convertJSON } from '../modules/docsnap/record/list-record/utils/convertJSON';
import { usePermissionStore } from './PermissionStore';
import { config } from '../config/default';

interface ExtractionItem {
    fileName: string;
    status: string;
    time: number;
}

interface DocsnapStoreIF {
    refreshRecord: number;
    extractionQueue: ExtractionItem[];
    clearExtractionQueue: () => void;
    updateRefreshRecord: () => void;
    // Python
    addToPythonExtraction: (files: File[], template: any) => Promise<any>;
    addToPythonExtractionMultiPO: (files: File[], template: any) => Promise<any>;
    trainChatWithDocumentEngine: (s3fileName: string, s3Url: string) => Promise<any>;
    // Node Js
    addToNodeExtractorV1: (files: File[], template: any) => Promise<void>;
}

export const useDocsnapStore = create<DocsnapStoreIF>((set, get) => {
    const updateQueue = (fileName: string, changes: Partial<ExtractionItem>) => {
        set({
            extractionQueue: get().extractionQueue.map(item => (item.fileName === fileName ? { ...item, ...changes } : item))
        });
    };

    const removeCompletedFiles = () => {
        set({
            extractionQueue: get().extractionQueue.filter(i => i.status !== 'Complete')
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

                        console.log('Processing line:', jsonString);

                        const parsed = JSON.parse(jsonString);
                        console.log('Parsed data:', parsed);

                        const processingFiles = get().extractionQueue.filter(queue => queue.status !== 'Complete' && queue.status !== 'failed');

                        // Handle different status types
                        switch (parsed.status) {
                            case 'Complete':
                                handleCompletion(timer, processingFiles, fileName);
                                break;

                            case 'failed':
                            case 'error':
                                handleError(timer, processingFiles, fileName);
                                break;

                            case 'Connected':
                                console.log('SSE connection established');
                                updateQueue(fileName, { status: 'Processing' });
                                break;

                            default:
                                if (parsed.status) {
                                    updateQueue(fileName, { status: parsed.status });
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
                get().extractionQueue.filter(queue => queue.status !== 'Complete' && queue.status !== 'failed'),
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
        updateQueue(fileName, { status: 'Complete' });
        console.log(`File ${fileName} processing completed successfully`);
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
            const active = get().extractionQueue.filter(i => i.status !== 'Complete');
            set({
                extractionQueue: [...active, { fileName: file.name, status: 'Uploading', time: 0 }]
            });

            const token = window?.sessionStorage?.getItem('accessToken') || '';
            const formData = new FormData();
            formData.append('template', JSON.stringify(template));
            // formData.append('extractionType', 'single');
            formData.append('file', file);

            const response = await fetch(`${config.mlServiceNodejs}/docsnap/extract-document`, {
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

        // ================================================= Python =====================================================

        addToPythonExtraction: async (files: File[], template: any) => {
            Array.from(files).forEach(async (file, index) => {
                const sendApiRequest = async () => {
                    try {
                        set({
                            extractionQueue: [...get().extractionQueue, { fileName: file.name, status: 'Uploading', time: 0 }]
                        });
                        const timer = setInterval(() => {
                            set({
                                extractionQueue: get().extractionQueue.map((item: any) =>
                                    item.fileName === file.name ? { ...item, time: item.time + 1 } : item
                                )
                            });
                        }, 1000);
                        const s3Response = await httpUploadRequest(`${config.nodeApiUrl}/idp/document/upload`, file as File);
                        get().trainChatWithDocumentEngine(s3Response?.data?.fileName, s3Response?.data?.url);
                        set({
                            extractionQueue: get().extractionQueue.map((item: any) => (item.fileName === file.name ? { ...item, status: 'Processing' } : item))
                        });
                        const convertedJson = convertJSON(template?.fields || []);
                        const requestBody: Record<string, any> = {
                            // document_type: template.docType || 'other',
                            // entity_schema: convertedJson,
                            // include_confidence: true,
                            // include_bbox: true,
                            // confidence_threshold: 0.2,
                            s3_file_name: s3Response?.data?.fileName,
                            template_id: template._id
                            // provider_id: 'azure',
                            // model_id: 'gpt-4o',
                            // use_latest: false
                        };
                        // if (template.enableOcr) requestBody.ocr_engine = 'google_vision'; // 'doctr';
                        // const extractionEngine = window.localStorage.getItem('extractionEngine');

                        const res = await httpRequest('POST', `${config.extractionServicePython}/api/v5/document/analyze_document_v5`, requestBody);

                        const createReqObject = {
                            status: 'processing',
                            metadata: res,
                            extractedData: null,
                            pdfFileName: s3Response?.data?.fileName,
                            name: s3Response?.data?.fileName,
                            templateId: template._id,
                            documentType: s3Response?.data?.fileType ? s3Response.data.fileType : 'application/pdf'
                        };

                        const createRecordResponse = await httpRequest('POST', `${config.nodeApiUrl}/idp/history/create`, createReqObject);
                        set({ refreshRecord: get().refreshRecord + 1 });

                        // const processingFiles = get().extractionQueue.filter((item: any) => item.status !== 'Processing');
                        // if (!processingFiles.length) {
                        //     set({ refreshRecord: get().refreshRecord + 1 });
                        // }

                        const accessToken = window?.sessionStorage?.getItem('accessToken') as string;
                        const eventSource = new EventSource(`${config.extractionServicePython}${res.stream_url}?token=Bearer ${JSON.parse(accessToken)}`);

                        eventSource.addEventListener('task_update', async (event: any) => {
                            const data = JSON.parse(event.data);
                            set({
                                extractionQueue: get().extractionQueue.map((item: any) =>
                                    item.fileName === file.name ? { ...item, status: data.status } : item
                                )
                            });
                            if (data.current_step === 'Completed') {
                                clearInterval(timer);
                                eventSource.close();
                                try {
                                    const extractedData: any = data?.result?.extracted_data || {};
                                    // ========Add External Fields=========

                                    const user = usePermissionStore.getState().user;

                                    template?.fields?.forEach((section: any) => {
                                        if (section.excludeExtraction) {
                                            section?.subFields?.forEach((subField: any) => {
                                                // Initialize empty value in extractedData for each subField
                                                extractedData[section.jsonKey] = extractedData[section.jsonKey] || {};
                                                extractedData[section.jsonKey][subField.jsonKey] = { value: '' };
                                            });
                                        }
                                    });

                                    extractedData['extracted_by'] = {
                                        name: {
                                            value: `${user?.firstName} ${user?.lastName}`
                                        },
                                        email: {
                                            value: `${user?.email}`
                                        }
                                    };
                                    const requestBody = {
                                        extractedData,
                                        status: 'extracted'
                                    };
                                    await httpRequest(
                                        'PATCH',
                                        `${config.nodeApiUrl}/idp/history/save/extraction/${createRecordResponse.data?._id}`,
                                        requestBody
                                    );
                                    set({ refreshRecord: get().refreshRecord + 1 });

                                    const processingFiles = get().extractionQueue.filter((item: any) => item.status !== 'Complete');
                                    if (!processingFiles.length) {
                                        set({ refreshRecord: get().refreshRecord + 1 });
                                    }
                                } catch (error) {
                                    console.log('error:===========', error);
                                }
                            }
                        });
                    } catch (error) {
                        set({
                            extractionQueue: get().extractionQueue.map((item: any) => (item.fileName === file.name ? { ...item, status: 'failed' } : item))
                        });
                    }
                };
                setTimeout(() => {
                    sendApiRequest();
                }, index * 100);
            });
        },
        addToPythonExtractionMultiPO: async (files: File[], template: any) => {
            Array.from(files).forEach(async (file, index) => {
                const sendApiRequest = async () => {
                    try {
                        set({
                            extractionQueue: [...get().extractionQueue, { fileName: file.name, status: 'Uploading', time: 0 }]
                        });
                        const timer = setInterval(() => {
                            set({
                                extractionQueue: get().extractionQueue.map((item: any) =>
                                    item.fileName === file.name ? { ...item, time: item.time + 1 } : item
                                )
                            });
                        }, 1000);
                        const s3Response = await httpUploadRequest(`${config.nodeApiUrl}/idp/document/upload`, file as File);
                        get().trainChatWithDocumentEngine(s3Response?.data?.fileName, s3Response?.data?.url);
                        set({
                            extractionQueue: get().extractionQueue.map((item: any) => (item.fileName === file.name ? { ...item, status: 'Processing' } : item))
                        });
                        const convertedJson = convertJSON(template?.fields || []);
                        const requestBody: Record<string, any> = {
                            // document_type: template.docType || 'other',
                            // entity_schema: convertedJson,
                            // include_confidence: true,
                            // include_bbox: true,
                            // confidence_threshold: 0.2,
                            s3_file_name: s3Response?.data?.fileName,
                            template_id: template._id
                            // provider_id: 'azure',
                            // model_id: 'gpt-4o',
                            // use_latest: false,
                        };
                        // if (template.enableOcr) requestBody.ocr_engine = 'google_vision'; // 'doctr';
                        // const extractionEngine = window.localStorage.getItem('extractionEngine');

                        const res = await httpRequest('POST', `${config.extractionServicePython}/api/v5/document/analyze_document_v5_multi`, requestBody);

                        const createReqObject = {
                            status: 'processing',
                            metadata: res,
                            extractedData: null,
                            pdfFileName: s3Response?.data?.fileName,
                            name: s3Response?.data?.fileName,
                            templateId: template._id,
                            documentType: s3Response?.data?.fileType ? s3Response.data.fileType : 'application/pdf'
                        };

                        // const createRecordResponse = await httpRequest('POST', `${config.nodeApiUrl}/idp/history/create`, createReqObject);
                        set({ refreshRecord: get().refreshRecord + 1 });
                        set({
                            extractionQueue: get().extractionQueue.map((item: any) => (item.fileName === file.name ? { ...item, status: 'Complete' } : item))
                        });

                        const processingFiles = get().extractionQueue.filter((item: any) => item.status !== 'Processing');
                        if (!processingFiles.length) {
                            set({ refreshRecord: get().refreshRecord + 1 });
                        }

                        const accessToken = window?.sessionStorage?.getItem('accessToken') as string;
                        const eventSource = new EventSource(`${config.extractionServicePython}${res.stream_url}?token=Bearer ${JSON.parse(accessToken)}`);

                        eventSource.addEventListener('task_update', async (event: any) => {
                            const data = JSON.parse(event.data);
                            set({
                                extractionQueue: get().extractionQueue.map((item: any) =>
                                    item.fileName === file.name ? { ...item, status: data.status } : item
                                )
                            });
                            if (data.current_step === 'Completed') {
                                clearInterval(timer);
                                eventSource.close();
                                try {
                                    // const extractedData: any = data?.result?.extracted_data || {};
                                    // ========Add External Fields=========

                                    // const user = usePermissionStore.getState().user;

                                    // template?.fields?.forEach((section: any) => {
                                    //     if (section.excludeExtraction) {
                                    //         section?.subFields?.forEach((subField: any) => {
                                    //             // Initialize empty value in extractedData for each subField
                                    //             extractedData[section.jsonKey] = extractedData[section.jsonKey] || {};
                                    //             extractedData[section.jsonKey][subField.jsonKey] = { value: '' };
                                    //         });
                                    //     }
                                    // });

                                    // extractedData['extracted_by'] = {
                                    //     name: {
                                    //         value: `${user?.firstName} ${user?.lastName}`
                                    //     },
                                    //     email: {
                                    //         value: `${user?.email}`
                                    //     }
                                    // };
                                    // const requestBody = {
                                    //     extractedData,
                                    //     status: 'extracted'
                                    // };
                                    // await httpRequest(
                                    //     'PATCH',
                                    //     `${config.nodeApiUrl}/idp/history/save/extraction/${createRecordResponse.data?._id}`,
                                    //     requestBody
                                    // );
                                    set({ refreshRecord: get().refreshRecord + 1 });

                                    const processingFiles = get().extractionQueue.filter((item: any) => item.status !== 'Complete');
                                    if (!processingFiles.length) {
                                        set({ refreshRecord: get().refreshRecord + 1 });
                                    }
                                } catch (error) {
                                    console.log('error:===========', error);
                                }
                            }
                        });
                    } catch (error) {
                        set({
                            extractionQueue: get().extractionQueue.map((item: any) => (item.fileName === file.name ? { ...item, status: 'failed' } : item))
                        });
                    }
                };
                setTimeout(() => {
                    sendApiRequest();
                }, index * 5000);
            });
        },
        trainChatWithDocumentEngine: async (s3fileName: string, s3Url: string) => {
            try {
                const response = await fetch(`${config.chatbotServicePython}/v2/upload`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        source: [
                            {
                                name: s3fileName,
                                fileType: 'application/pdf',
                                url: s3Url,
                                active: true
                            }
                        ],
                        botName: s3fileName || 'Testbot'
                    })
                });

                // Check if the response is ok
                if (!response.ok) {
                    return null;
                }

                const reader = response.body?.getReader();
                if (!reader) {
                    return null;
                }

                const decoder = new TextDecoder();
                let hasError = false;

                try {
                    while (true) {
                        const { value, done } = await reader.read();

                        if (done) {
                            // if (!hasError) { }
                            break;
                        }
                    }
                } catch (streamError) {
                    console.error('Stream reading error:', streamError);
                    hasError = true;
                } finally {
                    reader.releaseLock();
                }
            } catch (error) {
                console.error('Training error:', error);
                return null;
            }
        },

        // ================================================= Node Js =====================================================

        addToNodeExtractorV1: async (files, template) => {
            for (const [index, file] of Array.from(files).entries()) {
                removeCompletedFiles();
                sendApiRequest(file, template);
            }
        }
    };
});
