import { useParams } from 'react-router-dom';
import { useModuleState } from './moduleContext';
import { useToastStore } from '../../../../components/toast/ToastStore';
import { useEffect } from 'react';
import httpRequest from '../../../../global-utils/httpRequest';

export const useModulesApi = () => {
  const { state, setState } = useModuleState();
  const { id } = useParams();
  const toast = useToastStore();

  useEffect(() => {
    if (!id) return;
    setState(prev => ({ ...prev, projectId: id }));
  }, [id]);

  // ============================= CREATE ==================================

  const createModuleApi = async (payload: any) => {
    try {
      const res = await httpRequest('POST', `${import.meta.env.VITE_NODE_URL}/api/module/create`, payload);
      setState(prev => ({ ...prev, showCreateDialog: false, id: '', refresh: state.refresh + 1 }));
      toast.success('Module Created Successfully');
    } catch (error) {
      console.error('error:===========', error);
      toast.error('Failed to Create Module');
    }
  };

  const updateModuleApi = async (module: any) => {
    try {
      setState(prev => ({ ...prev, loading: true }));
      const res = await httpRequest('PATCH', `${import.meta.env.VITE_NODE_URL}/api/module/update/${state.id}`, module);
      setState(prev => ({ ...prev, loading: false, showCreateDialog: false, showCreatePage: false, id: '', refresh: state.refresh + 1 }));
      toast.success('Module Updated Successfully');
    } catch (error) {
      console.error('error:===========', error);
      toast.error('Failed to Update Module');
    }
  };

  const getModuleByIdApi = async (id: string) => {
    try {
      setState(prev => ({ ...prev, loading: true }));
      const res = await httpRequest('GET', `${import.meta.env.VITE_NODE_URL}/api/module/${id}`);
      toast.success('Module fetched successfully');
      setState(prev => ({ ...prev, loading: false, module: res.data, fields: res.data.fields }));
    } catch (error) {
      console.error('error:===========', error);
      toast.error('Failed to fetch Module');
    }
  };

  const deleteModuleApi = async (id: string) => {
    try {
      const res = await httpRequest('DELETE', `${import.meta.env.VITE_NODE_URL}/api/module/delete/${id}`);
      setState(prev => ({ ...prev, showCreateDialog: false, showCreatePage: false, id: '', refresh: state.refresh + 1 }));
      toast.success('Module deleted successfully');
      return true;
    } catch (error) {
      console.error('error:===========', error);
      toast.error('Failed to delete Module');
    }
  };

  return { createModuleApi, getModuleByIdApi, updateModuleApi, deleteModuleApi };
};
