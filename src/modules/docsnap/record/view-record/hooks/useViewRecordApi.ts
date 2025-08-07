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
        purchase_agent: {
            value: 'Nathan Baumert',
            bbox: {
                x_min: 0.2202614379,
                y_min: 0.4398989899,
                x_max: 0.3692810458,
                y_max: 0.448989899
            },
            page: '1',
            confidence: 0.988
        },
        contact_email: {
            value: 'nathan.baumert@va.gov',
            bbox: {
                x_min: 0.2111111111,
                y_min: 0.2106060606,
                x_max: 0.4065359477,
                y_max: 0.2252525253
            },
            page: '1',
            confidence: 0.9629
        },
        po_number: {
            value: 'R4K813',
            bbox: {
                x_min: 0.5718954248,
                y_min: 0.1141414141,
                x_max: 0.631372549,
                y_max: 0.1242424242
            },
            page: '2',
            confidence: 0.9728
        },
        from_location: {
            value: 'VAMC Iowa City',
            bbox: {
                x_min: 0.0888888889,
                y_min: 0.1363636364,
                x_max: 0.1614379085,
                y_max: 0.147979798
            },
            page: '1',
            confidence: 0.8782
        },
        contract_number: {
            value: ''
        },
        tax: {
            value: ''
        },
        total_amount: {
            value: '2,550.00',
            bbox: {
                x_min: 0.7862745098,
                y_min: 0.6328282828,
                x_max: 0.8424836601,
                y_max: 0.6424242424
            },
            page: '2',
            confidence: 0.9839
        },
        shipping_cost: {
            value: '0.00',
            bbox: {
                x_min: 0.3705882353,
                y_min: 0.6545454545,
                x_max: 0.4,
                y_max: 0.6636363636
            },
            page: '2',
            confidence: 0.9819
        },
        discount: {
            value: '0.00',
            bbox: {
                x_min: 0.3705882353,
                y_min: 0.6545454545,
                x_max: 0.4,
                y_max: 0.6636363636
            },
            page: '2',
            confidence: 0.9819
        }
    },
    bill_to: {
        bill_to_name: {
            value: 'Nathan Baumert',
            bbox: {
                x_min: 0.2202614379,
                y_min: 0.4398989899,
                x_max: 0.3692810458,
                y_max: 0.448989899
            },
            page: '1',
            confidence: 0.988
        },
        street: {
            value: '601 Highway 6 West',
            bbox: {
                x_min: 0.5117647059,
                y_min: 0.2363636364,
                x_max: 0.6522875817,
                y_max: 0.245959596
            },
            page: '2',
            confidence: 0.9786
        },
        city: {
            value: 'Iowa City',
            bbox: {
                x_min: 0.5117647059,
                y_min: 0.2484848485,
                x_max: 0.5758169935,
                y_max: 0.2585858586
            },
            page: '2',
            confidence: 0.9867
        },
        state: {
            value: 'IA',
            bbox: {
                x_min: 0.5836601307,
                y_min: 0.2484848485,
                x_max: 0.6,
                y_max: 0.2585858586
            },
            page: 2,
            confidence: 0.9918
        },
        zip: {
            value: '52246',
            bbox: {
                x_min: 0.608496732,
                y_min: 0.2484848485,
                x_max: 0.6516339869,
                y_max: 0.2585858586
            },
            page: 2,
            confidence: 0.9907
        },
        phone_number: {
            value: '319-338-0581 x6309',
            bbox: {
                x_min: 0.5124183007,
                y_min: 0.2611111111,
                x_max: 0.6104575163,
                y_max: 0.2691919192
            },
            page: '2',
            confidence: 0.9732
        },
        bill_to_company: {
            value: 'VAMC Iowa City',
            bbox: {
                x_min: 0.0784313725,
                y_min: 0.1590909091,
                x_max: 0.5758169935,
                y_max: 0.2585858586
            },
            page: '2',
            confidence: 0.9848
        }
    },
    ship_to: {
        ship_to_company: {
            value: 'VETERAN',
            bbox: {
                x_min: 0.2326797386,
                y_min: 0.4712121212,
                x_max: 0.3176470588,
                y_max: 0.4803030303
            },
            page: 2,
            confidence: 0.9913
        },
        name: {
            value: 'Roger T Rydstrom',
            bbox: {
                x_min: 0.2411764706,
                y_min: 0.2782828283,
                x_max: 0.2503267974,
                y_max: 0.2873737374
            },
            page: '3',
            confidence: 0.9902
        },
        street: {
            value: '3 Russell Slade Blvd #431',
            bbox: {
                x_min: 0.091503268,
                y_min: 0.3712121212,
                x_max: 0.1,
                y_max: 0.3797979798
            },
            page: '2',
            confidence: 0.9823
        },
        state: {
            value: 'IA',
            bbox: {
                x_min: 0.5836601307,
                y_min: 0.2484848485,
                x_max: 0.6,
                y_max: 0.2585858586
            },
            page: 2,
            confidence: 0.9918
        },
        zip: {
            value: '52241',
            bbox: {
                x_min: 0.2359477124,
                y_min: 0.3954545455,
                x_max: 0.2797385621,
                y_max: 0.4060606061
            },
            page: 2,
            confidence: 0.991
        },
        phone_number: {
            value: '239 216-3677',
            bbox: {
                x_min: 0.091503268,
                y_min: 0.4070707071,
                x_max: 0.1869281046,
                y_max: 0.4186868687
            },
            page: '2',
            confidence: 0.9838
        }
    },
    card_info: {
        name: {
            value: 'Nathan Baumert',
            bbox: {
                x_min: 0.2202614379,
                y_min: 0.4398989899,
                x_max: 0.3692810458,
                y_max: 0.448989899
            },
            page: '1',
            confidence: 0.988
        },
        card_number: {
            value: '4716 4010 0048 9473',
            bbox: {
                x_min: 0.2522875817,
                y_min: 0.4555555556,
                x_max: 0.454248366,
                y_max: 0.4641414141
            },
            page: '1',
            confidence: 0.9875
        },
        expiration_date: {
            value: '07/26',
            bbox: {
                x_min: 0.2320261438,
                y_min: 0.4707070707,
                x_max: 0.2836601307,
                y_max: 0.4818181818
            },
            page: 1,
            confidence: 0.9197
        },
        cvv: {
            value: '825',
            bbox: {
                x_min: 0.2098039216,
                y_min: 0.4888888889,
                x_max: 0.2405228758,
                y_max: 0.4974747475
            },
            page: 1,
            confidence: 0.9916
        }
    },
    line_items: {
        rehab_id: {
            value: ''
        },
        description: {
            value: 'PATIENT FLOOR LIFT - MANGAR EAGLE LIF',
            bbox: {
                x_min: 0.3366013072,
                y_min: 0.3676767677,
                x_max: 0.3006535948,
                y_max: 0.3909090909
            },
            page: '3',
            confidence: 0.9945
        },
        quantity: {
            value: '1',
            bbox: {
                x_min: 0.5745098039,
                y_min: 0.3681818182,
                x_max: 0.5803921569,
                y_max: 0.3752525253
            },
            page: 3,
            confidence: 0.9538
        },
        unit_price: {
            value: '2,550.00',
            bbox: {
                x_min: 0.8307189542,
                y_min: 0.3676767677,
                x_max: 0.8869281046,
                y_max: 0.3767676768
            },
            page: 3,
            confidence: 0.9566
        },
        total_price: {
            value: '2,550.00',
            bbox: {
                x_min: 0.8307189542,
                y_min: 0.3676767677,
                x_max: 0.8869281046,
                y_max: 0.3767676768
            },
            page: 3,
            confidence: 0.9566
        }
    }
};
