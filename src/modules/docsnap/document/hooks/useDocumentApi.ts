import { useParams } from 'react-router-dom';
import { useDocumentState } from './documentContext';
import { useToastStore } from '../../../../components/toast/ToastStore';
import { useEffect } from 'react';
import httpRequest from '../../../../utils/httpRequest';

export const useDocumentsApi = () => {
  const { setState } = useDocumentState();
  const { id } = useParams();
  const toast = useToastStore();

  useEffect(() => {
    if (!id) return;
    setState(prev => ({ ...prev, projectId: id }));
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
  const getDocumentByIdApi = async (id: string) => {
    try {
      const res = await httpRequest('GET', `http://localhost:4000/api/idp/document/${id}`);
      setState(prev => ({ ...prev, fields: res.data.fields }));
    } catch (error) {
      console.log('error:===========', error);
      toast.error('Failed to Create Document');
    }
  };

  return { createDocumentApi, getDocumentByIdApi };
};
