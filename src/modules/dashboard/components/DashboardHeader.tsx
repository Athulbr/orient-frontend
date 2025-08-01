import { Plus } from 'lucide-react';
import { FC } from 'react';
import { Button } from '../../../components/Button';
import { useDashboardState } from '../hooks/dashboardContext';
import { usePermissionStore } from '../../../zustand-store/PermissionStore';
import { useDashboardApi } from '../hooks/useDashboardApi';
import Spinner from '../../../components/Spinner';

export const DashboardHeaderComponent: FC = () => {
  const { state, setState } = useDashboardState();
  const { user } = usePermissionStore();
  const { getPredefinedTemplatesApi } = useDashboardApi();

  const handleCreateTemplate = async () => {
    await getPredefinedTemplatesApi();
    setState({ ...state, showCreateTemplateDialog: true });
  };

  return (
    <section className="flex w-full items-center justify-between gap-y-4 px-2">
      <div className="flex-1 text-xl lg:text-2xl">
        Welcome to Makez.Ai, <span className="capitalize">{user?.firstName}</span>
      </div>
      <Button
        permission="create:template"
        startIcon={state.loadingPredefinedTemplates ? <Spinner size={18} /> : <Plus strokeWidth={1.5} size={18} />}
        onClick={handleCreateTemplate}
      >
        Create Template
      </Button>
    </section>
  );
};
