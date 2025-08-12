import { useParams } from 'react-router-dom';
import { useFeatureState } from './featureContext';
import { useToastStore } from '../../../../components/toast/ToastStore';
import { useEffect } from 'react';
import httpRequest from '../../../../global-utils/httpRequest';

export const useFeaturesApi = () => {
    const { state, setState } = useFeatureState();
    const { id } = useParams();
    const toast = useToastStore();

    useEffect(() => {
        if (!id) return;
        setState(prev => ({ ...prev, projectId: id }));
    }, [id]);

    // ============================= CREATE ==================================

    const createFeatureApi = async (payload: any) => {
        try {
            const res = await httpRequest('POST', `${import.meta.env.VITE_NODE_URL}/feature/create`, payload);
            setState(prev => ({ ...prev, showCreateDialog: false, id: '', refresh: state.refresh + 1 }));
            toast.success('Feature Created Successfully');
        } catch (error) {
            console.error('error:===========', error);
            toast.error('Failed to Create Feature');
        }
    };

    const updateFeatureApi = async (feature: any) => {
        try {
            setState(prev => ({ ...prev, loading: true }));
            const res = await httpRequest('PATCH', `${import.meta.env.VITE_NODE_URL}/feature/update/${state.id}`, feature);
            setState(prev => ({ ...prev, loading: false, showCreateDialog: false, showCreatePage: false, id: '', refresh: state.refresh + 1 }));
            toast.success('Feature Updated Successfully');
        } catch (error) {
            console.error('error:===========', error);
            toast.error('Failed to Update Feature');
        }
    };

    const getFeatureByIdApi = async (id: string) => {
        try {
            setState(prev => ({ ...prev, loading: true }));
            const res = await httpRequest('GET', `${import.meta.env.VITE_NODE_URL}/feature/${id}`);
            toast.success('Feature fetched successfully');
            setState(prev => ({ ...prev, loading: false, feature: res.data, fields: res.data.fields }));
        } catch (error) {
            console.error('error:===========', error);
            toast.error('Failed to fetch Feature');
        }
    };

    const deleteFeatureApi = async (id: string) => {
        try {
            const res = await httpRequest('DELETE', `${import.meta.env.VITE_NODE_URL}/feature/delete/${id}`);
            setState(prev => ({ ...prev, showCreateDialog: false, showCreatePage: false, id: '', refresh: state.refresh + 1 }));
            toast.success('Feature deleted successfully');
            return true;
        } catch (error) {
            console.error('error:===========', error);
            toast.error('Failed to delete Feature');
        }
    };

    return { createFeatureApi, getFeatureByIdApi, updateFeatureApi, deleteFeatureApi };
};
