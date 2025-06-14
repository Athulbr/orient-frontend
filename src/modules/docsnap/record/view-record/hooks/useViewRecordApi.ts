import { useNavigate, useParams } from 'react-router-dom';
import { useViewRecordState } from './viewRecordContext';
import { useToastStore } from '../../../../../components/toast/ToastStore';
import { useEffect } from 'react';
import httpRequest from '../../../../../utils/httpRequest';
import { fileTypeFromBuffer } from 'file-type';
import { convertPdfToImages } from '../utils';
import { useViewRecordGlobalStore } from './useViewRecordGlobalStore';
import { useS3DocumentsStore } from '../../../../../hooks/useStoredDocuments';

export const useViewRecordApi = () => {
  const { state, setState } = useViewRecordState();
  const { id } = useParams();
  const navigate = useNavigate();
  const toast = useToastStore();
  const { refresh } = useViewRecordGlobalStore();
  const { getS3File } = useS3DocumentsStore();

  useEffect(() => {
    if (!id) return;
    getRecordApiById(id);
  }, [id, refresh]);

  // ============================= Get Record By Id ==================================

  const getAndConvertDocumentToImage = async (pdfFileName: string) => {
    const s3Response = await getS3File(pdfFileName);
    const imageData = s3Response?.data?.Body?.data;
    if (!imageData) {
      toast.error('S3 document not found');
      return;
    }
    const uint8Array = new Uint8Array(imageData);
    const getFileType = await fileTypeFromBuffer(uint8Array);
    let pdfFile: any;
    let imageUrl;
    if (getFileType?.mime && getFileType?.mime !== 'application/pdf') {
      pdfFile = await binaryToFile(uint8Array, `image.${getFileType.ext}`, getFileType?.mime);
      imageUrl = [URL.createObjectURL(pdfFile).toString()];
    } else {
      pdfFile = await binaryToFile(uint8Array, `document.${getFileType?.ext}`, getFileType?.mime);
      imageUrl = await convertPdfToImages(pdfFile);
    }

    setState(prev => ({ ...prev, loadingS3File: false, images: imageUrl }));
  };

  const getRecordApiById = async (id: string) => {
    try {
      setState(prev => ({ ...prev, loadingData: true, loadingS3File: true }));
      const res: any = await httpRequest('GET', `${import.meta.env.VITE_NODE_URL}/api/idp/history/${id}`);

      getAndConvertDocumentToImage(res.data.pdfFileName);
      const topLevelFields: Record<string, any> = {};
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
          } else if (typeof value === 'object' && value !== null) {
            // its Key Value
            topLevelFields[key] = value;
          }
        });
      }
      setState(prev => ({ ...prev, topLevelFields, record: res.data, objectFields, arrayFields, tableNames, loadingData: false }));
    } catch (error) {
      console.log('error:===========', error);
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
          userMessage: true,
        },
      ],
    }));

    const requestBody = {
      query: message,
      botName: state.record?.pdfFileName,
    };

    const response: any = await httpRequest('POST', `https://dev.makez.ai/chatbot/query`, requestBody);

    setState(prev => ({
      ...prev,
      chatLoading: false,
      messages: [
        ...prev.messages,
        {
          text: response.answer,
          source: response.source_documents,
          userMessage: false,
        },
      ],
    }));
  };

  const updateRecordApiById = async () => {
    try {
      const payload = {
        document: state.record.document,
        extractedData: state.record.extractedData,
        metadata: state.record.metadata,
        updatedData: { ...state.topLevelFields, ...state.objectFields, line_items: state.arrayFields[0] },
      };

      setState(prev => ({ ...prev, loadingData: true, loadingS3File: true }));
      const res: any = await httpRequest('PATCH', `${import.meta.env.VITE_NODE_URL}/api/idp/history/update/${id}`, payload);
      toast.success('Record updated successfully');
      navigate('/');
    } catch (error) {
      console.log('error:===========', error);
      toast.error('Failed to update Record');
    } finally {
      setState(prev => ({ ...prev, loadingData: false }));
    }
  };

  return { getRecordApiById, sendMessage, updateRecordApiById };
};

const binaryToFile = async (binaryData: Uint8Array, fileName: string, mimeType: string = 'application/pdf'): Promise<File> => {
  const blob = new Blob([binaryData], { type: mimeType });
  return new File([blob], fileName, { type: mimeType });
};
