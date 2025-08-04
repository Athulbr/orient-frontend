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
    basic_details: {
        po_number: {
            value: 'R4K813',
            confidence: 0.9784,
            bbox: {
                x_min: 0.1849673203,
                y_min: 0.3196969697,
                x_max: 0.2483660131,
                y_max: 0.3313131313
            },
            page: 1,
            similarity: 0.7142857142857143
        },
        contact_email: {
            value: 'nathan.baumert@va.gov',
            confidence: 0.9629,
            bbox: {
                x_min: 0.2111111111,
                y_min: 0.2106060606,
                x_max: 0.4065359477,
                y_max: 0.2252525253
            },
            page: 1,
            similarity: 1
        },
        phone_number: {
            value: '319-351-1110',
            confidence: 0.9903,
            bbox: {
                x_min: 0.2163398693,
                y_min: 0.1924242424,
                x_max: 0.3281045752,
                y_max: 0.204040404
            },
            page: 1,
            similarity: 0.8148148148148148
        },
        contract_number: {
            value: '',
            confidence: null,
            bbox: null,
            page: null,
            similarity: 0
        },
        subtotal: {
            value: '2,550.00',
            confidence: 0.9839,
            bbox: {
                x_min: 0.7862745098,
                y_min: 0.6328282828,
                x_max: 0.8424836601,
                y_max: 0.6424242424
            },
            page: 2,
            similarity: 1
        },
        tax: {
            value: '',
            confidence: null,
            bbox: null,
            page: null,
            similarity: 0
        },
        shipping_cost: {
            value: '0.00',
            confidence: 0.9819,
            bbox: {
                x_min: 0.3705882353,
                y_min: 0.6545454545,
                x_max: 0.4,
                y_max: 0.6636363636
            },
            page: 2,
            similarity: 1
        },
        total_amount: {
            value: '2,550.00',
            confidence: 0.9839,
            bbox: {
                x_min: 0.7862745098,
                y_min: 0.6328282828,
                x_max: 0.8424836601,
                y_max: 0.6424242424
            },
            page: 2,
            similarity: 1
        },
        quote_id: {
            value: '',
            confidence: null,
            bbox: null,
            page: null,
            similarity: 0
        },
        discount: {
            value: '0.00',
            confidence: 0.9819,
            bbox: {
                x_min: 0.3705882353,
                y_min: 0.6545454545,
                x_max: 0.4,
                y_max: 0.6636363636
            },
            page: 2,
            similarity: 1
        }
    },
    ship_to: {
        name: {
            value: 'RYDSTROM',
            confidence: 0.9837,
            bbox: {
                x_min: 0.2882352941,
                y_min: 0.3722222222,
                x_max: 0.3875816993,
                y_max: 0.3848484848
            },
            page: 1,
            similarity: 0.7368421052631579
        },
        attn: {
            value: '',
            confidence: null,
            bbox: null,
            page: null,
            similarity: 0
        },
        street: {
            value: '3 RUSSELL SLADE BLVD #431',
            confidence: null,
            bbox: null,
            page: null,
            similarity: 0
        },
        city: {
            value: 'CORALVILLE',
            confidence: 0.9925,
            bbox: {
                x_min: 0.0908496732,
                y_min: 0.3954545455,
                x_max: 0.1745098039,
                y_max: 0.4060606061
            },
            page: 2,
            similarity: 1
        },
        state: {
            value: 'IA',
            confidence: 0.9787,
            bbox: {
                x_min: 0.1718954248,
                y_min: 0.1358585859,
                x_max: 0.1888888889,
                y_max: 0.1474747475
            },
            page: 1,
            similarity: 1
        },
        zip: {
            value: '52241',
            confidence: 0.991,
            bbox: {
                x_min: 0.2359477124,
                y_min: 0.3954545455,
                x_max: 0.2797385621,
                y_max: 0.4060606061
            },
            page: 2,
            similarity: 1
        },
        phone_number: {
            value: '216-3677',
            confidence: 0.9874,
            bbox: {
                x_min: 0.5222222222,
                y_min: 0.3722222222,
                x_max: 0.5973856209,
                y_max: 0.3848484848
            },
            page: 1,
            similarity: 0.8235294117647058
        }
    },
    bill_to: {
        bill_to_name: {
            value: 'nathan.baumert',
            confidence: 0.9714,
            bbox: {
                x_min: 0.4235294118,
                y_min: 0.4232323232,
                x_max: 0.5718954248,
                y_max: 0.4338383838
            },
            page: 1,
            similarity: 0.88
        },
        attn: {
            value: '',
            confidence: null,
            bbox: null,
            page: null,
            similarity: 0
        },
        street: {
            value: 'Highway',
            confidence: 0.9944,
            bbox: {
                x_min: 0.1235294118,
                y_min: 0.1161616162,
                x_max: 0.1908496732,
                y_max: 0.1282828283
            },
            page: 1,
            similarity: 0.6
        },
        city: {
            value: 'IOWA',
            confidence: 0.9818,
            bbox: {
                x_min: 0.0895424837,
                y_min: 0.0919191919,
                x_max: 0.145751634,
                y_max: 0.1075757576
            },
            page: 1,
            similarity: 0.6
        },
        state: {
            value: 'IA',
            confidence: 0.9787,
            bbox: {
                x_min: 0.1718954248,
                y_min: 0.1358585859,
                x_max: 0.1888888889,
                y_max: 0.1474747475
            },
            page: 1,
            similarity: 1
        },
        zip: {
            value: '52246',
            confidence: 0.9905,
            bbox: {
                x_min: 0.1967320261,
                y_min: 0.1353535354,
                x_max: 0.2477124183,
                y_max: 0.147979798
            },
            page: 1,
            similarity: 1
        },
        bill_to_company: {
            value: 'IOWA CITY (636A8/121)',
            confidence: null,
            bbox: null,
            page: null,
            similarity: 0
        },
        phone_number: {
            value: '319-338-0581',
            confidence: 0.9732,
            bbox: {
                x_min: 0.5124183007,
                y_min: 0.2611111111,
                x_max: 0.6104575163,
                y_max: 0.2691919192
            },
            page: 2,
            similarity: 0.8148148148148148
        }
    },
    line_items: [
        {
            sku_number: {
                value: 'MPCA210400',
                confidence: 0.9789,
                bbox: {
                    x_min: 0.2346405229,
                    y_min: 0.3676767677,
                    x_max: 0.3267973856,
                    y_max: 0.3767676768
                },
                page: 3,
                similarity: 0.6666666666666666
            },
            rehab_id: {
                value: '',
                confidence: null,
                bbox: null,
                page: null,
                similarity: 0
            },
            description: {
                value: 'PATIENT FLOOR LIFT - MANGAR EAGLE LIF',
                confidence: null,
                bbox: null,
                page: null,
                similarity: 0
            },
            quantity: {
                value: '1',
                confidence: 0.9913,
                bbox: {
                    x_min: 0.1091503268,
                    y_min: 0.9257575758,
                    x_max: 0.1150326797,
                    y_max: 0.9343434343
                },
                page: 1,
                similarity: 1
            },
            unit_price: {
                value: '2,550.00',
                confidence: 0.9839,
                bbox: {
                    x_min: 0.7862745098,
                    y_min: 0.6328282828,
                    x_max: 0.8424836601,
                    y_max: 0.6424242424
                },
                page: 2,
                similarity: 1
            },
            total_price: {
                value: '2,550.00',
                confidence: 0.9839,
                bbox: {
                    x_min: 0.7862745098,
                    y_min: 0.6328282828,
                    x_max: 0.8424836601,
                    y_max: 0.6424242424
                },
                page: 2,
                similarity: 1
            }
        }
    ]
};
