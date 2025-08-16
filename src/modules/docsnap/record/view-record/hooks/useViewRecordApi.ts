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
            const res: any = await httpRequest('GET', `${import.meta.env.VITE_NODE_URL}/idp/history/${id}`);
            if (res.data?.imageFileNames?.length > 0) {
                const images = await Promise.all(res.data?.imageFileNames?.map((fileName: string) => getS3File(fileName)));
                console.log('images', images);
                setState(prev => ({
                    ...prev,
                    loadingS3File: false,
                    images: images.map((image: any) => URL.createObjectURL(new Blob([new Uint8Array(image.data.Body.data)], { type: 'image/jpeg' })))
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
        setState(prev => ({ ...prev, chatLoading: true, messages: [...prev.messages, { text: message, userMessage: true }] }));
        const requestBody = { query: message, botName: state.record?.pdfFileName };
        const response: any = await httpRequest('POST', `https://demo.makez.ai/chatbot/query`, requestBody);
        setState(prev => ({
            ...prev,
            chatLoading: false,
            messages: [...prev.messages, { text: response.answer, source: response.source_documents, userMessage: false }]
        }));
    };
    const sendMessageToNode = async (query: string) => {
        setState(prev => ({ ...prev, chatLoading: true, messages: [...prev.messages, { text: query, userMessage: true }] }));
        const requestBody = { query, visionOcrText: state.record?.visionOcrText, chatList: state.messages };
        const response: any = await httpRequest('POST', `${import.meta.env.VITE_NODE_URL}/idp/project/send-message`, requestBody);
        setState(prev => ({
            ...prev,
            chatLoading: false,
            messages: [...prev.messages, { text: response.data.response, userMessage: false }]
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
            setState(prev => ({ ...prev, loadingData: true }));
            const res: any = await httpRequest('POST', `${import.meta.env.VITE_NODE_URL}/idp/history/rehab/create`, payload);
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
            // Convert arrayFields[0] (Record<string, Record<string, { value: string }>>) to array of row objects
            const lineItemsRecord = state?.arrayFields[0] || {};
            const lineItemsArray = Object.values(lineItemsRecord).map(rowObj => {
                const flatRow: Record<string, any> = {};
                Object.entries(rowObj).forEach(([col, valObj]) => {
                    // Copy all properties (value, page, bbox, confidence, etc.)
                    flatRow[col] = { ...valObj };
                });
                return flatRow;
            });
            const payload = {
                template: state?.record?.templateId,
                extractedData: state?.record?.extractedData,
                metadata: state?.record?.metadata,
                fileName: state?.record?.name,
                updatedData: {
                    ...state?.objectFields,
                    line_items: lineItemsArray
                }
            };
            setState(prev => ({ ...prev, loadingData: true, loadingS3File: true }));
            const res: any = await httpRequest('PATCH', `${import.meta.env.VITE_NODE_URL}/idp/history/update/${id}`, payload);
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
            const res: any = await httpRequest('PATCH', `${import.meta.env.VITE_NODE_URL}/idp/history/update/${id}`, { extractedData });
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
            const res: any = await httpRequest('POST', `${import.meta.env.VITE_NODE_URL}/idp/history/generate-invoice`, {
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
            const res: any = await httpRequest('POST', `${import.meta.env.VITE_NODE_URL}/idp/request/create`, requestBody);
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
            const res: any = await httpRequest('POST', `${import.meta.env.VITE_NODE_URL}/idp/comment/create`, requestBody);

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
        createComment,
        sendMessageToNode
    };
};

export const binaryToFile = async (binaryData: Uint8Array, fileName: string, mimeType: string = 'application/pdf'): Promise<File> => {
    const blob = new Blob([binaryData], { type: mimeType });
    return new File([blob], fileName, { type: mimeType });
};

const visionOcrText = [
    'RehabMart\nTools for the job of living\nwww.rehabmart.com\nOFFICIAL QUOTE\n3651 Mars Hill Rd, Bldg 2400\nWatkinsville, GA 30677\nDate\n7/8/2025\nQuote ID\nQT66607MD\nQuotes Dept: RFQ@rehabmart.com Submit Your PO: QuotePO@rehabmart.com\nBill To\nShip To\nBirmingham VA Medical Center\nSohini Parekh\n700 19th St S\nBirmingham, AL 35294-1927\nRM Rep\nSHIP DATE\nSHIP VIA\nMD\nQty Item Code / $ Amount / Product Description\nBirmingham VA Medical Center\nSohini Parekh\n700 19th St S\nBirmingham, AL 35294-1927\nQUOTE VALID FOR\n30 Days Subject to product availability\nHAU-1428-47-113 --> $5,176.00 Hausmann Hi-Lo Bariatric Mat\nTable with Power Backrest Hausmann Hi-Lo Bariatric Mat Table\nwith Power Backrest - 4 ft. x 7 ft. Bariatric Mat Table with Blue\nUpholstery\nHAU-LOADDOCK --> $450.00 Hausmann Hi-Lo Bariatric Mat\nTable with Power Backrest Delivery Method - Dock-to-Dock\nLoad Dock Delivery (Delivery Driver Will NOT Unload Items)\nFor Businesses with Loading Docks\nProduct URL: https://www.rehabmart.com/product/46255.html\nPrice Each\nAmount\n5,626.00\n5,626.00\nConvenient ways to place your order:\nSubtotal:\n$5,626.00\nCheckout Online at Rehabmart.com using your Custom Quote Code:\nQT66607MD\nCopy/paste this code in shopping cart or use this link:\nhttps://www.rehabmart.com/quotes/QT66607MD\n-\nEmail Your Purchase Order to QuotePO@rehabmart.com\nFax Your Purchase Order to 678-254-1791\nMail a check (payable to Rehabmart.com) for the full amount to the\naddress listed above. Please include your quote number on your check\nand/or a copy of your quote document.\n- ACH Payment Transfer:\nCompany Name: Rehabmart.com\nBank Name: Pinnacle Bank\nRouting Account Number: 061101294\nChecking Account Number: 100031657\nSales Tax:\n$0.00\nPinnacle Bank Phone # 706-283-2854Lift Gate Disclaimer: The\nproduct(s) listed in this quote were quoted for standard freight/',
    'loading dock delivery. If your delivery location does not have a\nloading dock, then your product(s) must be transferred at the shipping\nterminal from a box trailer truck to a lift gate truck, which is a\nhydraulic-powered platform that moves freight up and down from the\nrear of the truck. The lift gate delivery charge is $250, and this charge\nmust be paid by the customer prior to product delivery.\nAdditional freight costs may apply to your order at the time of\npurchasing your quoted items. Read more:\nhttps://www.rehabmart.com/quotes.asp\nPlease verify the products listed above to confirm this quote represents\nthe exact products you intend to purchase. Make color choices, fabric\nchoices, and choose applicable product options before submitting your\nfinal order.\nTotal:\n$5,626.00\nReturn Policy Notification: All purchase orders are subject to the return policy, order policy, pricing\nerrors policy and restocking fee policy. Please review all Rehabmart policies by visiting our policy\npage at: https://www.rehabmart.com/policies/\nRehabmart.com\nFederal Tax ID: 58-2515167\nSBA Customer ID: P1002610\nHub Zone Certification # 39450\nDUNS #051112832\nGSA 65IIA Contract # 36F79725D0088\nGSA 651IF Contract # 36F79723D0029\nCAGE Code: 56Z51\nQuestions? Quotes Team: RFQ@rehabmart.com | Call: 706-213-1144 / 800-827-8283 | Fax:\n678-254-1791\nTHANK YOU FOR CONSIDERING REHABMART.COM'
];

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

const images = [
    {
        success: true,
        data: {
            AcceptRanges: 'bytes',
            LastModified: '2025-08-10T11:09:19.000Z',
            ContentLength: 760557,
            ETag: '"afcbb89b6794d3df322be743b17575f1"',
            ContentType: 'application/octet-stream',
            ServerSideEncryption: 'AES256',
            Metadata: {},
            Body: {
                type: 'Buffer',
                data: [22, 33, 44, 55]
            }
        },
        message: 'File Get Successfully',
        error: null
    },
    {
        success: true,
        data: {
            AcceptRanges: 'bytes',
            LastModified: '2025-08-10T11:09:19.000Z',
            ContentLength: 716869,
            ETag: '"b9c51d6340009978df5770dc7abe0449"',
            ContentType: 'application/octet-stream',
            ServerSideEncryption: 'AES256',
            Metadata: {},
            Body: {
                type: 'Buffer',
                data: [22, 33, 44, 55]
            }
        },
        message: 'File Get Successfully',
        error: null
    }
];
