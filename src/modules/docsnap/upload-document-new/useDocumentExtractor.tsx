import { useNavigate } from 'react-router-dom';
import { config } from '../../../config/default';
import httpUploadRequest from '../../../global-utils/httpUploadRequest';
import { useExtractionStore } from '../../../zustand-store/extractionStore';
import { useToastStore } from '../../../components/toast/ToastStore';

export const useDocumentExtractor = () => {
    const { extractionQueue, updateExtractionQueue, refreshExtractionQueue, startTimer, processStream, addToExtractionQueue } = useExtractionStore();
    const navigate = useNavigate();
    const toast = useToastStore();

    // console.log('extractionQueue:===========', extractionQueue);

    const addToDocumentExtractor = async (template: any, files: File[], rowData?: any) => {
        const sendApiRequestToNodeJsExtractor = async (file: File, template: any) => {
            let timer: NodeJS.Timeout | null = null;

            try {
                const abortController = new AbortController();
                timer = startTimer(file.name);

                updateExtractionQueue(file.name, {
                    status: 'processing',
                    time: 0,
                    abortController,
                    step: 'uploading',
                    progress: 20
                });

                const token = window?.sessionStorage?.getItem('accessToken') || '';
                const formData = new FormData();
                // formData.append('template', JSON.stringify(template));
                formData.append('templateId', template?._id);
                formData.append('file', file);

                const apiEndPoint = `${config.mlServiceNodejs}/docsnap/extract-document`;

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

        const trainChatWithDocumentEngine = async (s3fileName: string, s3Url: string) => {
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
                    toast.error(`HTTP error! status: ${response.status}`);
                    return null;
                }

                const reader = response.body?.getReader();
                if (!reader) {
                    toast.error('Error in training the bot - no response body');
                    return null;
                }

                const decoder = new TextDecoder();
                let hasError = false;

                try {
                    while (true) {
                        const { value, done } = await reader.read();

                        if (done) {
                            if (!hasError) {
                                toast.success('Document Bot trained successfully');
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
        };

        const sendApiRequestToPythonExtractor = async (file: File, template: any) => {
            let timer: NodeJS.Timeout | null = null;

            try {
                const abortController = new AbortController();
                timer = startTimer(file.name);

                updateExtractionQueue(file.name, {
                    status: 'processing',
                    time: 0,
                    abortController,
                    step: 'uploading',
                    progress: 20
                });

                const token = window?.sessionStorage?.getItem('accessToken') || '';

                const s3Response = await httpUploadRequest(`${config.nodeApiUrl}/idp/document/upload`, file as File);
                await trainChatWithDocumentEngine(s3Response?.data?.fileName, s3Response?.data?.url);
                const requestBody: Record<string, any> = {
                    s3_file_name: s3Response?.data?.fileName,
                    template_id: template._id
                };
                const apiEndPoint = `${config.extractionServicePython}/api/v5/document/analyze_document_v5`;

                const response = await fetch(apiEndPoint, {
                    method: 'POST',
                    headers: { authorization: `Bearer ${JSON.parse(token)}`, 'Content-Type': 'application/json' },
                    body: JSON.stringify(requestBody),
                    signal: abortController.signal
                });
                if (!response.ok) {
                    throw new Error(`HTTP error! status: ${response.status}`);
                }

                const data = await response.json();
                console.log('data:===========', data);

                // Fetch the stream URL
                const accessToken = window?.sessionStorage?.getItem('accessToken') as string;
                const streamResponse = await fetch(`${config.extractionServicePython}${data.stream_url}?token=Bearer ${JSON.parse(accessToken)}`, {
                    method: 'GET',
                    headers: { authorization: `Bearer ${JSON.parse(accessToken)}` },
                    signal: abortController.signal
                });

                if (!streamResponse.ok) {
                    throw new Error(`Stream HTTP error! status: ${streamResponse.status}`);
                }

                if (!streamResponse.body) {
                    throw new Error('ReadableStream not supported');
                }

                const reader = streamResponse.body.getReader();
                console.log('reader:===========', reader);
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

        const sendApiRequestToDataEntry = async (rowData: any, template: any) => {
            let timer: NodeJS.Timeout | null = null;

            try {
                const abortController = new AbortController();
                timer = startTimer(rowData.SKU);

                updateExtractionQueue(rowData.SKU, {
                    status: 'processing',
                    time: 0,
                    abortController,
                    step: 'uploading',
                    progress: 20
                });

                const token = window?.sessionStorage?.getItem('accessToken') || '';

                const requestBody = {
                    templateId: template?._id,
                    rowData: rowData
                };

                const apiEndPoint = `${config.mlServiceNodejs}/docsnap/data-entry`;

                const response = await fetch(apiEndPoint, {
                    method: 'POST',
                    headers: { authorization: `Bearer ${JSON.parse(token)}`, 'Content-Type': 'application/json' },
                    body: JSON.stringify(requestBody)
                });

                // Check response status
                if (!response.ok) {
                    throw new Error(`HTTP error! status: ${response.status}`);
                }

                if (!response.body) {
                    throw new Error('ReadableStream not supported');
                }

                const reader = response.body.getReader();
                await processStream(reader, rowData.SKU, timer);
            } catch (error) {
                console.error('API request error:', error);

                if (timer) {
                    clearInterval(timer);
                }

                // Handle abort separately
                if (error instanceof Error && error.name === 'AbortError') {
                    console.log('Request was aborted');
                }

                updateExtractionQueue(rowData.SKU, { status: 'failed' });
            }
        };

        if (template?.settings?.templateType === 'dataentry') {
            refreshExtractionQueue(rowData.SKU);
            addToExtractionQueue(rowData.SKU);
            sendApiRequestToDataEntry(rowData, template);
            navigate('/docsnap/record/list');
            return;
        }

        for (const file of Array.from(files)) {
            try {
                // First, remove any existing entry for this file
                refreshExtractionQueue(file.name);
                // Then add the new entry
                addToExtractionQueue(file.name);
                // Finally, send the request

                if (template?.settings?.extractionEngine === 'node') {
                    sendApiRequestToNodeJsExtractor(file, template);
                } else {
                    sendApiRequestToPythonExtractor(file, template);
                }
            } catch (error) {
                console.error('Error processing file:', error);
            }
        }

        navigate('/docsnap/record/list');
    };

    return {
        addToDocumentExtractor
    };
};
