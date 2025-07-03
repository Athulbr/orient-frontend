import { FC, useState } from 'react';
import { DashboardHeaderComponent } from './components/DashboardHeader';
import { DashboardStateProvider } from './hooks/dashboardContext';
import RecentFilesCardComponent from './components/RecentFilesCard';
import { StatusCardComponent } from './components/StatusCard';
import { TemplateCardsComponent } from './components/TemplateCards';
import { CreateTemplateComponent } from '../docsnap/template/CreateTemplateComponent';
import { UploadDocumentComponent } from '../docsnap/upload-document';

export interface DashboardStateIF {
  totalRecords: number;
  records: any[];
  templates: any[];
  loadingRecords: boolean;
  loadingTemplates: boolean;
  showCreateTemplateDialog: boolean;
  showUploadDocumentDialog: boolean;
  selectedTemplate: any;
  refresh: number;
}

const initialState = {
  totalRecords: 0,
  records: [],
  loadingRecords: false,
  templates: [],
  loadingTemplates: false,
  showCreateTemplateDialog: false,
  showUploadDocumentDialog: false,
  selectedTemplate: null,
  refresh: 1,
};

const DashboardPage: FC = () => {
  const [state, setState] = useState<DashboardStateIF>(initialState);

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
      <CreateTemplateComponent state={state} setState={setState} />
      {state.showUploadDocumentDialog && (
        <UploadDocumentComponent template={state.selectedTemplate} closeDialog={() => setState({ ...state, showUploadDocumentDialog: false })} />
      )}
    </DashboardStateProvider>
  );
};

export default DashboardPage;
