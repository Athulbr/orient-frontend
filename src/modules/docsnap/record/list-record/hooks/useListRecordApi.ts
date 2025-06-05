import { useParams } from 'react-router-dom';
import { useToastStore } from '../../../../../components/toast/ToastStore';
import httpRequest from '../../../../../utils/httpRequest';
import httpUploadRequest from '../../../../../utils/httpUploadRequest';
import { useListRecordPageState } from './listRecordPageContext';

export const useListRecordApi = () => {
  const { id } = useParams();
  const toast = useToastStore();
  const { state, setState } = useListRecordPageState();

  // ============================= CREATE ==================================

  const createRecordApi = async (requestBody: any) => {
    try {
      const res = await httpRequest('POST', `${import.meta.env.VITE_API_URL}/api/idp/history/create`, requestBody);
      toast.success('Record created successfully');
      return res;
    } catch (error) {
      toast.error('Failed to Create record');
    }
  };
  const updateRecordApi = async (requestBody: any, id: string) => {
    try {
      const res = await httpRequest('PATCH', `${import.meta.env.VITE_API_URL}/api/idp/history/update/${id}`, requestBody);
      toast.success('Record created successfully');
    } catch (error) {
      toast.error('Failed to Create record');
    }
  };
  const deleteRecordApi = async (id: string) => {
    try {
      const res = await httpRequest('DELETE', `${import.meta.env.VITE_API_URL}/api/idp/history/delete/${id}`);
      setState(prev => ({ ...prev, refresh: prev.refresh + 1 }));
      toast.success('Record deleted successfully');
    } catch (error) {
      toast.error('Failed to delete record');
    }
  };

  const uploadFilesToAwsS3 = async (file: File) => {
    try {
      setState(prev => ({ ...prev, processing: true, uploading: true }));

      const res = await httpUploadRequest(`${import.meta.env.VITE_API_URL}/api/idp/document/upload`, file);
      setState(prev => ({ ...prev, uploading: false, uploadDone: true, analyzing: true }));

      return { s3FileName: res.data.fileName, s3FileType: res.data.fileType, url: res.data.url };
    } catch (error) {
      setState(prev => ({ ...prev, processing: false }));
    }
  };

  const trainChatWithDocumentEngine = async (s3fileName: string, s3Url: string) => {
    const response = await fetch(`${import.meta.env.VITE_BASR_URL}/chatbot/upload`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        source: [
          {
            name: s3fileName,
            fileType: 'application/pdf',
            url: s3Url,
            active: true,
          },
        ],
        botName: s3fileName || 'Testbot',
      }),
    });
    const reader = response?.body?.getReader();
    if (!reader) {
      toast.error('Error in training the bot');
      return null;
    }
    while (true) {
      const { value, done } = await reader?.read();
      if (done) {
        // setloader(false);
        toast.success('Document Bot trained successfully');
        break;
      } else {
        // showToast('success', decoder.decode(value));
        toast.error('Failed to train Document Bot ');
      }
    }
  };

  return { createRecordApi, updateRecordApi, deleteRecordApi, uploadFilesToAwsS3, trainChatWithDocumentEngine };
};
