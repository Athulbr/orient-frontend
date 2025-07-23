import { useToastStore } from '../../../../../components/toast/ToastStore';
import httpRequest from '../../../../../global-utils/httpRequest';
import { useUpdateTemplateState } from './updateTemplateContext';

export const useUpdateTemplatePageApi = () => {
  const { setState } = useUpdateTemplateState();
  const toast = useToastStore();

  // ============================= CREATE TEMPLATE ==================================

  const getTemplatesApi = async () => {
    try {
      setState(prev => ({ ...prev, loadingTemplates: true }));
      const res: any = await httpRequest('POST', `${import.meta.env.VITE_NODE_URL}/api/idp/template`, { pageSize: 100 });
      setState(prev => ({ ...prev }));
      // toast.success('Template fetched successfully');
      return true;
    } catch (error) {
      console.error('error:===========', error);
      toast.error('Failed to create template');
    }
  };
  const getTemplateApi = async (id: string) => {
    try {
      setState(prev => ({ ...prev, loadingTemplate: true }));
      const res: any = await httpRequest('GET', `${import.meta.env.VITE_NODE_URL}/api/idp/template/${id}`);
      setState(prev => ({ ...prev, sectionList: res.data?.fields, loadingTemplate: false }));
      // toast.success('Template fetched successfully');
      return res.data;
    } catch (error) {
      console.error('error:===========', error);
      toast.error('Failed to create template');
    }
  };
  const createTemplateApi = async (requestBody: any) => {
    try {
      const res = await httpRequest('POST', `${import.meta.env.VITE_NODE_URL}/api/idp/template/create`, requestBody);
      setState(prev => ({ ...prev, showCreateDialog: false, id: '' }));
      toast.success('Template created successfully');
      return true;
    } catch (error) {
      console.error('error:===========', error);
      toast.error('Failed to create template');
    }
  };
  const updateTemplateApi = async (requestBody: any) => {
    try {
      const res = await httpRequest('POST', `${import.meta.env.VITE_NODE_URL}/api/idp/template/update/`, requestBody);
      setState(prev => ({ ...prev, showCreateDialog: false, id: '' }));
      toast.success('Template updated successfully');
      return true;
    } catch (error) {
      console.error('error:===========', error);
      toast.error('Failed to update Template');
    }
  };
  const deleteTemplateApi = async (id: string) => {
    try {
      const res = await httpRequest('DELETE', `${import.meta.env.VITE_NODE_URL}/api/idp/template/delete/${id}`);
      setState(prev => ({ ...prev, showCreateDialog: false, id: '' }));
      toast.success('Template deleted successfully');
      return true;
    } catch (error) {
      console.error('error:===========', error);
      toast.error('Failed to delete Template');
    }
  };

  return { createTemplateApi, updateTemplateApi, getTemplateApi, deleteTemplateApi, getTemplatesApi };
};
