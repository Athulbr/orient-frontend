import { useParams } from 'react-router-dom';
import { useRoleState } from './roleContext';
import { useToastStore } from '../../../../components/toast/ToastStore';
import { useEffect } from 'react';
import httpRequest from '../../../../utils/httpRequest';

export const useRolesApi = () => {
  const { state, setState } = useRoleState();
  const { id } = useParams();
  const toast = useToastStore();

  useEffect(() => {
    if (!id) return;
    setState(prev => ({ ...prev, projectId: id }));
  }, [id]);

  // ============================= CREATE ==================================

  const createRoleApi = async (role: any) => {
    try {
      const payload = {
        ...role,
        fields: state.fields,
        projectId: state.projectId,
      };
      setState(prev => ({ ...prev, loading: true }));
      const res = await httpRequest('POST', `${import.meta.env.VITE_NODE_URL}/api/idp/role/create`, payload);
      setState(prev => ({ ...prev, loading: false, showCreateDialog: false, id: '', refresh: state.refresh + 1 }));
      toast.success('Role Created Successfully');
    } catch (error) {
      console.error('error:===========', error);
      toast.error('Failed to Create Role');
    }
  };

  const updateRoleApi = async (role: any) => {
    try {
      const payload = {
        ...role,
        fields: state.fields,
        projectId: state.projectId,
      };
      setState(prev => ({ ...prev, loading: true }));
      const res = await httpRequest('POST', `${import.meta.env.VITE_NODE_URL}/api/idp/role/update/${state.id}`, payload);
      setState(prev => ({ ...prev, loading: false, showCreateDialog: false, showCreatePage: false, id: '', refresh: state.refresh + 1 }));
      toast.success('Role Updated Successfully');
    } catch (error) {
      console.error('error:===========', error);
      toast.error('Failed to Create Role');
    }
  };

  const getRoleByIdApi = async (id: string) => {
    try {
      setState(prev => ({ ...prev, loading: true }));
      const res = await httpRequest('GET', `${import.meta.env.VITE_NODE_URL}/api/idp/role/${id}`);
      toast.success('Role fetched successfully');
      setState(prev => ({ ...prev, loading: false, role: res.data, fields: res.data.fields }));
    } catch (error) {
      console.error('error:===========', error);
      toast.error('Failed to Create Role');
    }
  };

  const deleteRoleApi = async (id: string) => {
    try {
      const res = await httpRequest('DELETE', `${import.meta.env.VITE_NODE_URL}/api/idp/role/delete/${id}`);
      setState(prev => ({ ...prev, showCreateDialog: false, showCreatePage: false, id: '', refresh: state.refresh + 1 }));
      toast.success('Role deleted successfully');
      return true;
    } catch (error) {
      console.error('error:===========', error);
      toast.error('Failed to delete Role');
    }
  };

  return { createRoleApi, getRoleByIdApi, updateRoleApi, deleteRoleApi };
};
