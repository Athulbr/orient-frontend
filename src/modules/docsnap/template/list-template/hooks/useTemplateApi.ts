import { useToastStore } from '../../../../../components/toast/ToastStore';
import { config } from '../../../../../config/default';
import httpRequest from '../../../../../global-utils/httpRequest';
import { useTemplateState } from './templateContext';

export const useListTemplatePageApi = () => {
    const { state, setState } = useTemplateState();
    const toast = useToastStore();

    // ============================= CREATE TEMPLATE ==================================

    const getTemplatesApi = async () => {
        try {
            setState(prev => ({ ...prev, loadingTemplates: true }));
            const templates = sessionStorage.getItem('templates');
            setState(prev => ({ ...prev, loadingTemplates: false, templates: JSON.parse(templates || '[]') }));
            // toast.success('Template fetched successfully');
            return true;
        } catch (error) {
            console.error('error:===========', error);
            toast.error('Failed to fetch template list');
        }
    };
    // const getTemplatesApi = async () => {
    //     try {
    //         setState(prev => ({ ...prev, loadingTemplates: true }));
    //         const res: any = await httpRequest('POST', `${config.nodeApiUrl}/idp/template`, { search: state.searchText || '' });
    //         setState(prev => ({ ...prev, loadingTemplates: false, templates: res.data }));
    //         // toast.success('Template fetched successfully');
    //         return true;
    //     } catch (error) {
    //         console.error('error:===========', error);
    //         toast.error('Failed to fetch template list');
    //     }
    // };
    const getPredefinedTemplatesApi = async () => {
        try {
            setState(prev => ({ ...prev, loadingPredefinedTemplates: true }));
            // const res: any = await httpRequest('POST', `${config.nodeApiUrl}/idp/pre-template`);
            const predefinedTemplates = sessionStorage.getItem('predefinedTemplates');
            setState(prev => ({ ...prev, loadingPredefinedTemplates: false, predefinedTemplates: JSON.parse(predefinedTemplates || '[]') }));
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
            const res: any = await httpRequest('GET', `${config.nodeApiUrl}/idp/template/${id}`);
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
    //     const res = await httpRequest('POST', `${config.nodeApiUrl}/idp/template/create`, requestBody);
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
            const res = await httpRequest('POST', `${config.nodeApiUrl}/idp/template/update/${state.id}`, requestBody);
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
            const res = await httpRequest('DELETE', `${config.nodeApiUrl}/idp/template/delete/${id}`);
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
