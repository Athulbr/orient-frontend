import { useDashboardState } from './dashboardContext';
import { useToastStore } from '../../../../components/toast/ToastStore';
import httpRequest from '../../../../utils/httpRequest';

export const useDashboardApi = () => {
  const { state, setState } = useDashboardState();
  const toast = useToastStore();

  // ============================= CREATE DASHBOARD ==================================

  return {};
};
