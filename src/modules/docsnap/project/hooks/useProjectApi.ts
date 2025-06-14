import { useParams } from 'react-router-dom';
import { useProjectState } from './projectContext';
import { useToastStore } from '../../../../components/toast/ToastStore';
import httpRequest from '../../../../utils/httpRequest';

export const useProjectApi = () => {
  const { state, setState } = useProjectState();
  const toast = useToastStore();

  // ============================= CREATE PROJECT ==================================

  const getProjectApi = async (id: string) => {
    try {
      setState(prev => ({ ...prev, loadingProject: true }));
      const res: any = await httpRequest('GET', `${import.meta.env.VITE_NODE_URL}/api/idp/project/${id}`);
      setState(prev => ({ ...prev, loadingProject: false, project: res.data }));
      toast.success('Project fetched successfully');
      return true;
    } catch (error) {
      console.error('error:===========', error);
      toast.error('Failed to create project');
    }
  };
  const createProjectApi = async (requestBody: any) => {
    try {
      const res = await httpRequest('POST', `${import.meta.env.VITE_NODE_URL}/api/idp/project/create`, requestBody);
      setState(prev => ({ ...prev, showCreateDialog: false, id: '', refresh: state.refresh + 1 }));
      toast.success('Project created successfully');
      return true;
    } catch (error) {
      console.error('error:===========', error);
      toast.error('Failed to create project');
    }
  };
  const updateProjectApi = async (requestBody: any) => {
    try {
      const res = await httpRequest('POST', `${import.meta.env.VITE_NODE_URL}/api/idp/project/update/${state.id}`, requestBody);
      setState(prev => ({ ...prev, showCreateDialog: false, id: '', refresh: state.refresh + 1 }));
      toast.success('Project updated successfully');
      return true;
    } catch (error) {
      console.error('error:===========', error);
      toast.error('Failed to update Project');
    }
  };
  const deleteProjectApi = async (id: string) => {
    try {
      const res = await httpRequest('DELETE', `${import.meta.env.VITE_NODE_URL}/api/idp/project/delete/${id}`);
      setState(prev => ({ ...prev, showCreateDialog: false, id: '', refresh: state.refresh + 1 }));
      toast.success('Project updated successfully');
      return true;
    } catch (error) {
      console.error('error:===========', error);
      toast.error('Failed to update Project');
    }
  };

  return { createProjectApi, updateProjectApi, getProjectApi, deleteProjectApi };
};
