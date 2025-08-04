import { create } from 'zustand';
import httpUploadRequest from '../global-utils/httpUploadRequest';
import httpRequest from '../global-utils/httpRequest';
import { convertJSON } from '../modules/docsnap/record/list-record/utils/convertJSON';
import { usePermissionStore } from './PermissionStore';

interface DocsnapStoreIF {
    refreshRecord: number;
    extractionQueue: any[];
    clearExtractionQueue: () => void;
    addToExtraction: (files: FileList, template: any) => Promise<any>;
    trainChatWithDocumentEngine: (s3fileName: string, s3Url: string) => Promise<any>;
}

export const useDocsnapStore = create<DocsnapStoreIF>((set, get) => ({
    refreshRecord: 1,
    extractionQueue: [],
    clearExtractionQueue: () => set({ extractionQueue: [] }),
    addToExtraction: async (files: FileList, template: any) => {
        Array.from(files).forEach(async (file, index) => {
            const sendApiRequest = async () => {
                try {
                    set({
                        extractionQueue: [...get().extractionQueue, { fileName: file.name, status: 'Uploading' }]
                    });
                    const s3Response = await httpUploadRequest(`${import.meta.env.VITE_NODE_URL}/api/idp/document/upload`, file as File);
                    get().trainChatWithDocumentEngine(s3Response?.data?.fileName, s3Response?.data?.url);
                    set({
                        extractionQueue: get().extractionQueue.map((item: any) => (item.fileName === file.name ? { ...item, status: 'Processing' } : item))
                    });
                    const convertedJson = convertJSON(template?.fields || []);
                    const requestBody: Record<string, any> = {
                        document_type: template.docType || 'other',
                        entity_schema: convertedJson,
                        include_confidence: true,
                        include_bbox: true,
                        confidence_threshold: 0.5,
                        s3_file_name: s3Response?.data?.fileName,
                        provider_id: 'azure',
                        model_id: 'gpt-4o',
                        use_latest: false
                    };
                    if (template.enableOcr) requestBody.ocr_engine = 'doctr';
                    const extractionEngine = window.localStorage.getItem('extractionEngine');
                    // =================== NODE ===================
                    if (extractionEngine === 'node') {
                        const createReqObject = {
                            status: 'processing',
                            metadata: {},
                            extractedData: null,
                            pdfFileName: s3Response?.data?.fileName,
                            name: s3Response?.data?.fileName,
                            templateId: template._id,
                            documentType: s3Response?.data?.fileType ? s3Response.data.fileType : 'application/pdf'
                        };

                        const createRecordResponse = await httpRequest('POST', `${import.meta.env.VITE_NODE_URL}/api/idp/history/create`, createReqObject);
                        set({
                            extractionQueue: get().extractionQueue.map((item: any) => (item.fileName === file.name ? { ...item, status: 'Processing' } : item))
                        });
                        set({ refreshRecord: get().refreshRecord + 1 });

                        const body = {
                            s3FileName: s3Response?.data?.fileName,
                            schema: convertedJson.fields
                        };

                        const res = await httpRequest('POST', `${import.meta.env.VITE_NODE_URL}/api/idp/project/extract`, body);
                        const patchRequestBody = {
                            extractedData: res.data.extractedData,
                            imageFileNames: res.data.fileNames?.length ? res.data.fileNames : [],
                            status: 'extracted'
                        };
                        await httpRequest(
                            'PATCH',
                            `${import.meta.env.VITE_NODE_URL}/api/idp/history/save/extraction/${createRecordResponse.data?._id}`,
                            patchRequestBody
                        );
                        set({ refreshRecord: get().refreshRecord + 1 });

                        // =================== NODE ===================
                    } else {
                        const res = await httpRequest('POST', import.meta.env.VITE_PYTHON_API_ANALYZE_DOCUMENT_URL, requestBody);

                        const createReqObject = {
                            status: 'processing',
                            metadata: res,
                            extractedData: null,
                            pdfFileName: s3Response?.data?.fileName,
                            name: s3Response?.data?.fileName,
                            templateId: template._id,
                            documentType: s3Response?.data?.fileType ? s3Response.data.fileType : 'application/pdf'
                        };

                        const createRecordResponse = await httpRequest('POST', `${import.meta.env.VITE_NODE_URL}/api/idp/history/create`, createReqObject);
                        set({
                            extractionQueue: get().extractionQueue.map((item: any) => (item.fileName === file.name ? { ...item, status: 'Complete' } : item))
                        });

                        const processingFiles = get().extractionQueue.filter((item: any) => item.status !== 'Processing');
                        if (!processingFiles.length) {
                            set({ refreshRecord: get().refreshRecord + 1 });
                        }

                        const accessToken = window?.sessionStorage?.getItem('accessToken') as string;
                        const eventSource = new EventSource(`${import.meta.env.VITE_PYTHON_URL}/ai/${res.stream_url}?token=Bearer ${JSON.parse(accessToken)}`);

                        eventSource.addEventListener('task_update', async (event: any) => {
                            const data = JSON.parse(event.data);
                            set({
                                extractionQueue: get().extractionQueue.map((item: any) =>
                                    item.fileName === file.name ? { ...item, status: data.status } : item
                                )
                            });
                            if (data.current_step === 'Complete') {
                                eventSource.close();
                                const extractedData: any = data?.result?.extracted_data || {};
                                const email = usePermissionStore.getState().user?.email;
                                extractedData['extraction_details'] = {
                                    extracted_by: {
                                        value: `${email}`
                                    }
                                };
                                const requestBody = {
                                    extractedData,
                                    status: 'extracted'
                                };
                                await httpRequest(
                                    'PATCH',
                                    `${import.meta.env.VITE_NODE_URL}/api/idp/history/save/extraction/${createRecordResponse.data?._id}`,
                                    requestBody
                                );
                                const processingFiles = get().extractionQueue.filter((item: any) => item.status !== 'Complete');
                                if (!processingFiles.length) {
                                    set({ refreshRecord: get().refreshRecord + 1 });
                                }
                            }
                        });
                    }
                } catch (error) {
                    set({
                        extractionQueue: get().extractionQueue.map((item: any) => (item.fileName === file.name ? { ...item, status: 'failed' } : item))
                    });
                }
            };
            setTimeout(() => {
                console.log('index:===========', index);
                sendApiRequest();
            }, index * 5000);
        });
    },
    trainChatWithDocumentEngine: async (s3fileName: string, s3Url: string) => {
        try {
            const response = await fetch(`https://demo.makez.ai/chatbot/upload`, {
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
                        if (!hasError) {
                        }
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
    }
}));
