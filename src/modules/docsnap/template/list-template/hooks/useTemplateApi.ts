import { useToastStore } from '../../../../../components/toast/ToastStore';
import { config } from '../../../../../config/default';
import httpRequest from '../../../../../global-utils/httpRequest';
import { useSettingsStore } from '../../../../../zustand-store/SettingsStore';
import { useTemplateState } from './templateContext';

export const useListTemplatePageApi = () => {
    const { state, setState } = useTemplateState();
    const toast = useToastStore();

    const filterTemplatesByTenant = (templates: any) => {
        const selectedTenantFromSessionStorage = window?.sessionStorage?.getItem('selectedTenant') || '';
        return templates.filter((template: any) =>
            selectedTenantFromSessionStorage === 'all' ? true : template.tenantId === selectedTenantFromSessionStorage
        );
    };

    const filterTemplatesBySearchText = (templates: any) => {
        return templates.filter((template: any) => template.name.toLowerCase().includes(state.searchText.toLowerCase()));
    };

    const sortTemplatesByRecentlyUsed = (templates: any) => {
        const arrayOfRecentlyUsedTemplates = JSON.parse(localStorage.getItem('recentlyUsedTemplates') || '[]');
        const templatesCopy = [...templates];
        const finalTemplates: any = [];
        arrayOfRecentlyUsedTemplates.forEach((id: any) => {
            const template = templatesCopy.find((template: any) => template._id === id);
            if (template) {
                finalTemplates.push(template);
            }
        });
        const remainingTemplates = templatesCopy.filter((template: any) => !arrayOfRecentlyUsedTemplates.includes(template._id));
        return [...finalTemplates, ...remainingTemplates];
    };

    const getTemplatesApi = async () => {
        try {
            setState(prev => ({ ...prev, loadingTemplates: true }));
            const parsedTemplates = JSON.parse(sessionStorage.getItem('templates') || '[]');
            const filteredTemplatesByTenant = filterTemplatesByTenant(parsedTemplates);
            const filteredTemplatesBySearchText = filterTemplatesBySearchText(filteredTemplatesByTenant);
            const sortedTemplates = sortTemplatesByRecentlyUsed(filteredTemplatesBySearchText);
            setState(prev => ({ ...prev, loadingTemplates: false, templates: sortedTemplates }));
            return true;
        } catch (error) {
            console.error('error:===========', error);
            toast.error('Failed to fetch template list');
        }
    };
    const getPredefinedTemplatesApi = async () => {
        try {
            setState(prev => ({ ...prev, loadingPredefinedTemplates: true }));
            const predefinedTemplates = sessionStorage.getItem('predefinedTemplates');
            setState(prev => ({ ...prev, loadingPredefinedTemplates: false, predefinedTemplates: JSON.parse(predefinedTemplates || '[]') }));
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
