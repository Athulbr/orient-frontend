import { useParams } from 'react-router-dom';
import { useDocumentState } from './documentContext';
import { useToastStore } from '../../../../components/toast/ToastStore';
import { useEffect } from 'react';
import httpRequest from '../../../../global-utils/httpRequest';

export const useDocumentsApi = () => {
    const { state, setState } = useDocumentState();
    const { id } = useParams();
    const toast = useToastStore();

    useEffect(() => {
        if (!id) return;
        setState(prev => ({ ...prev, projectId: id }));
    }, [id]);

    // ============================= CREATE ==================================

    const createDocumentApi = async (document: any) => {
        try {
            const payload = {
                ...document,
                fields: state.fields,
                projectId: state.projectId
            };
            setState(prev => ({ ...prev, loading: true }));
            const res = await httpRequest('POST', `${import.meta.env.VITE_NODE_URL}/api/idp/document/create`, payload);
            setState(prev => ({ ...prev, loading: false, showCreateDialog: false, id: '', refresh: state.refresh + 1 }));
            toast.success('Document Created Successfully');
        } catch (error) {
            console.error('error:===========', error);
            toast.error('Failed to Create Document');
        }
    };

    const updateDocumentApi = async (document: any) => {
        try {
            const payload = {
                ...document,
                fields: state.fields,
                projectId: state.projectId
            };
            setState(prev => ({ ...prev, loading: true }));
            const res = await httpRequest('POST', `${import.meta.env.VITE_NODE_URL}/api/idp/document/update/${state.id}`, payload);
            setState(prev => ({ ...prev, loading: false, showCreateDialog: false, showCreatePage: false, id: '', refresh: state.refresh + 1 }));
            toast.success('Document Updated Successfully');
        } catch (error) {
            console.error('error:===========', error);
            toast.error('Failed to Create Document');
        }
    };

    const getDocumentByIdApi = async (id: string) => {
        try {
            setState(prev => ({ ...prev, loading: true }));
            const res = await httpRequest('GET', `${import.meta.env.VITE_NODE_URL}/api/idp/document/${id}`);
            toast.success('Document fetched successfully');
            setState(prev => ({ ...prev, loading: false, document: res.data, fields: res.data.fields }));
        } catch (error) {
            console.error('error:===========', error);
            toast.error('Failed to Create Document');
        }
    };

    const deleteDocumentApi = async (id: string) => {
        try {
            const res = await httpRequest('DELETE', `${import.meta.env.VITE_NODE_URL}/api/idp/document/delete/${id}`);
            setState(prev => ({ ...prev, showCreateDialog: false, showCreatePage: false, id: '', refresh: state.refresh + 1 }));
            toast.success('Document deleted successfully');
            return true;
        } catch (error) {
            console.error('error:===========', error);
            toast.error('Failed to delete Document');
        }
    };

    return { createDocumentApi, getDocumentByIdApi, updateDocumentApi, deleteDocumentApi };
};
