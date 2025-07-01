import { FC, useState } from 'react';
import { DashboardHeaderComponent } from './components/DashboardHeader';
import { DashboardStateProvider } from './hooks/dashboardContext';
import RecentFilesCardComponent from './components/RecentFilesCard';
import { StatusCardComponent } from './components/StatusCard';
import { useNavigate } from 'react-router-dom';
import { TemplateCardsComponent } from './components/TemplateCards';

export interface DashboardStateIF {
  records: any[];
  templates: any[];
}

const initialState = {
  records: [],
  templates: [],
};

const DashboardPage: FC = () => {
  const [state, setState] = useState<DashboardStateIF>(initialState);
  const navigate = useNavigate();

  return (
    <DashboardStateProvider value={{ state, setState }}>
      <div className="flex flex-1 flex-col gap-y-4 overflow-hidden bg-[#F4F7FE] px-3 pt-2 lg:px-6 lg:pt-5 2xl:pb-4">
        <DashboardHeaderComponent />
        <div className="h-full flex-1 overflow-y-auto p-1">
          <div className="mb-4 flex h-full min-h-400 flex-1 flex-col gap-6 overflow-y-auto lg:min-h-192 2xl:mb-0">
            <div className="flex w-full flex-1 flex-col gap-6 overflow-hidden lg:flex-row">
              <RecentFilesCardComponent />
              <StatusCardComponent />
            </div>
            <TemplateCardsComponent />
          </div>
        </div>
      </div>
    </DashboardStateProvider>
  );
};

export default DashboardPage;
