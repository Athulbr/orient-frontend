import { useParams } from 'react-router-dom';
import { useUserState } from './userContext';
import { useToastStore } from '../../../../components/toast/ToastStore';

export const useFetchCreateTB = () => {
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
      console.log('error:===========', error);
      toast.error('Failed to Create User');
    }
  };

  return { createUserApi };
};
