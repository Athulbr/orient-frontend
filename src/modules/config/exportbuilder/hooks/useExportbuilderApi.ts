import { useParams } from 'react-router-dom';
import { useExportbuilderState } from './exportbuilderContext';
import { useToastStore } from '../../../../components/toast/ToastStore';
import { useEffect } from 'react';
import httpRequest from '../../../../global-utils/httpRequest';
import { config } from '../../../../config/default';

export const useExportbuilderApi = () => {
    const { state, setState } = useExportbuilderState();
    const toast = useToastStore();

    // ============================= CREATE ==================================
    const createExportbuilderApi = async (payload: any) => {
        try {
            const res = await httpRequest('POST', `${config.nodeApiUrl}/builder/recordbuilder`, payload);
            setState(prev => ({ ...prev, loading: false, id: '', refresh: prev.refresh + 1 }));
            toast.success('Exportbuilder Created Successfully');
        } catch (error) {
            console.error('error:===========', error);
            toast.error('Failed to Create Exportbuilder');
        }
    };

    // ============================= UPDATE ==================================
    const updateExportbuilderApi = async (payload: any) => {
        try {
            setState(prev => ({ ...prev, loading: true }));
            const res = await httpRequest('PUT', `${config.nodeApiUrl}/builder/recordbuilder/${state.id}`, payload);
            setState(prev => ({ ...prev, loading: false, refresh: (prev.refresh || 0) + 1 }));
            toast.success('Exportbuilder Updated Successfully');
        } catch (error) {
            console.error('error:===========', error);
            toast.error('Failed to Update Exportbuilder');
        }
    };

    // ============================= GET BY ID ===============================
    const getExportbuilderByIdApi = async (id: string) => {
        try {
            setState(prev => ({ ...prev, loading: true }));
            const res = await httpRequest('GET', `${config.nodeApiUrl}/builder/recordbuilder/${id}`);
            setState(prev => ({ ...prev, loading: false, exportbuilder: res.data }));
        } catch (error) {
            console.error('error:===========', error);
            toast.error('Failed to fetch Exportbuilder');
        }
    };

    // ============================= DELETE ==================================
    const deleteExportbuilderApi = async (id: string) => {
        try {
            const res = await httpRequest('DELETE', `${config.nodeApiUrl}/builder/recordbuilder/delete/${id}`);
            setState(prev => ({ ...prev, id: '', refresh: (prev.refresh || 0) + 1 }));
            toast.success('Exportbuilder deleted successfully');
            return true;
        } catch (error) {
            console.error('error:===========', error);
            toast.error('Failed to delete Exportbuilder');
        }
    };
    // ============================= get Records ==================================
    const getRecordsApi = async (payload: any) => {
        try {
            const res = await httpRequest('POST', `${config.nodeApiUrl}/idp/history`, payload);
            setState(prev => ({ ...prev, records: res.data, totalRecords: res.total }));
        } catch (error) {
            console.error('error:===========', error);
            toast.error('Failed to fetch records');
        }
    };

    return { createExportbuilderApi, getExportbuilderByIdApi, updateExportbuilderApi, deleteExportbuilderApi, getRecordsApi };
};
