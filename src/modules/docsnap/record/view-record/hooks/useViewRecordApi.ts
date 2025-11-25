import { useNavigate, useParams } from 'react-router-dom';
import { useViewRecordState } from './viewRecordContext';
import { useToastStore } from '../../../../../components/toast/ToastStore';
import httpRequest from '../../../../../global-utils/httpRequest';
import { fileTypeFromBuffer } from 'file-type';
import { convertPdfToImages, filterExtractedDataForInvoiceGeneration } from '../utils';
import { useS3Storage } from '../../../../../zustand-store/S3Storage';
import { config } from '../../../../../config/default';

export const useViewRecordApi = () => {
    const { state, setState } = useViewRecordState();
    const { id } = useParams();
    const navigate = useNavigate();
    const toast = useToastStore();
    const { getS3File } = useS3Storage();

    // ============================= Get Record By Id ==================================

    const getAndConvertDocumentToImage = async (pdfFileName: string) => {
        setState(prev => ({ ...prev, loadingS3File: true }));
        const s3Response: any = await getS3File(pdfFileName);
        const imageData = s3Response?.Body?.data;
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
            const res: any = await httpRequest('GET', `${config.nodeApiUrl}/idp/history/${id}`);
            const objectFields: Record<string, any> = {};
            const arrayFields: Record<string, any>[] = [];
            const tableNames: string[] = [];
            if (res.data.extractedData) {
                const extractedData = JSON.parse(JSON.stringify(res.data.extractedData));
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
            function removeDuplicates(arr: string[]) {
                return [...new Set(arr)];
            }
            const dataEntryWebImages = removeDuplicates(res.data?.dataEntryWebImages);
            const templateId = res.data?.templateId?._id;
            const templates = sessionStorage.getItem('templates');
            let templateSettings;
            // if (templates) {
            //     const templateData = JSON.parse(templates || '');
            //     const template = templateData?.find((template: any) => template?._id === templateId);
            //     templateSettings = template?.settings;
            // } else {
            const resp = await httpRequest('GET', `${config.nodeApiUrl}/idp/template/${templateId}`);
            templateSettings = resp.data?.settings;
            const templateFields = resp.data?.fields;
            const primaryImage = res.data?.dataEntryImages?.primaryImage;
            const additionalImages = res.data?.dataEntryImages?.additionalImages || [];
            // }
            setState(prev => ({
                ...prev,
                record: res.data,
                objectFields,
                arrayFields,
                tableNames,
                loadingData: false,
                dataEntryWebImages,
                templateSettings,
                templateFields,
                primaryImage,
                additionalImages
            }));
            if (res.data?.imageFileNames?.length > 0) {
                const images = await Promise.all(res.data?.imageFileNames?.map((fileName: string) => getS3File(fileName)));
                setState(prev => ({
                    ...prev,
                    loadingS3File: false,
                    module: 'dataentry',
                    images: images.map((image: any) => URL.createObjectURL(new Blob([new Uint8Array(image.Body.data)], { type: 'image/jpeg' })))
                }));
            } else {
                getAndConvertDocumentToImage(res.data.pdfFileName);
            }
        } catch (error) {
            console.error('error:===========', error);
            toast.error('Failed to get Record');
        } finally {
            setState(prev => ({ ...prev, loadingData: false }));
        }
    };

    const sendMessage = async (message: string) => {
        try {
            const requestBody = { query: message, botName: state.record?.pdfFileName };
            const response: any = await httpRequest('POST', `${config.chatbotServicePython}/v2/query`, requestBody);
            setState(prev => ({
                ...prev,
                chatLoading: false,
                messages: [...prev.messages, { text: response.answer, source: response.source_documents, userMessage: false }]
            }));
        } catch (error) {
            setState(prev => ({
                ...prev,
                chatLoading: false,
                messages: [...prev.messages, { text: 'Something went wrong, Please try again later', userMessage: false }]
            }));
        }
    };
    const sendMessageToNode = async (query: string) => {
        try {
            const requestBody = { query, visionOcrText: state.record?.visionOcrText, chatList: state.messages };
            const response: any = await httpRequest('POST', `${config.mlServiceNodejs}/docsnap/chat-with-document`, requestBody);
            setState(prev => ({
                ...prev,
                chatLoading: false,
                messages: [...prev.messages, { text: response.data.answer, userMessage: false }]
            }));
        } catch (error) {
            setState(prev => ({
                ...prev,
                chatLoading: false,
                messages: [...prev.messages, { text: 'Something went wrong, Please try again later', userMessage: false }]
            }));
        }
    };

    const getFileAsBase64 = async (fileKey: string): Promise<string | null> => {
        try {
            const s3Response: any = await getS3File(fileKey);

            if (!s3Response?.Body?.data) {
                console.error("File not found or invalid response");
                return null;
            }

            // Convert number array to Uint8Array
            const fileDataArray = s3Response.Body.data;
            const fileData = new Uint8Array(fileDataArray);

            // Encode to Base64
            const base64String = btoa(
                fileData.reduce((data, byte) => data + String.fromCharCode(byte), "")
            );

            return base64String; // 👉 returns clean base64 string (no prefix)
        } catch (error) {
            console.error("Error fetching/encoding file:", error);
            return null;
        }
    };

    const getFileAsBase64WithMime = async (fileKey: string): Promise<{ base64: string; mimeType: string } | null> => {
        try {
            const s3Response: any = await getS3File(fileKey);

            if (!s3Response?.Body?.data) {
                console.error("File not found or invalid response");
                return null;
            }

            // Convert number array to Uint8Array
            const fileDataArray = s3Response.Body.data;
            const fileData = new Uint8Array(fileDataArray);

            // Encode to Base64
            const base64String = btoa(
                fileData.reduce((data, byte) => data + String.fromCharCode(byte), "")
            );

            // Guess MIME type from file extension
            const fileName = fileKey.split("/").pop()?.toLowerCase() || "";
            let mimeType = "application/octet-stream";

            if (fileName.endsWith(".pdf")) mimeType = "application/pdf";
            else if (fileName.endsWith(".png")) mimeType = "image/png";
            else if (fileName.endsWith(".jpg") || fileName.endsWith(".jpeg")) mimeType = "image/jpeg";
            else if (fileName.endsWith(".txt")) mimeType = "text/plain";
            else if (fileName.endsWith(".csv")) mimeType = "text/csv";

            return { base64: base64String, mimeType };
        } catch (error) {
            console.error("Error fetching/encoding file:", error);
            return null;
        }
    };



    const submitRecordApi = async () => {
        try {
            const payload: any = {
                apiResponse: state?.record?.extractedData,
                recordId: state?.record?._id,
                module: state?.module,
                extractedData: processArrayFields(),
                name: state?.record?.name
            };

            if (state?.module !== 'dataentry') {
                const user = JSON.parse(window?.sessionStorage?.getItem('user') as string);
                if (user.role.name.toLowerCase() === 'admin') {
                    const fileData = await getFileAsBase64WithMime(state.record?.pdfFileName);
                    if (fileData) {
                        payload['fileBase64'] = fileData?.base64;
                        payload['fileMimeType'] = fileData?.mimeType;
                    }
                }
            }
            if (state.module === 'dataentry') {
                payload['arrayFields'] = state.tableNames;
                payload['dataEntryImages'] = {
                    primaryImage: state.primaryImage,
                    additionalImages: state.additionalImages
                }
            }
            setState(prev => ({ ...prev, loadingData: true }));
            const res: any = await httpRequest('POST', `${config.nodeApiUrl}/idp/history/rehab/create`, payload);
            toast.success('Record submitted successfully');
            if (state.module === 'dataentry') return;
            navigate('/docsnap/record/list');
        } catch (error: any) {
            console.error('error:===========', error?.message);
            toast.error(error?.message);
            // navigate('/docsnap/record/list');
        } finally {
            setState(prev => ({ ...prev, loadingData: false }));
        }
    };

    const processArrayFields = () => {
        const updatedData = { ...state?.objectFields };

        // Get table names (could be ['line_items', 'specifications'] or other combinations)
        const tableNames = state?.tableNames || [];

        // Process each array field dynamically
        tableNames.forEach((tableName, index) => {
            // Get the corresponding array field by index
            const arrayFieldRecord = state?.arrayFields[index] || {};

            // Convert Record<string, Record<string, { value: string }>> to array of row objects
            const arrayData = Object.values(arrayFieldRecord).map(rowObj => {
                const flatRow = {};
                Object.entries(rowObj).forEach(([col, valObj]: any) => {
                    // Copy all properties (value, page, bbox, confidence, etc.)
                    // @ts-ignore
                    flatRow[col] = { ...valObj };
                });
                return flatRow;
            });

            // Add to updatedData using the dynamic table name
            updatedData[tableName] = arrayData;
        });

        return updatedData;
    };

    const updateRecordApiById = async () => {
        try {
            // Usage in your payload
            const payload = {
                template: state?.record?.templateId,
                extractedData: state?.record?.extractedData,
                metadata: state?.record?.metadata,
                fileName: state?.record?.name,
                dataEntryImages: {
                    primaryImage: state.primaryImage,
                    additionalImages: state.additionalImages
                },
                updatedData: processArrayFields()
            };
            setState(prev => ({ ...prev, loadingData: true, loadingS3File: true }));
            const res: any = await httpRequest('PATCH', `${config.nodeApiUrl}/idp/history/update/${id}`, payload);
            toast.success('Record updated successfully');
            // navigate('/');
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
            const res: any = await httpRequest('PATCH', `${config.nodeApiUrl}/idp/history/update/${id}`, { extractedData });
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
            const res: any = await httpRequest('POST', `${config.nodeApiUrl}/idp/history/generate-invoice`, {
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
            const res: any = await httpRequest('POST', `${config.nodeApiUrl}/idp/request/create`, requestBody);
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
            const res: any = await httpRequest('POST', `${config.nodeApiUrl}/idp/comment/create`, requestBody);

            toast.success('Comment created successfully');
        } catch (error) {
            console.error('error:===========', error);
            toast.error('Failed to create Comment');
        } finally {
            setState(prev => ({ ...prev, creatingRequest: false }));
            return true;
        }
    };
    const sendRegenerateMessage = async (data: any) => {
        try {
            const res = httpRequest('POST', `${config.mlServiceNodejs}/docsnap/regenerate-description`, data);
            return res;
        } catch (error) {
            console.error('error:===========', error);
            toast.error('Failed to create Comment');
        } finally {
            setState(prev => ({ ...prev }));
        }
    };
    const sendContentCreationContext = async (data: any) => {
        try {
            const res = httpRequest('POST', `${config.mlServiceNodejs}/docsnap/content-creation`, data);
            return res;
        } catch (error) {
            console.error('error:===========', error);
            toast.error('Failed to create Comment');
        } finally {
            setState(prev => ({ ...prev }));
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
        createComment,
        sendMessageToNode,
        sendRegenerateMessage,
        sendContentCreationContext
    };
};

export const binaryToFile = async (binaryData: Uint8Array, fileName: string, mimeType: string = 'application/pdf'): Promise<File> => {
    // @ts-ignore
    const blob = new Blob([binaryData], { type: mimeType });
    return new File([blob], fileName, { type: mimeType });
};

const electricalComponents_OCR = {
    transformer_w5_left: {
        designation: {
            value: 'W 5',
            bbox: {
                x_min: 0.3028996865,
                y_min: 0.030284676,
                x_max: 0.3217084639,
                y_max: 0.0360387644
            },
            page: 1,
            confidence: 0.971
        },
        voltage: {
            value: '20 kV',
            bbox: {
                x_min: 0.3036833856,
                y_min: 0.0393700787,
                x_max: 0.3287617555,
                y_max: 0.0454270139
            },
            page: 1,
            confidence: 0.914
        },
        power_rating: {
            value: '250/500 MVA',
            bbox: {
                x_min: 0.3036833856,
                y_min: 0.0481526348,
                x_max: 0.3687304075,
                y_max: 0.0536038764
            },
            page: 1,
            confidence: 0.9806
        }
    },

    circuit_breaker_mvqa5_left: {
        designation: {
            value: 'MVQA 5',
            bbox: {
                x_min: 0.3040752351,
                y_min: 0.0732889158,
                x_max: 0.3401253918,
                y_max: 0.0784373107
            },
            page: 1,
            confidence: 0.987
        }
    },

    disconnector_mvwd5_left: {
        designation: {
            value: 'MVWD 5',
            bbox: {
                x_min: 0.3040752351,
                y_min: 0.0941853422,
                x_max: 0.3432601881,
                y_max: 0.0996365839
            },
            page: 1,
            confidence: 0.9707
        },
        rating: {
            value: '10 m',
            bbox: {
                x_min: 0.3040752351,
                y_min: 0.1026650515,
                x_max: 0.3244514107,
                y_max: 0.1087219867
            },
            page: 1,
            confidence: 0.9872
        },
        current: {
            value: '1 x 185 Al',
            bbox: {
                x_min: 0.3040752351,
                y_min: 0.1117504543,
                x_max: 0.3463949843,
                y_max: 0.1172016959
            },
            page: 1,
            confidence: 0.8829
        }
    },

    current_transformer_ta5_left: {
        designation_type: {
            value: 'TA 5 Trihal',
            bbox: {
                x_min: 0.3036833856,
                y_min: 0.1490006057,
                x_max: 0.328369906,
                y_max: 0.1632344034
            },
            page: 1,
            confidence: 0.9821
        },
        power_rating: {
            value: '250 KVA',
            bbox: {
                x_min: 0.3036833856,
                y_min: 0.1665657177,
                x_max: 0.3397335423,
                y_max: 0.1717141127
            },
            page: 1,
            confidence: 0.9192
        },
        voltage_rating: {
            value: '20 kV / 400 V',
            bbox: {
                x_min: 0.3036833856,
                y_min: 0.175045427,
                x_max: 0.3628526646,
                y_max: 0.1804966687
            },
            page: 1,
            confidence: 0.9065
        },
        class: {
            value: 'TN - S',
            bbox: {
                x_min: 0.3036833856,
                y_min: 0.1835251363,
                x_max: 0.3260188088,
                y_max: 0.1892792247
            },
            page: 1,
            confidence: 0.9838
        }
    },

    disconnector_wd5_left: {
        designation: {
            value: 'WD 5',
            bbox: {
                x_min: 0.3032915361,
                y_min: 0.198970321,
                x_max: 0.3287617555,
                y_max: 0.2047244094
            },
            page: 1,
            confidence: 0.9795
        },
        rating: {
            value: '5 m',
            bbox: {
                x_min: 0.3032915361,
                y_min: 0.2083585706,
                x_max: 0.3197492163,
                y_max: 0.2138098122
            },
            page: 1,
            confidence: 0.9768
        },
        conductor_ph: {
            value: 'Ph : 1x150 Cu',
            bbox: {
                x_min: 0.3036833856,
                y_min: 0.2174439733,
                x_max: 0.3632445141,
                y_max: 0.2225923683
            },
            page: 1,
            confidence: 0.9338
        },
        conductor_ne: {
            value: 'Ne : 1x150 Cu',
            bbox: {
                x_min: 0.3040752351,
                y_min: 0.2256208359,
                x_max: 0.3636363636,
                y_max: 0.2310720775
            },
            page: 1,
            confidence: 0.9211
        },
        conductor_pe: {
            value: 'PE : 1x95 Cu',
            bbox: {
                x_min: 0.3040752351,
                y_min: 0.2344033919,
                x_max: 0.3585423197,
                y_max: 0.2401574803
            },
            page: 1,
            confidence: 0.9246
        }
    },

    circuit_breaker_qa5_left: {
        designation: {
            value: 'QA 5',
            bbox: {
                x_min: 0.3036833856,
                y_min: 0.254391278,
                x_max: 0.3260188088,
                y_max: 0.2598425197
            },
            page: 1,
            confidence: 0.9677
        },
        type: {
            value: 'NSX400F',
            bbox: {
                x_min: 0.3040752351,
                y_min: 0.2628709873,
                x_max: 0.3452194357,
                y_max: 0.2686250757
            },
            page: 1,
            confidence: 0.9878
        },
        protection: {
            value: 'Micrologic 5.3 E',
            bbox: {
                x_min: 0.3036833856,
                y_min: 0.2710478498,
                x_max: 0.3738244514,
                y_max: 0.2786190188
            },
            page: 1,
            confidence: 0.9834
        },
        rating: {
            value: '400 A / 4P4d',
            bbox: {
                x_min: 0.3036833856,
                y_min: 0.2807389461,
                x_max: 0.3589341693,
                y_max: 0.2861901878
            },
            page: 1,
            confidence: 0.8839
        }
    },

    changeover_switch_wc6_left: {
        designation: {
            value: 'WC 6',
            bbox: {
                x_min: 0.3961598746,
                y_min: 0.2837674137,
                x_max: 0.4212382445,
                y_max: 0.2895215021
            },
            page: 1,
            confidence: 0.9685
        }
    },

    load_center_uc7_left: {
        designation: {
            value: 'UC 7',
            bbox: {
                x_min: 0.1187304075,
                y_min: 0.2665051484,
                x_max: 0.1398902821,
                y_max: 0.2725620836
            },
            page: 1,
            confidence: 0.9847
        },
        preference: {
            value: 'No preference',
            bbox: {
                x_min: 0.118338558,
                y_min: 0.2758933979,
                x_max: 0.1806426332,
                y_max: 0.2831617202
            },
            page: 1,
            confidence: 0.9864
        },
        status: {
            value: 'Undefined',
            bbox: {
                x_min: 0.1187304075,
                y_min: 0.284675954,
                x_max: 0.1626175549,
                y_max: 0.2901271956
            },
            page: 1,
            confidence: 0.9898
        },
        priority: {
            value: '0',
            bbox: {
                x_min: 0.118338558,
                y_min: 0.2931556632,
                x_max: 0.1242163009,
                y_max: 0.2983040581
            },
            page: 1,
            confidence: 0.939
        }
    },

    circuit_breaker_qa9_left: {
        designation: {
            value: 'QA 9',
            bbox: {
                x_min: 0.2163009404,
                y_min: 0.3343428225,
                x_max: 0.2382445141,
                y_max: 0.3403997577
            },
            page: 1,
            confidence: 0.9637
        },
        type: {
            value: 'NSX400F',
            bbox: {
                x_min: 0.21669279,
                y_min: 0.3434282253,
                x_max: 0.2582288401,
                y_max: 0.3485766202
            },
            page: 1,
            confidence: 0.9874
        },
        protection: {
            value: 'Micrologic 5.3 E',
            bbox: {
                x_min: 0.2163009404,
                y_min: 0.3513022411,
                x_max: 0.2864420063,
                y_max: 0.3591762568
            },
            page: 1,
            confidence: 0.9851
        },
        rating: {
            value: '400 A / 4P4d',
            bbox: {
                x_min: 0.2159090909,
                y_min: 0.3609933374,
                x_max: 0.2711598746,
                y_max: 0.3667474258
            },
            page: 1,
            confidence: 0.9649
        }
    },

    circuit_breaker_qa4_left: {
        designation: {
            value: 'QA 4',
            bbox: {
                x_min: 0.1289184953,
                y_min: 0.4730466384,
                x_max: 0.1504702194,
                y_max: 0.4794064204
            },
            page: 1,
            confidence: 0.9658
        },
        type: {
            value: 'NSXm160E',
            bbox: {
                x_min: 0.1297021944,
                y_min: 0.4824348879,
                x_max: 0.1794670846,
                y_max: 0.4875832829
            },
            page: 1,
            confidence: 0.9638
        },
        trip_unit: {
            value: 'TM - D',
            bbox: {
                x_min: 0.1293103448,
                y_min: 0.4918231375,
                x_max: 0.1536050157,
                y_max: 0.4969715324
            },
            page: 1,
            confidence: 0.9882
        },
        rating: {
            value: '160 A / 4P4d',
            bbox: {
                x_min: 0.1300940439,
                y_min: 0.5,
                x_max: 0.184169279,
                y_max: 0.5054512417
            },
            page: 1,
            confidence: 0.9605
        }
    }
};

export default electricalComponents_OCR;

const electricalComponents = {
    transformer_w5_left: {
        designation: {
            value: 'W 5',
            bbox: {
                x_min: 0.289,
                y_min: 0.031,
                x_max: 0.321,
                y_max: 0.036
            },
            bbox_pixels: {
                x_min: Math.round(0.289 * 300), // = 87 pixels
                y_min: Math.round(0.031 * 300), // = 9 pixels
                x_max: Math.round(0.321 * 300), // = 96 pixels
                y_max: Math.round(0.036 * 300) // = 11 pixels
            },
            // Calculated dimensions
            width_pixels: 96 - 87, // = 9 pixels
            height_pixels: 11 - 9, // = 2 pixels
            page: 1
        },
        voltage: {
            value: '20 kV',
            bbox: {
                x_min: 0.289,
                y_min: 0.04,
                x_max: 0.321,
                y_max: 0.045
            },
            bbox_pixels: {
                x_min: Math.round(0.289 * 300), // = 87 pixels
                y_min: Math.round(0.04 * 300), // = 12 pixels
                x_max: Math.round(0.321 * 300), // = 96 pixels
                y_max: Math.round(0.045 * 300) // = 14 pixels
            },
            width_pixels: 96 - 87, // = 9 pixels
            height_pixels: 14 - 12, // = 2 pixels
            page: 1
        },
        power_rating: {
            value: '250 / 500 MVA',
            bbox: {
                x_min: 0.289,
                y_min: 0.048,
                x_max: 0.368,
                y_max: 0.054
            },
            bbox_pixels: {
                x_min: Math.round(0.289 * 300), // = 87 pixels
                y_min: Math.round(0.048 * 300), // = 14 pixels
                x_max: Math.round(0.368 * 300), // = 110 pixels
                y_max: Math.round(0.054 * 300) // = 16 pixels
            },
            width_pixels: 110 - 87, // = 23 pixels
            height_pixels: 16 - 14, // = 2 pixels
            page: 1
        }
    },

    circuit_breaker_mvqa5_left: {
        designation: {
            value: 'MVQA 5',
            bbox: {
                x_min: 0.289,
                y_min: 0.088,
                x_max: 0.34,
                y_max: 0.094
            },
            bbox_pixels: {
                x_min: Math.round(0.289 * 300), // = 87 pixels
                y_min: Math.round(0.088 * 300), // = 26 pixels
                x_max: Math.round(0.34 * 300), // = 102 pixels
                y_max: Math.round(0.094 * 300) // = 28 pixels
            },
            width_pixels: 102 - 87, // = 15 pixels
            height_pixels: 28 - 26, // = 2 pixels
            page: 1
        }
    },

    disconnector_mvwd5_left: {
        designation: {
            value: 'MVWD 5',
            bbox: {
                x_min: 0.289,
                y_min: 0.111,
                x_max: 0.34,
                y_max: 0.117
            },
            bbox_pixels: {
                x_min: Math.round(0.289 * 300), // = 87 pixels
                y_min: Math.round(0.111 * 300), // = 33 pixels
                x_max: Math.round(0.34 * 300), // = 102 pixels
                y_max: Math.round(0.117 * 300) // = 35 pixels
            },
            width_pixels: 102 - 87, // = 15 pixels
            height_pixels: 35 - 33, // = 2 pixels
            page: 1
        },
        rating: {
            value: '10 m',
            bbox: {
                x_min: 0.289,
                y_min: 0.123,
                x_max: 0.312,
                y_max: 0.129
            },
            bbox_pixels: {
                x_min: Math.round(0.289 * 300), // = 87 pixels
                y_min: Math.round(0.123 * 300), // = 37 pixels
                x_max: Math.round(0.312 * 300), // = 94 pixels
                y_max: Math.round(0.129 * 300) // = 39 pixels
            },
            width_pixels: 94 - 87, // = 7 pixels
            height_pixels: 39 - 37, // = 2 pixels
            page: 1
        },
        current: {
            value: '1 x 185 Al',
            bbox: {
                x_min: 0.289,
                y_min: 0.135,
                x_max: 0.34,
                y_max: 0.141
            },
            bbox_pixels: {
                x_min: Math.round(0.289 * 300), // = 87 pixels
                y_min: Math.round(0.135 * 300), // = 41 pixels
                x_max: Math.round(0.34 * 300), // = 102 pixels
                y_max: Math.round(0.141 * 300) // = 42 pixels
            },
            width_pixels: 102 - 87, // = 15 pixels
            height_pixels: 42 - 41, // = 1 pixel
            page: 1
        }
    },

    current_transformer_ta5_left: {
        designation: {
            value: 'TA 5',
            bbox: {
                x_min: 0.289,
                y_min: 0.175,
                x_max: 0.315,
                y_max: 0.181
            },
            bbox_pixels: {
                x_min: Math.round(0.289 * 300), // = 87 pixels
                y_min: Math.round(0.175 * 300), // = 53 pixels
                x_max: Math.round(0.315 * 300), // = 95 pixels
                y_max: Math.round(0.181 * 300) // = 54 pixels
            },
            width_pixels: 95 - 87, // = 8 pixels
            height_pixels: 54 - 53, // = 1 pixel
            page: 1
        },
        type: {
            value: 'Trihal',
            bbox: {
                x_min: 0.289,
                y_min: 0.186,
                x_max: 0.321,
                y_max: 0.192
            },
            bbox_pixels: {
                x_min: Math.round(0.289 * 300), // = 87 pixels
                y_min: Math.round(0.186 * 300), // = 56 pixels
                x_max: Math.round(0.321 * 300), // = 96 pixels
                y_max: Math.round(0.192 * 300) // = 58 pixels
            },
            width_pixels: 96 - 87, // = 9 pixels
            height_pixels: 58 - 56, // = 2 pixels
            page: 1
        },
        voltage_rating: {
            value: '250 VRMS',
            bbox: {
                x_min: 0.289,
                y_min: 0.197,
                x_max: 0.34,
                y_max: 0.203
            },
            bbox_pixels: {
                x_min: Math.round(0.289 * 300), // = 87 pixels
                y_min: Math.round(0.197 * 300), // = 59 pixels
                x_max: Math.round(0.34 * 300), // = 102 pixels
                y_max: Math.round(0.203 * 300) // = 61 pixels
            },
            width_pixels: 102 - 87, // = 15 pixels
            height_pixels: 61 - 59, // = 2 pixels
            page: 1
        }
    },

    disconnector_wd5_left: {
        designation: {
            value: 'WD 5',
            bbox: {
                x_min: 0.289,
                y_min: 0.246,
                x_max: 0.321,
                y_max: 0.252
            },
            bbox_pixels: {
                x_min: Math.round(0.289 * 300), // = 87 pixels
                y_min: Math.round(0.246 * 300), // = 74 pixels
                x_max: Math.round(0.321 * 300), // = 96 pixels
                y_max: Math.round(0.252 * 300) // = 76 pixels
            },
            width_pixels: 96 - 87, // = 9 pixels
            height_pixels: 76 - 74, // = 2 pixels
            page: 1
        },
        rating: {
            value: '5 m',
            bbox: {
                x_min: 0.289,
                y_min: 0.258,
                x_max: 0.309,
                y_max: 0.264
            },
            bbox_pixels: {
                x_min: Math.round(0.289 * 300), // = 87 pixels
                y_min: Math.round(0.258 * 300), // = 77 pixels
                x_max: Math.round(0.309 * 300), // = 93 pixels
                y_max: Math.round(0.264 * 300) // = 79 pixels
            },
            width_pixels: 93 - 87, // = 6 pixels
            height_pixels: 79 - 77, // = 2 pixels
            page: 1
        }
    }
};
const electricalComponents1 = {
    // Left Side Components
    transformer_w5_left: {
        designation: {
            value: 'W 5',
            bbox: {
                x_min: 0.289,
                y_min: 0.031,
                x_max: 0.321,
                y_max: 0.036
            },
            page: 1
        },
        voltage: {
            value: '20 kV',
            bbox: {
                x_min: 0.289,
                y_min: 0.04,
                x_max: 0.321,
                y_max: 0.045
            },
            page: 1
        },
        power_rating: {
            value: '250 / 500 MVA',
            bbox: {
                x_min: 0.289,
                y_min: 0.048,
                x_max: 0.368,
                y_max: 0.054
            },
            page: 1
        }
    },

    circuit_breaker_mvqa5_left: {
        designation: {
            value: 'MVQA 5',
            bbox: {
                x_min: 0.289,
                y_min: 0.088,
                x_max: 0.34,
                y_max: 0.094
            },
            page: 1
        }
    },

    disconnector_mvwd5_left: {
        designation: {
            value: 'MVWD 5',
            bbox: {
                x_min: 0.289,
                y_min: 0.111,
                x_max: 0.34,
                y_max: 0.117
            },
            page: 1
        },
        rating: {
            value: '10 m',
            bbox: {
                x_min: 0.289,
                y_min: 0.123,
                x_max: 0.312,
                y_max: 0.129
            },
            page: 1
        },
        current: {
            value: '1 x 185 Al',
            bbox: {
                x_min: 0.289,
                y_min: 0.135,
                x_max: 0.34,
                y_max: 0.141
            },
            page: 1
        }
    },

    current_transformer_ta5_left: {
        designation: {
            value: 'TA 5',
            bbox: {
                x_min: 0.289,
                y_min: 0.175,
                x_max: 0.315,
                y_max: 0.181
            },
            page: 1
        },
        type: {
            value: 'Trihal',
            bbox: {
                x_min: 0.289,
                y_min: 0.186,
                x_max: 0.321,
                y_max: 0.192
            },
            page: 1
        },
        voltage_rating: {
            value: '250 VRMS',
            bbox: {
                x_min: 0.289,
                y_min: 0.197,
                x_max: 0.34,
                y_max: 0.203
            },
            page: 1
        },
        power_rating: {
            value: '250 kVA',
            bbox: {
                x_min: 0.289,
                y_min: 0.208,
                x_max: 0.331,
                y_max: 0.214
            },
            page: 1
        },
        secondary_voltage: {
            value: '20 kV / 400 V',
            bbox: {
                x_min: 0.289,
                y_min: 0.219,
                x_max: 0.359,
                y_max: 0.225
            },
            page: 1
        },
        class: {
            value: 'TN-S',
            bbox: {
                x_min: 0.289,
                y_min: 0.23,
                x_max: 0.318,
                y_max: 0.236
            },
            page: 1
        }
    },

    disconnector_wd5_left: {
        designation: {
            value: 'WD 5',
            bbox: {
                x_min: 0.289,
                y_min: 0.246,
                x_max: 0.321,
                y_max: 0.252
            },
            page: 1
        },
        rating: {
            value: '5 m',
            bbox: {
                x_min: 0.289,
                y_min: 0.258,
                x_max: 0.309,
                y_max: 0.264
            },
            page: 1
        },
        conductor_ph: {
            value: 'Ph : 1x150 Cu',
            bbox: {
                x_min: 0.289,
                y_min: 0.27,
                x_max: 0.359,
                y_max: 0.276
            },
            page: 1
        },
        conductor_ne: {
            value: 'Ne : 1x150 Cu',
            bbox: {
                x_min: 0.289,
                y_min: 0.281,
                x_max: 0.359,
                y_max: 0.287
            },
            page: 1
        },
        conductor_pe: {
            value: 'PE : 1x95 Cu',
            bbox: {
                x_min: 0.289,
                y_min: 0.292,
                x_max: 0.356,
                y_max: 0.298
            },
            page: 1
        }
    },

    circuit_breaker_qa5_left: {
        designation: {
            value: 'QA 5',
            bbox: {
                x_min: 0.289,
                y_min: 0.316,
                x_max: 0.318,
                y_max: 0.322
            },
            page: 1
        },
        type: {
            value: 'NSX400F',
            bbox: {
                x_min: 0.289,
                y_min: 0.328,
                x_max: 0.34,
                y_max: 0.334
            },
            page: 1
        },
        protection: {
            value: 'Micrologic 5.3 E',
            bbox: {
                x_min: 0.289,
                y_min: 0.339,
                x_max: 0.368,
                y_max: 0.345
            },
            page: 1
        },
        rating: {
            value: '400 A / 4P4d',
            bbox: {
                x_min: 0.289,
                y_min: 0.35,
                x_max: 0.356,
                y_max: 0.356
            },
            page: 1
        }
    },

    load_center_uc7_left: {
        designation: {
            value: 'UC 7',
            bbox: {
                x_min: 0.149,
                y_min: 0.328,
                x_max: 0.178,
                y_max: 0.334
            },
            page: 1
        },
        preference: {
            value: 'No preference',
            bbox: {
                x_min: 0.149,
                y_min: 0.342,
                x_max: 0.227,
                y_max: 0.348
            },
            page: 1
        },
        status: {
            value: 'Undefined',
            bbox: {
                x_min: 0.149,
                y_min: 0.353,
                x_max: 0.202,
                y_max: 0.359
            },
            page: 1
        },
        priority: {
            value: '0',
            bbox: {
                x_min: 0.149,
                y_min: 0.364,
                x_max: 0.156,
                y_max: 0.37
            },
            page: 1
        }
    },

    changeover_switch_wc6_left: {
        designation: {
            value: 'WC 6',
            bbox: {
                x_min: 0.403,
                y_min: 0.35,
                x_max: 0.431,
                y_max: 0.356
            },
            page: 1
        }
    },

    feeder_circuit_qa9_left: {
        designation: {
            value: 'QA 9',
            bbox: {
                x_min: 0.149,
                y_min: 0.412,
                x_max: 0.178,
                y_max: 0.418
            },
            page: 1
        },
        type: {
            value: 'NSX400F',
            bbox: {
                x_min: 0.149,
                y_min: 0.424,
                x_max: 0.202,
                y_max: 0.43
            },
            page: 1
        },
        protection: {
            value: 'Micrologic 5.3 E',
            bbox: {
                x_min: 0.149,
                y_min: 0.435,
                x_max: 0.227,
                y_max: 0.441
            },
            page: 1
        },
        rating: {
            value: '400 A / 4P4d',
            bbox: {
                x_min: 0.149,
                y_min: 0.446,
                x_max: 0.218,
                y_max: 0.452
            },
            page: 1
        }
    },

    disconnector_wd9_left: {
        designation: {
            value: 'WD 9',
            bbox: {
                x_min: 0.149,
                y_min: 0.506,
                x_max: 0.178,
                y_max: 0.512
            },
            page: 1
        },
        rating: {
            value: '5 m',
            bbox: {
                x_min: 0.149,
                y_min: 0.518,
                x_max: 0.169,
                y_max: 0.524
            },
            page: 1
        },
        conductor_ph: {
            value: 'Ph : 1x150 Cu',
            bbox: {
                x_min: 0.149,
                y_min: 0.53,
                x_max: 0.218,
                y_max: 0.536
            },
            page: 1
        },
        conductor_ne: {
            value: 'Ne : 1x150 Cu',
            bbox: {
                x_min: 0.149,
                y_min: 0.541,
                x_max: 0.218,
                y_max: 0.547
            },
            page: 1
        },
        conductor_pe: {
            value: 'PE : 1x95 Cu',
            bbox: {
                x_min: 0.149,
                y_min: 0.552,
                x_max: 0.215,
                y_max: 0.558
            },
            page: 1
        }
    },

    changeover_switch_wc8_left: {
        designation: {
            value: 'WC 8',
            bbox: {
                x_min: 0.23,
                y_min: 0.524,
                x_max: 0.258,
                y_max: 0.53
            },
            page: 1
        },
        rating: {
            value: 'KTA',
            bbox: {
                x_min: 0.23,
                y_min: 0.536,
                x_max: 0.252,
                y_max: 0.542
            },
            page: 1
        },
        current: {
            value: '800 A',
            bbox: {
                x_min: 0.23,
                y_min: 0.547,
                x_max: 0.258,
                y_max: 0.553
            },
            page: 1
        }
    },

    circuit_breaker_qa4_left: {
        designation: {
            value: 'QA 4',
            bbox: {
                x_min: 0.062,
                y_min: 0.583,
                x_max: 0.09,
                y_max: 0.589
            },
            page: 1
        },
        type: {
            value: 'NSXm160E',
            bbox: {
                x_min: 0.062,
                y_min: 0.595,
                x_max: 0.127,
                y_max: 0.601
            },
            page: 1
        },
        trip_unit: {
            value: 'TM-D',
            bbox: {
                x_min: 0.062,
                y_min: 0.606,
                x_max: 0.093,
                y_max: 0.612
            },
            page: 1
        },
        rating: {
            value: '160 A / 4P4d',
            bbox: {
                x_min: 0.062,
                y_min: 0.617,
                x_max: 0.13,
                y_max: 0.623
            },
            page: 1
        }
    },

    circuit_breaker_qa10_left: {
        designation: {
            value: 'QA 10',
            bbox: {
                x_min: 0.149,
                y_min: 0.583,
                x_max: 0.184,
                y_max: 0.589
            },
            page: 1
        },
        type: {
            value: 'NSX250B',
            bbox: {
                x_min: 0.149,
                y_min: 0.595,
                x_max: 0.202,
                y_max: 0.601
            },
            page: 1
        },
        protection: {
            value: 'Micrologic 5.2 E',
            bbox: {
                x_min: 0.149,
                y_min: 0.606,
                x_max: 0.227,
                y_max: 0.612
            },
            page: 1
        },
        rating: {
            value: '250 A / 4P4d',
            bbox: {
                x_min: 0.149,
                y_min: 0.617,
                x_max: 0.218,
                y_max: 0.623
            },
            page: 1
        }
    },

    disconnector_wd4_left: {
        designation: {
            value: 'WD 4',
            bbox: {
                x_min: 0.062,
                y_min: 0.705,
                x_max: 0.09,
                y_max: 0.711
            },
            page: 1
        },
        rating: {
            value: '5 m',
            bbox: {
                x_min: 0.062,
                y_min: 0.717,
                x_max: 0.082,
                y_max: 0.723
            },
            page: 1
        },
        conductor_ph: {
            value: 'Ph : 1x50 Cu',
            bbox: {
                x_min: 0.062,
                y_min: 0.729,
                x_max: 0.127,
                y_max: 0.735
            },
            page: 1
        },
        conductor_ne: {
            value: 'Ne : 1x50 Cu',
            bbox: {
                x_min: 0.062,
                y_min: 0.74,
                x_max: 0.127,
                y_max: 0.746
            },
            page: 1
        },
        conductor_pe: {
            value: 'PE : 1x35 Cu',
            bbox: {
                x_min: 0.062,
                y_min: 0.751,
                x_max: 0.127,
                y_max: 0.757
            },
            page: 1
        }
    },

    disconnector_wd10_left: {
        designation: {
            value: 'WD 10',
            bbox: {
                x_min: 0.149,
                y_min: 0.705,
                x_max: 0.184,
                y_max: 0.711
            },
            page: 1
        },
        rating: {
            value: '5 m',
            bbox: {
                x_min: 0.149,
                y_min: 0.717,
                x_max: 0.169,
                y_max: 0.723
            },
            page: 1
        },
        conductor_ph: {
            value: 'Ph : 1x70 Cu',
            bbox: {
                x_min: 0.149,
                y_min: 0.729,
                x_max: 0.215,
                y_max: 0.735
            },
            page: 1
        },
        conductor_ne: {
            value: 'Ne : 1x70 Cu',
            bbox: {
                x_min: 0.149,
                y_min: 0.74,
                x_max: 0.215,
                y_max: 0.746
            },
            page: 1
        },
        conductor_pe: {
            value: 'PE : 1x35 Cu',
            bbox: {
                x_min: 0.149,
                y_min: 0.751,
                x_max: 0.215,
                y_max: 0.757
            },
            page: 1
        }
    },

    load_aa4_left: {
        designation: {
            value: 'AA 4',
            bbox: {
                x_min: 0.062,
                y_min: 0.769,
                x_max: 0.09,
                y_max: 0.775
            },
            page: 1
        },
        current: {
            value: '160 A',
            bbox: {
                x_min: 0.062,
                y_min: 0.781,
                x_max: 0.093,
                y_max: 0.787
            },
            page: 1
        },
        power_factor: {
            value: 'P.F. : 0.85',
            bbox: {
                x_min: 0.062,
                y_min: 0.792,
                x_max: 0.113,
                y_max: 0.798
            },
            page: 1
        },
        circuits: {
            value: 'Nbr. of circuits : 1',
            bbox: {
                x_min: 0.062,
                y_min: 0.803,
                x_max: 0.149,
                y_max: 0.809
            },
            page: 1
        },
        priority: {
            value: 'Ku : 1',
            bbox: {
                x_min: 0.062,
                y_min: 0.814,
                x_max: 0.093,
                y_max: 0.82
            },
            page: 1
        }
    },

    load_aa10_left: {
        designation: {
            value: 'AA 10',
            bbox: {
                x_min: 0.149,
                y_min: 0.769,
                x_max: 0.184,
                y_max: 0.775
            },
            page: 1
        },
        current: {
            value: '200 A',
            bbox: {
                x_min: 0.149,
                y_min: 0.781,
                x_max: 0.178,
                y_max: 0.787
            },
            page: 1
        },
        power_factor: {
            value: 'P.F. : 0.85',
            bbox: {
                x_min: 0.149,
                y_min: 0.792,
                x_max: 0.199,
                y_max: 0.798
            },
            page: 1
        },
        circuits: {
            value: 'Nbr. of circuits : 1',
            bbox: {
                x_min: 0.149,
                y_min: 0.803,
                x_max: 0.236,
                y_max: 0.809
            },
            page: 1
        },
        priority: {
            value: 'Ku : 1',
            bbox: {
                x_min: 0.149,
                y_min: 0.814,
                x_max: 0.178,
                y_max: 0.82
            },
            page: 1
        }
    },

    // Right Side Components
    transformer_w5_right: {
        designation: {
            value: 'W 5 (1)',
            bbox: {
                x_min: 0.714,
                y_min: 0.031,
                x_max: 0.756,
                y_max: 0.036
            },
            page: 1
        },
        voltage: {
            value: '20 kV',
            bbox: {
                x_min: 0.714,
                y_min: 0.04,
                x_max: 0.746,
                y_max: 0.045
            },
            page: 1
        },
        power_rating: {
            value: '250 / 500 MVA',
            bbox: {
                x_min: 0.714,
                y_min: 0.048,
                x_max: 0.793,
                y_max: 0.054
            },
            page: 1
        }
    },

    circuit_breaker_mvqa5_right: {
        designation: {
            value: 'MVQA 5 (1)',
            bbox: {
                x_min: 0.714,
                y_min: 0.088,
                x_max: 0.778,
                y_max: 0.094
            },
            page: 1
        }
    },

    disconnector_mvwd5_right: {
        designation: {
            value: 'MVWD 5 (1)',
            bbox: {
                x_min: 0.714,
                y_min: 0.111,
                x_max: 0.778,
                y_max: 0.117
            },
            page: 1
        },
        rating: {
            value: '10 m',
            bbox: {
                x_min: 0.714,
                y_min: 0.123,
                x_max: 0.737,
                y_max: 0.129
            },
            page: 1
        },
        current: {
            value: '1 x 185 Al',
            bbox: {
                x_min: 0.714,
                y_min: 0.135,
                x_max: 0.765,
                y_max: 0.141
            },
            page: 1
        }
    },

    current_transformer_ta5_right: {
        designation: {
            value: 'TA 5 (1)',
            bbox: {
                x_min: 0.714,
                y_min: 0.175,
                x_max: 0.759,
                y_max: 0.181
            },
            page: 1
        },
        type: {
            value: 'Trihal',
            bbox: {
                x_min: 0.714,
                y_min: 0.186,
                x_max: 0.746,
                y_max: 0.192
            },
            page: 1
        },
        voltage_rating: {
            value: '250 VRMS',
            bbox: {
                x_min: 0.714,
                y_min: 0.197,
                x_max: 0.765,
                y_max: 0.203
            },
            page: 1
        },
        power_rating: {
            value: '250 kVA',
            bbox: {
                x_min: 0.714,
                y_min: 0.208,
                x_max: 0.756,
                y_max: 0.214
            },
            page: 1
        },
        secondary_voltage: {
            value: '20 kV / 400 V',
            bbox: {
                x_min: 0.714,
                y_min: 0.219,
                x_max: 0.784,
                y_max: 0.225
            },
            page: 1
        },
        class: {
            value: 'TN-S',
            bbox: {
                x_min: 0.714,
                y_min: 0.23,
                x_max: 0.743,
                y_max: 0.236
            },
            page: 1
        }
    },

    disconnector_wd5_right: {
        designation: {
            value: 'WD 5 (1)',
            bbox: {
                x_min: 0.714,
                y_min: 0.246,
                x_max: 0.759,
                y_max: 0.252
            },
            page: 1
        },
        rating: {
            value: '5 m',
            bbox: {
                x_min: 0.714,
                y_min: 0.258,
                x_max: 0.734,
                y_max: 0.264
            },
            page: 1
        },
        conductor_ph: {
            value: 'Ph : 1x150 Cu',
            bbox: {
                x_min: 0.714,
                y_min: 0.27,
                x_max: 0.784,
                y_max: 0.276
            },
            page: 1
        },
        conductor_ne: {
            value: 'Ne : 1x150 Cu',
            bbox: {
                x_min: 0.714,
                y_min: 0.281,
                x_max: 0.784,
                y_max: 0.287
            },
            page: 1
        },
        conductor_pe: {
            value: 'PE : 1x95 Cu',
            bbox: {
                x_min: 0.714,
                y_min: 0.292,
                x_max: 0.781,
                y_max: 0.298
            },
            page: 1
        }
    },

    circuit_breaker_qa5_right: {
        designation: {
            value: 'QA 5 (1)',
            bbox: {
                x_min: 0.714,
                y_min: 0.316,
                x_max: 0.759,
                y_max: 0.322
            },
            page: 1
        },
        type: {
            value: 'NSX400F',
            bbox: {
                x_min: 0.714,
                y_min: 0.328,
                x_max: 0.765,
                y_max: 0.334
            },
            page: 1
        },
        protection: {
            value: 'Micrologic 5.3 E',
            bbox: {
                x_min: 0.714,
                y_min: 0.339,
                x_max: 0.793,
                y_max: 0.345
            },
            page: 1
        },
        rating: {
            value: '400 A / 4P4d',
            bbox: {
                x_min: 0.714,
                y_min: 0.35,
                x_max: 0.781,
                y_max: 0.356
            },
            page: 1
        }
    },

    load_center_uc7_right: {
        designation: {
            value: 'UC 7 (1)',
            bbox: {
                x_min: 0.536,
                y_min: 0.328,
                x_max: 0.58,
                y_max: 0.334
            },
            page: 1
        },
        preference: {
            value: 'No preference',
            bbox: {
                x_min: 0.536,
                y_min: 0.342,
                x_max: 0.614,
                y_max: 0.348
            },
            page: 1
        },
        status: {
            value: 'Undefined',
            bbox: {
                x_min: 0.536,
                y_min: 0.353,
                x_max: 0.589,
                y_max: 0.359
            },
            page: 1
        },
        priority: {
            value: '0',
            bbox: {
                x_min: 0.536,
                y_min: 0.364,
                x_max: 0.543,
                y_max: 0.37
            },
            page: 1
        }
    },

    changeover_switch_wc6_right: {
        designation: {
            value: 'WC 6 (1)',
            bbox: {
                x_min: 0.828,
                y_min: 0.35,
                x_max: 0.869,
                y_max: 0.356
            },
            page: 1
        }
    },

    feeder_circuit_qa9_right: {
        designation: {
            value: 'QA 9 (1)',
            bbox: {
                x_min: 0.574,
                y_min: 0.412,
                x_max: 0.617,
                y_max: 0.418
            },
            page: 1
        },
        type: {
            value: 'NSX400F',
            bbox: {
                x_min: 0.574,
                y_min: 0.424,
                x_max: 0.627,
                y_max: 0.43
            },
            page: 1
        },
        protection: {
            value: 'Micrologic 5.3 E',
            bbox: {
                x_min: 0.574,
                y_min: 0.435,
                x_max: 0.652,
                y_max: 0.441
            },
            page: 1
        },
        rating: {
            value: '400 A / 4P4d',
            bbox: {
                x_min: 0.574,
                y_min: 0.446,
                x_max: 0.643,
                y_max: 0.452
            },
            page: 1
        }
    },

    disconnector_wd9_right: {
        designation: {
            value: 'WD 9 (1)',
            bbox: {
                x_min: 0.574,
                y_min: 0.506,
                x_max: 0.617,
                y_max: 0.512
            },
            page: 1
        },
        rating: {
            value: '5 m',
            bbox: {
                x_min: 0.574,
                y_min: 0.518,
                x_max: 0.594,
                y_max: 0.524
            },
            page: 1
        },
        conductor_ph: {
            value: 'Ph : 1x150 Cu',
            bbox: {
                x_min: 0.574,
                y_min: 0.53,
                x_max: 0.643,
                y_max: 0.536
            },
            page: 1
        },
        conductor_ne: {
            value: 'Ne : 1x150 Cu',
            bbox: {
                x_min: 0.574,
                y_min: 0.541,
                x_max: 0.643,
                y_max: 0.547
            },
            page: 1
        },
        conductor_pe: {
            value: 'PE : 1x95 Cu',
            bbox: {
                x_min: 0.574,
                y_min: 0.552,
                x_max: 0.64,
                y_max: 0.558
            },
            page: 1
        }
    },

    changeover_switch_wc8_right: {
        designation: {
            value: 'WC 8 (1)',
            bbox: {
                x_min: 0.655,
                y_min: 0.524,
                x_max: 0.696,
                y_max: 0.53
            },
            page: 1
        },
        rating: {
            value: 'KSA',
            bbox: {
                x_min: 0.655,
                y_min: 0.536,
                x_max: 0.677,
                y_max: 0.542
            },
            page: 1
        },
        current: {
            value: '400 A',
            bbox: {
                x_min: 0.655,
                y_min: 0.547,
                x_max: 0.683,
                y_max: 0.553
            },
            page: 1
        }
    },

    circuit_breaker_qa4_right: {
        designation: {
            value: 'QA 4 (1)',
            bbox: {
                x_min: 0.487,
                y_min: 0.583,
                x_max: 0.528,
                y_max: 0.589
            },
            page: 1
        },
        type: {
            value: 'NSXm160E',
            bbox: {
                x_min: 0.487,
                y_min: 0.595,
                x_max: 0.552,
                y_max: 0.601
            },
            page: 1
        },
        trip_unit: {
            value: 'TM-D',
            bbox: {
                x_min: 0.487,
                y_min: 0.606,
                x_max: 0.518,
                y_max: 0.612
            },
            page: 1
        },
        rating: {
            value: '160 A / 4P4d',
            bbox: {
                x_min: 0.487,
                y_min: 0.617,
                x_max: 0.555,
                y_max: 0.623
            },
            page: 1
        }
    },

    circuit_breaker_qa10_right: {
        designation: {
            value: 'QA 10 (1)',
            bbox: {
                x_min: 0.574,
                y_min: 0.583,
                x_max: 0.62,
                y_max: 0.589
            },
            page: 1
        },
        type: {
            value: 'NSX250B',
            bbox: {
                x_min: 0.574,
                y_min: 0.595,
                x_max: 0.627,
                y_max: 0.601
            },
            page: 1
        },
        protection: {
            value: 'Micrologic 5.2 E',
            bbox: {
                x_min: 0.574,
                y_min: 0.606,
                x_max: 0.652,
                y_max: 0.612
            },
            page: 1
        },
        rating: {
            value: '250 A / 4P4d',
            bbox: {
                x_min: 0.574,
                y_min: 0.617,
                x_max: 0.643,
                y_max: 0.623
            },
            page: 1
        }
    },

    disconnector_wd4_right: {
        designation: {
            value: 'WD 4 (1)',
            bbox: {
                x_min: 0.487,
                y_min: 0.705,
                x_max: 0.528,
                y_max: 0.711
            },
            page: 1
        },
        rating: {
            value: '5 m',
            bbox: {
                x_min: 0.487,
                y_min: 0.717,
                x_max: 0.507,
                y_max: 0.723
            },
            page: 1
        },
        conductor_ph: {
            value: 'Ph : 1x50 Cu',
            bbox: {
                x_min: 0.487,
                y_min: 0.729,
                x_max: 0.552,
                y_max: 0.735
            },
            page: 1
        },
        conductor_ne: {
            value: 'Ne : 1x50 Cu',
            bbox: {
                x_min: 0.487,
                y_min: 0.74,
                x_max: 0.552,
                y_max: 0.746
            },
            page: 1
        },
        conductor_pe: {
            value: 'PE : 1x25 Cu',
            bbox: {
                x_min: 0.487,
                y_min: 0.751,
                x_max: 0.552,
                y_max: 0.757
            },
            page: 1
        }
    },

    disconnector_wd10_right: {
        designation: {
            value: 'WD 10 (1)',
            bbox: {
                x_min: 0.574,
                y_min: 0.705,
                x_max: 0.62,
                y_max: 0.711
            },
            page: 1
        },
        rating: {
            value: '5 m',
            bbox: {
                x_min: 0.574,
                y_min: 0.717,
                x_max: 0.594,
                y_max: 0.723
            },
            page: 1
        },
        conductor_ph: {
            value: 'Ph : 1x70 Cu',
            bbox: {
                x_min: 0.574,
                y_min: 0.729,
                x_max: 0.64,
                y_max: 0.735
            },
            page: 1
        },
        conductor_ne: {
            value: 'Ne : 1x70 Cu',
            bbox: {
                x_min: 0.574,
                y_min: 0.74,
                x_max: 0.64,
                y_max: 0.746
            },
            page: 1
        },
        conductor_pe: {
            value: 'PE : 1x35 Cu',
            bbox: {
                x_min: 0.574,
                y_min: 0.751,
                x_max: 0.64,
                y_max: 0.757
            },
            page: 1
        }
    },

    load_aa4_right: {
        designation: {
            value: 'AA 4 (1)',
            bbox: {
                x_min: 0.487,
                y_min: 0.769,
                x_max: 0.528,
                y_max: 0.775
            },
            page: 1
        },
        current: {
            value: '160 A',
            bbox: {
                x_min: 0.487,
                y_min: 0.781,
                x_max: 0.518,
                y_max: 0.787
            },
            page: 1
        },
        power_factor: {
            value: 'P.F. : 0.85',
            bbox: {
                x_min: 0.487,
                y_min: 0.792,
                x_max: 0.538,
                y_max: 0.798
            },
            page: 1
        },
        circuits: {
            value: 'Nbr. of circuits : 1',
            bbox: {
                x_min: 0.487,
                y_min: 0.803,
                x_max: 0.574,
                y_max: 0.809
            },
            page: 1
        },
        priority: {
            value: 'Ku : 1',
            bbox: {
                x_min: 0.487,
                y_min: 0.814,
                x_max: 0.518,
                y_max: 0.82
            },
            page: 1
        }
    },

    load_aa10_right: {
        designation: {
            value: 'AA 10 (1)',
            bbox: {
                x_min: 0.574,
                y_min: 0.769,
                x_max: 0.62,
                y_max: 0.775
            },
            page: 1
        },
        current: {
            value: '200 A',
            bbox: {
                x_min: 0.574,
                y_min: 0.781,
                x_max: 0.603,
                y_max: 0.787
            },
            page: 1
        },
        power_factor: {
            value: 'P.F. : 0.85',
            bbox: {
                x_min: 0.574,
                y_min: 0.792,
                x_max: 0.624,
                y_max: 0.798
            },
            page: 1
        },
        circuits: {
            value: 'Nbr. of circuits : 1',
            bbox: {
                x_min: 0.574,
                y_min: 0.803,
                x_max: 0.661,
                y_max: 0.809
            },
            page: 1
        },
        priority: {
            value: 'Ku : 1',
            bbox: {
                x_min: 0.574,
                y_min: 0.814,
                x_max: 0.603,
                y_max: 0.82
            },
            page: 1
        }
    }
};
