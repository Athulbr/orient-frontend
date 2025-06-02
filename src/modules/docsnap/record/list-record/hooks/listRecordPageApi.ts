import { useParams } from 'react-router-dom';
import { useToastStore } from '../../../../../components/toast/ToastStore';
import httpRequest from '../../../../../utils/httpRequest';

export const useFetchListRecord = () => {
  const { id } = useParams();
  const toast = useToastStore();

  // ============================= CREATE ==================================

  const createRecordApi = async (requestBody: any) => {
    try {
      const res = await httpRequest('POST', `${import.meta.env.VITE_API_URL}/api/idp/history/create`, requestBody);
      toast.success('Record created successfully');
      return res;
    } catch (error) {
      console.log('error:===========', error);
      toast.error('Failed to Create record');
    }
  };
  const updateRecordApi = async (requestBody: any, id: string) => {
    try {
      const res = await httpRequest('PATCH', `${import.meta.env.VITE_API_URL}/api/idp/history/update/${id}`, requestBody);
      toast.success('Record created successfully');
    } catch (error) {
      console.log('error:===========', error);
      toast.error('Failed to Create record');
    }
  };

  return { createRecordApi, updateRecordApi };
};
