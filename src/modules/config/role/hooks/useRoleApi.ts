import { useRoleState } from './roleContext';
import { useToastStore } from '../../../../components/toast/ToastStore';
import httpRequest from '../../../../global-utils/httpRequest';

export const useRolesApi = () => {
  const { state, setState } = useRoleState();
  const toast = useToastStore();

  // ============================= CREATE ==================================

  const getSubscriptionModelByIdApi = async (id: string) => {
    try {
      setState(prev => ({ ...prev, loading: true }));
      const res = await httpRequest('GET', `${import.meta.env.VITE_NODE_URL}/api/subscription/${id}`);
      toast.success('Subscription Model fetched successfully');
      setState(prev => ({ ...prev, loading: false, subscriptionModel: res.data, fields: res.data.fields }));
    } catch (error) {
      console.error('error:===========', error);
      toast.error('Failed to fetch Subscription Model');
    }
  };

  const createRoleApi = async (payload: any) => {
    try {
      const res = await httpRequest('POST', `${import.meta.env.VITE_NODE_URL}/api/role/create`, payload);
      setState(prev => ({ ...prev, showCreateDialog: false, id: '', refresh: state.refresh + 1 }));
      toast.success('Role Created Successfully');
    } catch (error) {
      console.error('error:===========', error);
      toast.error('Failed to Create Role');
    }
  };

  const updateRoleApi = async (role: any) => {
    try {
      setState(prev => ({ ...prev, loading: true }));
      const res = await httpRequest('PATCH', `${import.meta.env.VITE_NODE_URL}/api/role/update/${state.id}`, role);
      setState(prev => ({
        ...prev,
        loading: false,
        showCreateDialog: false,
        showViewDialog: false,
        showCreatePage: false,
        id: '',
        refresh: state.refresh + 1,
      }));
      toast.success('Role Updated Successfully');
    } catch (error) {
      console.error('error:===========', error);
      toast.error('Failed to Create Role');
    }
  };

  // const getRoleByIdApi = async (id: string) => {
  //   try {
  //     setState(prev => ({ ...prev, loading: true }));
  //     const res = await httpRequest('GET', `${import.meta.env.VITE_NODE_URL}/api/role/${id}`);
  //     toast.success('Role fetched successfully');
  //     setState(prev => ({ ...prev, loading: false, role: res.data, fields: res.data.fields }));
  //   } catch (error) {
  //     console.error('error:===========', error);
  //     toast.error('Failed to Create Role');
  //   }
  // };

  const deleteRoleApi = async (id: string) => {
    try {
      const res = await httpRequest('DELETE', `${import.meta.env.VITE_NODE_URL}/api/role/delete/${id}`);
      setState(prev => ({ ...prev, showCreateDialog: false, showCreatePage: false, id: '', refresh: state.refresh + 1 }));
      toast.success('Role deleted successfully');
      return true;
    } catch (error) {
      console.error('error:===========', error);
      toast.error('Failed to delete Role');
    }
  };

  const getAllModulesApi = async () => {
    try {
      const res = await httpRequest('POST', `${import.meta.env.VITE_NODE_URL}/api/module`, { pageSize: 1000 });
      const modules = res.data || [];
      setState(prev => ({ ...prev, modules }));
      return modules;
    } catch (error) {
      console.error('error:===========', error);
      toast.error('Failed to fetch Modules');
      throw error;
    }
  };

  const getAllFeaturesApi = async () => {
    try {
      const res = await httpRequest('POST', `${import.meta.env.VITE_NODE_URL}/api/feature`, { pageSize: 1000 });
      const features = res.data || [];
      setState(prev => ({ ...prev, features }));
      return features;
    } catch (error) {
      console.error('error:===========', error);
      toast.error('Failed to fetch Features');
      throw error;
    }
  };

  return { createRoleApi, updateRoleApi, deleteRoleApi, getSubscriptionModelByIdApi, getAllModulesApi, getAllFeaturesApi };
};
