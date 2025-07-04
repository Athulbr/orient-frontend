import { useParams } from 'react-router-dom';
import { useUserState } from './userContext';
import { useToastStore } from '../../../../components/toast/ToastStore';
import httpRequest from '../../../../global-utils/httpRequest';

export const useUserApiService = () => {
  const { setState } = useUserState();
  const { id } = useParams();
  const toast = useToastStore();

  // ============================= CREATE ==================================

  const createUserApi = async (user: any) => {
    try {
      setTimeout(() => {
        setState(prev => ({ ...prev, loading: true }));
        toast.success('User Created Successfully');
      }, 2000);
    } catch (error) {
      console.error('error:===========', error);
      toast.error('Failed to Create User');
    }
  };
  const deleteUserApiRequest = async (id: string) => {
    try {
      const res = await httpRequest('DELETE', `${import.meta.env.VITE_NODE_URL}/api/user/delete/${id}`);
      setState(prev => ({ ...prev, refresh: prev.refresh + 1 }));
      toast.success('User deleted successfully');
    } catch (error) {
      console.error('error:===========', error);
      toast.error('Failed to delete User');
    }
  };

  return { createUserApi, deleteUserApiRequest };
};
