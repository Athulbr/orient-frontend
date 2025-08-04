import { useToastStore } from '../../../components/toast/ToastStore';
import httpRequest from '../../../global-utils/httpRequest';
import { useDashboardState } from './dashboardContext';
import { usePermissionStore } from '../../../zustand-store/PermissionStore';

export const useDashboardApi = () => {
    const { setState } = useDashboardState();
    const toast = useToastStore();
    const { checkPermission } = usePermissionStore();

    // ============================= CREATE DASHBOARD ==================================

    const getRecordsApi = async () => {
        try {
            // if (!checkPermission('read:record')) return;
            setState(prev => ({ ...prev, loadingRecords: true }));
            const res: any = await httpRequest('POST', `${import.meta.env.VITE_NODE_URL}/api/idp/history`, { pageSize: 10, filters: { deleted: false } });
            setState(prev => ({ ...prev, loadingRecords: false, records: res.data }));
            window?.sessionStorage?.setItem('recordIdList', JSON.stringify(res.data.map((item: any) => item._id)));
            return true;
        } catch (error) {
            toast.error('Failed to fetch record');
        }
    };
    const getStatusCountApi = async () => {
        try {
            // if (!checkPermission('read:record')) return;
            setState(prev => ({ ...prev, loadingStatusCounts: true }));
            const res: any = await httpRequest('GET', `${import.meta.env.VITE_NODE_URL}/api/idp/history/status/count`);
            setState(prev => ({ ...prev, loadingStatusCounts: false, statusCounts: { ...res.data[0], total: res.total } }));
        } catch (error) {
            toast.error('Failed to fetch record');
        }
    };
    const getPredefinedTemplatesApi = async () => {
        try {
            // if (!checkPermission('read:template')) return;
            setState(prev => ({ ...prev, loadingPredefinedTemplates: true }));
            const res: any = await httpRequest('POST', `${import.meta.env.VITE_NODE_URL}/api/idp/pre-template`, {
                pageSize: 50,
                custom: true,
                filters: { deleted: false }
            });
            setState(prev => ({ ...prev, loadingPredefinedTemplates: false, predefinedTemplates: res.data }));
            return true;
        } catch (error) {
            toast.error('Failed to fetch predefined template list');
        }
    };
    const getTemplatesApi = async () => {
        try {
            setState(prev => ({ ...prev, loadingTemplates: true }));
            const res: any = await httpRequest('POST', `${import.meta.env.VITE_NODE_URL}/api/idp/template`, {
                pageSize: 15,
                custom: true,
                filters: { deleted: false }
            });
            setState(prev => ({ ...prev, loadingTemplates: false, templates: res.data, totalTemplates: res.total }));
            return true;
        } catch (error) {
            toast.error('Failed to fetch template list');
        }
    };

    return { getRecordsApi, getStatusCountApi, getPredefinedTemplatesApi, getTemplatesApi };
};
