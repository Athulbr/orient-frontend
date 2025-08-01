import { Plus } from 'lucide-react';
import { FC } from 'react';
import { Button } from '../../../components/Button';
import { useDashboardState } from '../hooks/dashboardContext';
import { usePermissionStore } from '../../../zustand-store/PermissionStore';

export const DashboardHeaderComponent: FC = () => {
  const { state, setState } = useDashboardState();
  const { user } = usePermissionStore();

  return (
    <section className="flex w-full items-center justify-between gap-y-4 px-2">
      <div className="flex-1 text-xl lg:text-2xl">
        Welcome to Makez.Ai, <span className="capitalize">{user?.firstName}</span>
      </div>
      <Button
        permission="create:template"
        startIcon={<Plus strokeWidth={1.5} size={18} />}
        onClick={() => setState({ ...state, showCreateTemplateDialog: true })}
      >
        Create Template
      </Button>
    </section>
  );
};
