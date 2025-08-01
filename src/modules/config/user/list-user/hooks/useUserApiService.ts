import { useUserState } from './userContext';
import { useToastStore } from '../../../../../components/toast/ToastStore';
import httpRequest from '../../../../../global-utils/httpRequest';

export const useUserApiService = () => {
  const { state, setState } = useUserState();
  const toast = useToastStore();

  // ============================= CREATE ==================================

  const createUserApi = async (user: any) => {
    try {
      setState(prev => ({ ...prev, loading: true }));
      const res = await httpRequest('POST', `${import.meta.env.VITE_NODE_URL}/api/user/create`, user);
      setState(prev => ({ ...prev, showCreateDialog: false, id: '', refresh: prev.refresh + 1 }));
      toast.success('User Created Successfully');
    } catch (error) {
      console.error('error:===========', error);
      toast.error('Failed to Create User');
    } finally {
      setState(prev => ({ ...prev, loading: false }));
    }
  };
  const updateUserApi = async (user: any) => {
    try {
      setState(prev => ({ ...prev, loading: true }));
      const res = await httpRequest('PATCH', `${import.meta.env.VITE_NODE_URL}/api/user/update/${state.id}`, user);
      setState(prev => ({ ...prev, showCreateDialog: false, id: '', refresh: prev.refresh + 1 }));
      toast.success('User Updated Successfully');
    } catch (error) {
      console.error('error:===========', error);
      toast.error('Failed to Update User');
    } finally {
      setState(prev => ({ ...prev, loading: false }));
    }
  };
  const deleteUserApiRequest = async (id: string) => {
    try {
      setState(prev => ({ ...prev, loading: true }));
      const res = await httpRequest('DELETE', `${import.meta.env.VITE_NODE_URL}/api/user/delete/${id}`);
      setState(prev => ({ ...prev, refresh: prev.refresh + 1 }));
      toast.success('User deleted successfully');
    } catch (error) {
      console.error('error:===========', error);
      toast.error('Failed to delete User');
    } finally {
      setState(prev => ({ ...prev, loading: false }));
    }
  };

  return { createUserApi, updateUserApi, deleteUserApiRequest };
};
