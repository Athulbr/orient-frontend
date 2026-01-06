import { useNavigate } from 'react-router-dom';
import { config } from '../../../config/default';
import { useExtractionStore } from '../../../zustand-store/extractionStore';

export const useDocumentExtractor = () => {
    const { extractionQueue, updateExtractionQueue, refreshExtractionQueue, startTimer, processStream, addToExtractionQueue } = useExtractionStore();
    const navigate = useNavigate();

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
                    progress: 5
                });

                const token = window?.sessionStorage?.getItem('accessToken') || '';
                const selectedTenant = window?.sessionStorage?.getItem('selectedTenant');
                const formData = new FormData();
                // formData.append('template', JSON.stringify(template));
                formData.append('templateId', template?._id);
                formData.append('template', JSON.stringify(template)); // For only SLD module
                formData.append('file', file);

                const templateType = template?.settings?.templateType;

                const apiEndPoint = `${config.mlServiceNodejs}${templateType === 'invoice_tracking' ? '/invoice-tracking/extract-email' : templateType === 'sld' ? '/sld/extract' : '/docsnap/extract-document'}`;

                const headers: Record<string, string> = { authorization: `Bearer ${JSON.parse(token)}` };
                if (selectedTenant) {
                    headers.tenantId = selectedTenant;
                }

                const response = await fetch(apiEndPoint, {
                    method: 'POST',
                    headers,
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
                    console.error('Request was aborted');
                }

                updateExtractionQueue(file.name, { status: 'failed' });
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
                    progress: 5
                });

                const token = window?.sessionStorage?.getItem('accessToken') || '';
                const selectedTenant = window?.sessionStorage?.getItem('selectedTenant');
                const formData = new FormData();
                formData.append('template_id', template?._id);
                formData.append('file', file);
                const apiEndPoint = `${config.extractionServicePython}/api/v5/document/analyze_document`;

                const headers: Record<string, string> = { authorization: `Bearer ${JSON.parse(token)}` };
                if (selectedTenant) {
                    headers.tenantId = selectedTenant;
                }

                const response = await fetch(apiEndPoint, {
                    method: 'POST',
                    headers,
                    body: formData,
                    signal: abortController.signal
                });

                if (!response.ok) {
                    throw new Error(`HTTP error! status: ${response.status}`);
                }

                const data = await response.json();

                // Fetch the stream URL
                const accessToken = window?.sessionStorage?.getItem('accessToken') as string;
                const streamHeaders: Record<string, string> = { authorization: `Bearer ${JSON.parse(accessToken)}` };
                if (selectedTenant) {
                    streamHeaders.tenantId = selectedTenant;
                }
                const streamResponse = await fetch(`${config.extractionServicePython}${data.stream_url}?token=Bearer ${JSON.parse(accessToken)}`, {
                    method: 'GET',
                    headers: streamHeaders,
                    signal: abortController.signal
                });

                if (!streamResponse.ok) {
                    throw new Error(`Stream HTTP error! status: ${streamResponse.status}`);
                }

                if (!streamResponse.body) {
                    throw new Error('ReadableStream not supported');
                }

                const reader = streamResponse.body.getReader();
                await processStream(reader, file.name, timer);
            } catch (error) {
                console.error('API request error:', error);

                if (timer) {
                    clearInterval(timer);
                }

                // Handle abort separately
                if (error instanceof Error && error.name === 'AbortError') {
                    console.error('Request was aborted');
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
                    progress: 5
                });

                const token = window?.sessionStorage?.getItem('accessToken') || '';
                const selectedTenant = window?.sessionStorage?.getItem('selectedTenant');

                const requestBody = {
                    templateId: template?._id,
                    rowData: rowData
                };

                const apiEndPoint = `${config.mlServiceNodejs}/data-entry/add-product`;

                const headers: Record<string, string> = { authorization: `Bearer ${JSON.parse(token)}`, 'Content-Type': 'application/json' };
                if (selectedTenant) {
                    headers.tenantId = selectedTenant;
                }

                const response = await fetch(apiEndPoint, {
                    method: 'POST',
                    headers,
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
                    console.error('Request was aborted');
                }

                updateExtractionQueue(rowData.SKU, { status: 'failed' });
            }
        };

        if (template?.settings?.templateType === 'data-entry') {
            // First, remove any existing entry for this file
            refreshExtractionQueue(rowData.SKU);
            // Then add the new entry
            addToExtractionQueue(rowData.SKU);

            // Finally, send the request
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
