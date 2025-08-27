import { useToastStore } from '../../../../../components/toast/ToastStore';
import httpRequest from '../../../../../global-utils/httpRequest';
import { convertLLMResponse } from '../utils';
import { useUpdateTemplateState } from './updateTemplateContext';
import { useNavigate } from 'react-router-dom';

export const useUpdateTemplatePageApi = () => {
    const { setState } = useUpdateTemplateState();
    const toast = useToastStore();
    const navigate = useNavigate();

    // ============================= CREATE TEMPLATE ==================================

    const getTemplatesApi = async () => {
        try {
            setState(prev => ({ ...prev, loadingTemplates: true }));
            const res: any = await httpRequest('POST', `${import.meta.env.VITE_NODE_URL}/idp/template`, { pageSize: 100 });
            setState(prev => ({ ...prev }));
            // toast.success('Template fetched successfully');
            return true;
        } catch (error) {
            console.error('error:===========', error);
            toast.error('Failed to fetch template list');
        }
    };
    const getTemplateApi = async (id: string) => {
        try {
            setState(prev => ({ ...prev, loadingTemplate: true }));
            const res: any = await httpRequest('GET', `${import.meta.env.VITE_NODE_URL}/idp/template/${id}`);
            setState(prev => ({ ...prev, sectionList: res.data?.fields, loadingTemplate: false }));
            // toast.success('Template fetched successfully');
            return res.data;
        } catch (error) {
            console.error('error:===========', error);
            toast.error('Failed to fetch template');
        }
    };
    const createTemplateApi = async (requestBody: any) => {
        try {
            setState(prev => ({ ...prev, updatingTemplate: true }));
            const res = await httpRequest('POST', `${import.meta.env.VITE_NODE_URL}/idp/template/create`, requestBody);
            setState(prev => ({ ...prev, showCreateForm: false, id: '', updatingTemplate: false }));
            toast.success('Template created successfully');
            navigate('/docsnap/template/list');
            return true;
        } catch (error) {
            console.error('error:===========', error);
            toast.error('Failed to create template');
        }
    };
    const updateTemplateApi = async (id: string, requestBody: any) => {
        try {
            setState(prev => ({ ...prev, updatingTemplate: true }));
            const res = await httpRequest('PATCH', `${import.meta.env.VITE_NODE_URL}/idp/template/update/${id}`, requestBody);
            setState(prev => ({ ...prev, id: '', showCreateForm: false, updatingTemplate: false }));
            toast.success('Template updated successfully');
            navigate('/docsnap/template/list');
            return true;
        } catch (error) {
            console.error('error:===========', error);
            toast.error('Failed to update Template');
        }
    };
    const deleteTemplateApi = async (id: string) => {
        try {
            const res = await httpRequest('DELETE', `${import.meta.env.VITE_NODE_URL}/idp/template/delete/${id}`);
            setState(prev => ({ ...prev, showCreateDialog: false, id: '' }));
            toast.success('Template deleted successfully');
            return true;
        } catch (error) {
            console.error('error:===========', error);
            toast.error('Failed to delete Template');
        }
    };

        const generateTemplateFieldsWithAI = async (file: Uint8Array, mimeType: string, fileName:string) => {
            const formData = new FormData();
            const fileBlob = new Blob([file], { type: mimeType,  }); // Convert Uint8Array to a Blob
            formData.append('file', fileBlob, fileName); // 'document' is a generic filename
    
            setState(prev => ({ ...prev, generatingTemplateFieldsWithAI: true })); // Set loading state before fetch
            const sessionStorageAccessToken = window?.sessionStorage?.getItem('accessToken') || '';
    
    
            try {
                const res = await fetch(import.meta.env.VITE_ML_SERVICE_NODEJS_GENERATE_TEMPLATE_FIELDS, {
                    headers: {
                        authorization: `Bearer ${JSON.parse(sessionStorageAccessToken)}`
                    },
                    method: 'POST',
                    body: formData
                });
    
                const data = await res.json();
                
                if (data?.error) {
                    toast.error(data?.error);
                    return;
                }
                const convertedData = convertLLMResponse(data?.data?.templateFields || {});
    
                setState(prev => ({ ...prev, sectionList: convertedData }));
            } catch (error) {
                toast.error('An error occurred while generating template fields.');
            } finally {
                setState(prev => ({ ...prev, generatingTemplateFieldsWithAI: false })); // Always set loading to false
            }
        };

    const updateTemplateFieldsWithAI = async (requestBody: any) => {
        try {
            setState(prev => ({ ...prev, generatingTemplateFieldsWithAI: true }));
            const res = await httpRequest('POST', `${import.meta.env.VITE_ML_SERVICE_NODEJS_GENERATE_TEMPLATE_FIELDS}`, requestBody || {});
            const data = convertLLMResponse(res.data?.templateFields || {});
            console.log('data:===========', data);
            setState(prev => ({ ...prev, sectionList: data, generatingTemplateFieldsWithAI: false }));
            toast.success('Template fields generated successfully');
            return true;
        } catch (error) {
            console.error('error:===========', error);
            toast.error('Failed to generate template fields');
        }
    };

    return { createTemplateApi, updateTemplateApi, getTemplateApi, deleteTemplateApi, getTemplatesApi, generateTemplateFieldsWithAI, updateTemplateFieldsWithAI };
};
