import { useParams } from 'react-router-dom';
import { useDocumentState } from './documentContext';
import { useToastStore } from '../../../../components/toast/ToastStore';
import { useEffect } from 'react';

export const useFetchCreateTB = () => {
  const { setState } = useDocumentState();
  const { id } = useParams();
  const toast = useToastStore();

  useEffect(() => {
    if (!id) return;
    setState(prev => ({ ...prev, id: id }));
  }, [id]);

  // ============================= CREATE ==================================

  const createDocumentApi = async (document: any) => {
    try {
      setTimeout(() => {
        setState(prev => ({ ...prev, loading: true }));
        toast.success('Document Created Successfully');
      }, 2000);
    } catch (error) {
      console.log('error:===========', error);
      toast.error('Failed to Create Document');
    }
  };

  return { createDocumentApi };
};
