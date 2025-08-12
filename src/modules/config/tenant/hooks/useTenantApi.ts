import { useTenantState } from './tenantContext';
import { useToastStore } from '../../../../components/toast/ToastStore';
import httpRequest from '../../../../global-utils/httpRequest';

export const useTenantsApi = () => {
    const { state, setState } = useTenantState();
    const toast = useToastStore();

    // ============================= CREATE ==================================

    const createTenantApi = async (payload: any) => {
        try {
            const res = await httpRequest('POST', `${import.meta.env.VITE_NODE_URL}/tenant/create`, payload);
            setState(prev => ({ ...prev, showCreateDialog: false, id: '', refresh: state.refresh + 1 }));
            toast.success('Tenant Created Successfully');
        } catch (error) {
            console.error('error:===========', error);
            toast.error('Failed to Create Tenant');
        }
    };

    const updateTenantApi = async (tenant: any) => {
        try {
            setState(prev => ({ ...prev, loading: true }));
            const res = await httpRequest('PATCH', `${import.meta.env.VITE_NODE_URL}/tenant/update/${state.id}`, tenant);
            setState(prev => ({ ...prev, loading: false, showCreateDialog: false, showCreatePage: false, id: '', refresh: state.refresh + 1 }));
            toast.success('Tenant Updated Successfully');
        } catch (error) {
            console.error('error:===========', error);
            toast.error('Failed to Update Tenant');
        }
    };

    const getTenantByIdApi = async (id: string) => {
        try {
            setState(prev => ({ ...prev, loading: true }));
            const res = await httpRequest('GET', `${import.meta.env.VITE_NODE_URL}/tenant/${id}`);
            toast.success('Tenant fetched successfully');
            setState(prev => ({ ...prev, loading: false, tenant: res.data, fields: res.data.fields }));
        } catch (error) {
            console.error('error:===========', error);
            toast.error('Failed to fetch Tenant');
        }
    };

    const deleteTenantApi = async (id: string) => {
        try {
            const res = await httpRequest('DELETE', `${import.meta.env.VITE_NODE_URL}/tenant/delete/${id}`);
            setState(prev => ({ ...prev, showCreateDialog: false, showCreatePage: false, id: '', refresh: state.refresh + 1 }));
            toast.success('Tenant deleted successfully');
            return true;
        } catch (error) {
            console.error('error:===========', error);
            toast.error('Failed to delete Tenant');
        }
    };

    return { createTenantApi, getTenantByIdApi, updateTenantApi, deleteTenantApi };
};
