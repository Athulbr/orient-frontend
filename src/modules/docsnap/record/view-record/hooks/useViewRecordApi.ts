import { useNavigate, useParams } from 'react-router-dom';
import { useViewRecordState } from './viewRecordContext';
import { useToastStore } from '../../../../../components/toast/ToastStore';
import httpRequest from '../../../../../global-utils/httpRequest';
import { fileTypeFromBuffer } from 'file-type';
import { convertPdfToImages, filterExtractedDataForInvoiceGeneration } from '../utils';
import { useS3DocumentsStore } from '../../../../../zustand-store/useStoredDocuments';

export const useViewRecordApi = () => {
    const { state, setState } = useViewRecordState();
    const { id } = useParams();
    const navigate = useNavigate();
    const toast = useToastStore();
    const { getS3File } = useS3DocumentsStore();

    // ============================= Get Record By Id ==================================

    const getAndConvertDocumentToImage = async (pdfFileName: string) => {
        setState(prev => ({ ...prev, loadingS3File: true }));
        const s3Response = await getS3File(pdfFileName);
        const imageData = s3Response?.data?.Body?.data;
        if (!imageData) {
            toast.error('S3 document not found');
            return;
        }
        const uint8Array = new Uint8Array(imageData);
        const getFileType = await fileTypeFromBuffer(uint8Array);
        let pdfFile: any;
        let imageUrlArray;
        if (getFileType?.mime && getFileType?.mime !== 'application/pdf') {
            pdfFile = await binaryToFile(uint8Array, `image.${getFileType.ext}`, getFileType?.mime);
            imageUrlArray = [URL.createObjectURL(pdfFile).toString()];
        } else {
            pdfFile = await binaryToFile(uint8Array, `document.${getFileType?.ext}`, getFileType?.mime);
            imageUrlArray = await convertPdfToImages(pdfFile);
        }

        setState(prev => ({
            ...prev,
            loadingS3File: false,
            images: imageUrlArray
        }));
    };

    const getRecordApiById = async (id: string) => {
        try {
            setState(prev => ({ ...prev, loadingData: true, loadingS3File: true }));
            const res: any = await httpRequest('GET', `${import.meta.env.VITE_NODE_URL}/api/idp/history/${id}`);
            if (res.data.imageFileNames) {
                setState(prev => ({
                    ...prev,
                    loadingS3File: false,
                    images: res.data.imageFileNames
                }));
            } else {
                getAndConvertDocumentToImage(res.data.pdfFileName);
            }
            const objectFields: Record<string, any> = {};
            const arrayFields: Record<string, any>[] = [];
            const tableNames: string[] = [];
            if (res.data.extractedData) {
                const extractedData = JSON.parse(JSON.stringify(res.data.extractedData));
                // const extractedData = sampleExtractedData;
                Object.entries(extractedData).forEach(([key, value]: any) => {
                    if (Array.isArray(value)) {
                        // its array
                        arrayFields.push(value);
                        tableNames.push(key);
                    } else if (typeof value === 'object' && value !== null && value?.value === undefined) {
                        // its object
                        objectFields[key] = value;
                    }
                });
            }
            setState(prev => ({
                ...prev,
                record: res.data,
                objectFields,
                arrayFields,
                tableNames,
                loadingData: false
            }));
        } catch (error) {
            console.error('error:===========', error);
            toast.error('Failed to get Record');
        } finally {
            setState(prev => ({ ...prev, loadingData: false }));
        }
    };

    const sendMessage = async (message: string) => {
        setState(prev => ({
            ...prev,
            chatLoading: true,
            messages: [
                ...prev.messages,
                {
                    text: message,
                    userMessage: true
                }
            ]
        }));

        const requestBody = {
            query: message,
            botName: state.record?.pdfFileName
        };

        const response: any = await httpRequest('POST', `https://demo.makez.ai/chatbot/query`, requestBody);

        setState(prev => ({
            ...prev,
            chatLoading: false,
            messages: [
                ...prev.messages,
                {
                    text: response.answer,
                    source: response.source_documents,
                    userMessage: false
                }
            ]
        }));
    };

    const submitRecordApi = async () => {
        try {
            const payload = {
                apiResponse: state?.record?.extractedData,
                recordId: state?.record?._id,
                extractedData: {
                    ...state?.objectFields,
                    line_items: state?.arrayFields[0]
                },
                name: state?.record?.name
            };
            setState(prev => ({ ...prev, loadingData: true, loadingS3File: true }));
            const res: any = await httpRequest('POST', `${import.meta.env.VITE_NODE_URL}/api/idp/history/rehab/create`, payload);
            toast.success('Record submitted successfully');
            navigate('/docsnap/record/list');
        } catch (error) {
            console.error('error:===========', error);
            toast.error('Failed to update Record');
            navigate('/docsnap/record/list');
        } finally {
            setState(prev => ({ ...prev, loadingData: false }));
        }
    };

    const updateRecordApiById = async () => {
        try {
            const payload = {
                template: state?.record?.templateId,
                extractedData: state?.record?.extractedData,
                metadata: state?.record?.metadata,
                fileName: state?.record?.name,
                updatedData: {
                    ...state?.objectFields,
                    line_items: state?.arrayFields[0]
                }
            };

            setState(prev => ({ ...prev, loadingData: true, loadingS3File: true }));
            const res: any = await httpRequest('PATCH', `${import.meta.env.VITE_NODE_URL}/api/idp/history/update/${id}`, payload);
            toast.success('Record updated successfully');
            navigate('/');
        } catch (error) {
            console.error('error:===========', error);
            toast.error('Failed to update Record');
        } finally {
            setState(prev => ({ ...prev, loadingData: false }));
        }
    };
    const updateExtractedData = async (extractedData: any) => {
        try {
            setState(prev => ({ ...prev, loadingData: true, loadingS3File: true }));
            const res: any = await httpRequest('PATCH', `${import.meta.env.VITE_NODE_URL}/api/idp/history/update/${id}`, { extractedData });
            toast.success('Record updated successfully');
        } catch (error) {
            console.error('error:===========', error);
            toast.error('Failed to update Record');
        } finally {
            setState(prev => ({ ...prev, loadingData: false }));
        }
    };
    const generateInvoiceWithAI = async () => {
        try {
            const filteredData = filterExtractedDataForInvoiceGeneration(state.record?.extractedData);
            setState(prev => ({ ...prev, generatingInvoice: true }));
            // test
            const res: any = await httpRequest('POST', `${import.meta.env.VITE_NODE_URL}/api/idp/history/generate-invoice`, {
                purchaseOrder: filteredData
            });
            setState(prev => ({
                ...prev,
                invoiceContent: res.invoice || 'Error generating invoice'
            }));
            toast.success('Invoice generated successfully');
        } catch (error) {
            console.error('error:===========', error);
            toast.error('Failed to generate Invoice');
        } finally {
            setState(prev => ({ ...prev, generatingInvoice: false }));
        }
    };
    const createRequestedNewField = async (description: string) => {
        try {
            const requestBody = {
                description,
                requestType: 'field',
                document: state.record?.templateId._id // TODO: update this
            };
            setState(prev => ({ ...prev, creatingRequest: true }));
            const res: any = await httpRequest('POST', `${import.meta.env.VITE_NODE_URL}/api/idp/request/create`, requestBody);
            toast.success('Request created successfully');
        } catch (error) {
            console.error('error:===========', error);
            toast.error('Failed to create Request');
        } finally {
            setState(prev => ({
                ...prev,
                creatingRequest: false,
                requestNewFieldDialog: false
            }));
        }
    };
    const createComment = async (comment: string, jsonKey: string) => {
        try {
            const requestBody = {
                jsonKey,
                comment,
                templateId: state.record?.templateId._id
            };
            setState(prev => ({ ...prev, creatingRequest: true }));
            const res: any = await httpRequest('POST', `${import.meta.env.VITE_NODE_URL}/api/idp/comment/create`, requestBody);

            toast.success('Comment created successfully');
        } catch (error) {
            console.error('error:===========', error);
            toast.error('Failed to create Comment');
        } finally {
            setState(prev => ({ ...prev, creatingRequest: false }));
            return true;
        }
    };

    return {
        getRecordApiById,
        sendMessage,
        updateRecordApiById,
        submitRecordApi,
        updateExtractedData,
        generateInvoiceWithAI,
        createRequestedNewField,
        createComment
    };
};

export const binaryToFile = async (binaryData: Uint8Array, fileName: string, mimeType: string = 'application/pdf'): Promise<File> => {
    const blob = new Blob([binaryData], { type: mimeType });
    return new File([blob], fileName, { type: mimeType });
};

const sampleExtractedData = {
    basic_info: {
        po_number: {
            value: 'HC7536',
            confidence: 1,
            bbox: {
                x_min: 0.7717141544117647,
                y_min: 0.2255859375,
                x_max: 0.8311121323529411,
                y_max: 0.2373046875
            },
            page: 1
        }
    },
    line_items: [
        {
            description: {
                value: '-',
                confidence: 0.9836,
                bbox: {
                    x_min: 0.2643137255,
                    y_min: 0.5157575758,
                    x_max: 0.5701960784,
                    y_max: 0.5812121212
                },
                page: 1
            }
        },
        {
            unit_price: {
                value: '675.00',
                confidence: 0.9899,
                bbox: {
                    x_min: 0.737254902,
                    y_min: 0.5775757576,
                    x_max: 0.7803921569,
                    y_max: 0.5860606061
                },
                page: 1
            },
            total_price: {
                value: '675.00',
                confidence: 0.9899,
                bbox: {
                    x_min: 0.8650980392,
                    y_min: 0.5781818182,
                    x_max: 0.9090196078,
                    y_max: 0.5866666667
                },
                page: 1
            },
            description: {
                value: 'Delivery',
                confidence: 0.9836,
                bbox: {
                    x_min: 0.2949019608,
                    y_min: 0.5157575758,
                    x_max: 0.5701960784,
                    y_max: 0.5812121212
                },
                page: 1
            }
        }
    ]
};
