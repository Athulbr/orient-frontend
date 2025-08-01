import { useToastStore } from '../../../../../components/toast/ToastStore';
import httpRequest from '../../../../../global-utils/httpRequest';
import { useTemplateState } from './templateContext';

export const useListTemplatePageApi = () => {
  const { state, setState } = useTemplateState();
  const toast = useToastStore();

  // ============================= CREATE TEMPLATE ==================================

  const getTemplatesApi = async () => {
    try {
      setState(prev => ({ ...prev, loadingTemplates: true }));
      const res: any = await httpRequest('POST', `${import.meta.env.VITE_NODE_URL}/api/idp/template`, { search: state.searchText || '' });
      setState(prev => ({ ...prev, loadingTemplates: false, templates: res.data }));
      // toast.success('Template fetched successfully');
      return true;
    } catch (error) {
      console.error('error:===========', error);
      toast.error('Failed to fetch template list');
    }
  };
  const getPredefinedTemplatesApi = async () => {
    try {
      setState(prev => ({ ...prev, loadingPredefinedTemplates: true }));
      const res: any = await httpRequest('POST', `${import.meta.env.VITE_NODE_URL}/api/idp/pre-template`);
      setState(prev => ({ ...prev, loadingPredefinedTemplates: false, predefinedTemplates: res.data }));
      // toast.success('Template fetched successfully');
      return true;
    } catch (error) {
      console.error('error:===========', error);
      toast.error('Failed to fetch predefined template list');
    }
  };
  const getTemplateApi = async (id: string) => {
    try {
      setState(prev => ({ ...prev, loadingTemplate: true }));
      const res: any = await httpRequest('GET', `${import.meta.env.VITE_NODE_URL}/api/idp/template/${id}`);
      setState(prev => ({ ...prev, loadingTemplate: false, templates: res.data }));
      toast.success('Template fetched successfully');
      return true;
    } catch (error) {
      console.error('error:===========', error);
      toast.error('Failed to fetch template');
    }
  };
  // const createTemplateApi = async (requestBody: any) => {
  //   try {
  //     setState(prev => ({ ...prev, loadingCreateTemplate: true }));
  //     const res = await httpRequest('POST', `${import.meta.env.VITE_NODE_URL}/api/idp/template/create`, requestBody);
  //     setState(prev => ({ ...prev, id: '' }));
  //     toast.success('Template created successfully');
  //     return true;
  //   } catch (error) {
  //     console.error('error:===========', error);
  //     toast.error('Failed to create template');
  //   } finally {
  //     setState(prev => ({ ...prev, loadingCreateTemplate: false, showCreateDialog: false }));
  //   }
  // };
  const updateTemplateApi = async (requestBody: any) => {
    try {
      const res = await httpRequest('POST', `${import.meta.env.VITE_NODE_URL}/api/idp/template/update/${state.id}`, requestBody);
      setState(prev => ({ ...prev, id: '' }));
      toast.success('Template updated successfully');
      return true;
    } catch (error) {
      console.error('error:===========', error);
      toast.error('Failed to update Template');
    } finally {
      setState(prev => ({ ...prev, loadingCreateTemplate: false, showCreateDialog: false }));
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

  return { updateTemplateApi, getTemplateApi, deleteTemplateApi, getTemplatesApi, getPredefinedTemplatesApi };
};
