import { useUserAccountState } from './userAccountContext';
import httpRequest from '../../../../../global-utils/httpRequest';
import { useToastStore } from '../../../../../components/toast/ToastStore';

export const useUserAccountApi = () => {
  const { state, setState } = useUserAccountState();
  const toast = useToastStore();

  // ============================= CREATE USERACCOUNT ==================================

  const getUserApi = async (id: string) => {
    try {
      setState(prev => ({ ...prev, loadingUserAccount: true }));
      const res: any = await httpRequest('GET', `${import.meta.env.VITE_NODE_URL}/api/user/${id}`);
      setState(prev => ({ ...prev, loadingUserAccount: false, userAccount: res.data }));
      toast.success('UserAccount fetched successfully');
      return true;
    } catch (error) {
      console.error('error:===========', error);
      toast.error('Failed to fetch userAccount');
    }
  };

  return { getUserApi };
};
