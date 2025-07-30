import { useToastStore } from '../../../components/toast/ToastStore';
import httpRequest from '../../../global-utils/httpRequest';
import { useDashboardState } from './dashboardContext';

export const useDashboardApi = () => {
  const { setState } = useDashboardState();
  const toast = useToastStore();

  // ============================= CREATE DASHBOARD ==================================

  const getRecordsApi = async () => {
    try {
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
      setState(prev => ({ ...prev, loadingStatusCounts: true }));
      const res: any = await httpRequest('GET', `${import.meta.env.VITE_NODE_URL}/api/idp/history/status/count`);
      setState(prev => ({ ...prev, loadingStatusCounts: false, statusCounts: { ...res.data[0], total: res.total } }));
    } catch (error) {
      toast.error('Failed to fetch record');
    }
  };
  const getPredefinedTemplatesApi = async () => {
    try {
      setState(prev => ({ ...prev, loadingPredefinedTemplates: true }));
      const res: any = await httpRequest('POST', `${import.meta.env.VITE_NODE_URL}/api/idp/pre-template`, {
        pageSize: 15,
        custom: true,
        filters: { deleted: false },
      });
      setState(prev => ({ ...prev, loadingPredefinedTemplates: false, predefinedTemplates: res.data, totalPredefinedTemplates: res.total }));
      return true;
    } catch (error) {
      toast.error('Failed to fetch predefined template');
    }
  };
  const getTemplatesApi = async () => {
    try {
      setState(prev => ({ ...prev, loadingTemplates: true }));
      const res: any = await httpRequest('POST', `${import.meta.env.VITE_NODE_URL}/api/idp/template`, {
        pageSize: 15,
        custom: true,
        filters: { deleted: false },
      });
      setState(prev => ({ ...prev, loadingTemplates: false, templates: res.data, totalTemplates: res.total }));
      return true;
    } catch (error) {
      toast.error('Failed to fetch predefined template');
    }
  };

  return { getRecordsApi, getStatusCountApi, getPredefinedTemplatesApi, getTemplatesApi };
};
