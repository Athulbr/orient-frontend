import { useToastStore } from '../../../components/toast/ToastStore';
import httpRequest from '../../../utils/httpRequest';
import { useDashboardState } from './dashboardContext';

export const useDashboardApi = () => {
  const { setState } = useDashboardState();
  const toast = useToastStore();

  // ============================= CREATE DASHBOARD ==================================

  const getRecordsApi = async () => {
    try {
      setState(prev => ({ ...prev, loadingRecords: true }));
      const res: any = await httpRequest('POST', `${import.meta.env.VITE_NODE_URL}/api/idp/history`, { pageSize: 15, filters: { deleted: false } });
      setState(prev => ({ ...prev, loadingRecords: false, records: res.data, totalRecords: res.total }));
      return true;
    } catch (error) {
      console.error('error:===========', error);
      toast.error('Failed to fetch record');
    }
  };
  const getTemplatesApi = async () => {
    try {
      setState(prev => ({ ...prev, loadingTemplates: true }));
      const res: any = await httpRequest('POST', `${import.meta.env.VITE_NODE_URL}/api/idp/template`, { pageSize: 15, filters: { deleted: false } });
      setState(prev => ({ ...prev, loadingTemplates: false, templates: res.data }));
      return true;
    } catch (error) {
      console.error('error:===========', error);
      toast.error('Failed to fetch template');
    }
  };

  return { getRecordsApi, getTemplatesApi };
};
