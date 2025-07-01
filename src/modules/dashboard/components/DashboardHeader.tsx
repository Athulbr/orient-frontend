import { Plus } from 'lucide-react';
import { FC } from 'react';
import { Button } from '../../../components/Button';
import { useDashboardState } from '../hooks/dashboardContext';

export const DashboardHeaderComponent: FC = () => {
  const { state, setState } = useDashboardState();
  return (
    <section className="flex w-full items-center justify-between gap-y-4 px-3">
      <div className="flex-1 text-xl lg:text-2xl">Welcome to Makez.ai, John</div>
      {/* <div className="flex max-w-100 flex-1 items-center rounded-md border pl-3">
          <Search className="text-gray-500" size={20} />
          <input className="h-10 flex-1 px-4 text-sm outline-none" placeholder="Search" />
        </div> */}
      <Button startIcon={<Plus strokeWidth={1.5} size={18} />} onClick={() => setState({ ...state, showCreateTemplateDialog: true })}>
        Create Template
      </Button>
    </section>
  );
};
