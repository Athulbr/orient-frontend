import { useParams } from 'react-router-dom';
import { useSubscriptionModelState } from './subscriptionModelContext';
import { useToastStore } from '../../../../components/toast/ToastStore';
import { useEffect } from 'react';
import httpRequest from '../../../../utils/httpRequest';

export const useSubscriptionModelsApi = () => {
  const { state, setState } = useSubscriptionModelState();
  const { id } = useParams();
  const toast = useToastStore();

  useEffect(() => {
    if (!id) return;
    setState(prev => ({ ...prev, projectId: id }));
  }, [id]);

  // ============================= CREATE ==================================

  const createSubscriptionModelApi = async (payload: any) => {
    try {
      const res = await httpRequest('POST', `${import.meta.env.VITE_NODE_URL}/api/subscriptionModel/create`, payload);
      setState(prev => ({ ...prev, showCreateDialog: false, id: '', refresh: state.refresh + 1 }));
      toast.success('Subscription Model Created Successfully');
    } catch (error) {
      console.error('error:===========', error);
      toast.error('Failed to Create Subscription Model');
    }
  };

  const updateSubscriptionModelApi = async (subscriptionModel: any) => {
    try {
      setState(prev => ({ ...prev, loading: true }));
      const res = await httpRequest('PATCH', `${import.meta.env.VITE_NODE_URL}/api/subscriptionModel/update/${state.id}`, subscriptionModel);
      setState(prev => ({ ...prev, loading: false, showCreateDialog: false, showCreatePage: false, id: '', refresh: state.refresh + 1 }));
      toast.success('Subscription Model Updated Successfully');
    } catch (error) {
      console.error('error:===========', error);
      toast.error('Failed to Update Subscription Model');
    }
  };

  const getSubscriptionModelByIdApi = async (id: string) => {
    try {
      setState(prev => ({ ...prev, loading: true }));
      const res = await httpRequest('GET', `${import.meta.env.VITE_NODE_URL}/api/subscriptionModel/${id}`);
      toast.success('Subscription Model fetched successfully');
      setState(prev => ({ ...prev, loading: false, subscriptionModel: res.data, fields: res.data.fields }));
    } catch (error) {
      console.error('error:===========', error);
      toast.error('Failed to fetch Subscription Model');
    }
  };

  const deleteSubscriptionModelApi = async (id: string) => {
    try {
      const res = await httpRequest('DELETE', `${import.meta.env.VITE_NODE_URL}/api/subscriptionModel/delete/${id}`);
      setState(prev => ({ ...prev, showCreateDialog: false, showCreatePage: false, id: '', refresh: state.refresh + 1 }));
      toast.success('Subscription Model deleted successfully');
      return true;
    } catch (error) {
      console.error('error:===========', error);
      toast.error('Failed to delete Subscription Model');
    }
  };

  return { createSubscriptionModelApi, getSubscriptionModelByIdApi, updateSubscriptionModelApi, deleteSubscriptionModelApi };
};
