import { useNavigate, useParams } from 'react-router-dom';
import { useViewRecordState } from './viewRecordContext';
import { useToastStore } from '../../../../../components/toast/ToastStore';
import httpRequest from '../../../../../global-utils/httpRequest';
import { fileTypeFromBuffer } from 'file-type';
import { convertPdfToImages, filterExtractedDataForInvoiceGeneration } from '../utils';
import { useS3Storage } from '../../../../../zustand-store/S3Storage';

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
      const res: any = await httpRequest('GET', `${import.meta.env.VITE_NODE_URL}/idp/history/${id}`);
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
      if (res.data?.imageFileNames?.length > 0) {
        const images = await Promise.all(res.data?.imageFileNames?.map((fileName: string) => getS3File(fileName)));
        console.log('images', images);
        setState(prev => ({
          ...prev,
          loadingS3File: false,
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
    setState(prev => ({ ...prev, chatLoading: true, messages: [...prev.messages, { text: message, userMessage: true }] }));
    const requestBody = { query: message, botName: state.record?.pdfFileName };
    const response: any = await httpRequest('POST', `${import.meta.env.VITE_PYTHON_URL}/chatbot/v2/query`, requestBody);
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
      
      // Usage in your payload
      const payload = {
        template: state?.record?.templateId,
        extractedData: state?.record?.extractedData,
        metadata: state?.record?.metadata,
        fileName: state?.record?.name,
        updatedData: processArrayFields()
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


