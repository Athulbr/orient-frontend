import { useParams } from 'react-router-dom';
import { useProjectState } from './projectContext';
import { useToastStore } from '../../../../components/toast/ToastStore';

export const useFetchCreateTB = () => {
  const { setState } = useProjectState();
  const { id } = useParams();
  const toast = useToastStore();

  // ============================= CREATE ==================================

  const createProjectApi = async (project: any) => {
    try {
      setTimeout(() => {
        setState(prev => ({ ...prev, loading: true }));
        toast.success('Project Created Successfully');
      }, 2000);
    } catch (error) {
      console.error('error:===========', error);
      toast.error('Failed to Create Project');
    }
  };

  return { createProjectApi };
};
