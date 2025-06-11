import { useParams } from 'react-router-dom';
import { useProjectState } from './projectContext';
import { useToastStore } from '../../../../components/toast/ToastStore';
import httpRequest from '../../../../utils/httpRequest';

export const useFetchCreateTB = () => {
  const { setState } = useProjectState();
  const { id } = useParams();
  const toast = useToastStore();

  // ============================= CREATE ==================================

  const createProjectApi = async (requestBody: any) => {
    try {
      const res = httpRequest('POST', `/api/idp/project`, requestBody);
    } catch (error) {
      console.error('error:===========', error);
      toast.error('Failed to Create Project');
    }
  };

  return { createProjectApi };
};
