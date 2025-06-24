import { ArrowRightIcon, ChevronRight, Plus, Search, ThumbsUp, Clock, CheckCircle, AlertCircle, Upload } from 'lucide-react';
import { Button } from '../../../components/Button';
import { UseTablebuilder } from '../../../builders/tablebuilder/render-tablebuilder/components/UseTablebuilder';
import { ButtonBox } from '../../../components/ButtonBox';
import { RecordStatusCustomUI } from '../record/list-record/components/RecordStatusCustomUI';
import { DashboardStateProvider, useDashboardState } from './hooks/dashboardContext';
import { useState } from 'react';
import { DialogComponent } from '../../../components/DialogComponent';
import { useNavigate } from 'react-router-dom';

export interface DashboardStateIF {
  loading: boolean;
  id: string;
  refresh: number;
  dashboard: any | null;
  loadingDashboard: boolean;
  showCreateDialog: boolean;
  showCreateTemplateDialog: boolean;
}

interface DashboardPageIF {
  test?: string;
}

const initialState = {
  loading: false,
  id: '',
  refresh: 1,
  dashboard: null,
  loadingDashboard: false,
  showCreateDialog: false,
  showCreateTemplateDialog: false,
};

const DashboardPage: React.FC<DashboardPageIF> = () => {
  const [state, setState] = useState<DashboardStateIF>(initialState);
  const navigate = useNavigate();
  const customFunctions = {
    rowClickHandler: (row: any) => {
      navigate(`/docsnap/record/view/${row._id}`);
    },
    deleteClickHandler: (row: any) => {},
  };
  const customUI = {
    recordStatus: RecordStatusCustomUI,
  };

  return (
    <DashboardStateProvider value={{ state, setState }}>
      <div className="flex flex-1 flex-col gap-4 overflow-y-auto bg-[oklch(0.98_0.01_254.61)] p-6">
        <HeaderComponent />
        <div className="flex flex-1 gap-6 overflow-y-auto">
          <div className="flex flex-1 flex-col overflow-y-auto rounded-2xl border bg-white p-4">
            <div className="flex items-center justify-between px-1">
              <h5 className="font-semibold">Recent Files</h5>
              <span onClick={() => navigate('/docsnap/record/list')} className="flex cursor-pointer items-center gap-2 text-sm text-sky-500 hover:text-sky-600">
                View All <ChevronRight size={16} />
              </span>
            </div>
            <UseTablebuilder
              customUI={customUI}
              externalFilters={{ deleted: false }}
              fluidHeight
              refresh={1}
              name="Recent Files Table"
              customFunctions={customFunctions}
            />
          </div>
          <div className="w-[30%]">
            <StatusCardComponent />
          </div>
        </div>
        <div className="flex h-50 w-full justify-around">
          <DocumentCardComponent name="Driving Licence" />
          <DocumentCardComponent name="Invoice" />
          <DocumentCardComponent name="Purchase Order" />
          <DocumentCardComponent name="Insurance" />
          <DocumentCardComponent name="Receipt" />
        </div>
      </div>
      <CreateDashboardComponent />
      <CreateTemplateComponent />
    </DashboardStateProvider>
  );
};

export default DashboardPage;

const DocumentCardComponent = ({ name }: { name: string }) => {
  const { state, setState } = useDashboardState();
  return (
    <div onClick={() => setState({ ...state, showCreateDialog: true })} className="flex-1 p-2">
      <div className="flex h-full flex-col gap-4 rounded-2xl bg-white p-4">
        <div className="flex flex-1 items-center justify-center gap-2 border-b">
          <div className="h-15 w-15 rounded-2xl border bg-yellow-400"></div>
          <p className="text-sm font-semibold text-gray-700">{name}</p>
        </div>
        <ButtonBox>
          <Button outlined startIcon={<Upload size={16} />}>
            Upload
          </Button>
        </ButtonBox>
      </div>
    </div>
  );
};
const HeaderComponent = () => {
  const { state, setState } = useDashboardState();
  return (
    <section className="flex w-full items-center justify-between gap-4 px-2">
      <div className="flex-1 text-2xl font-semibold">Welcome to Makez.ai, John</div>
      {/* <div className="flex max-w-100 flex-1 items-center rounded-md border pl-3">
        <Search className="text-gray-500" size={20} />
        <input className="h-10 flex-1 px-4 text-sm outline-none" placeholder="Search" />
      </div> */}
      <Button startIcon={<Plus size={18} />} onClick={() => setState({ ...state, showCreateTemplateDialog: true })}>
        Create Template
      </Button>
    </section>
  );
};

const CreateDashboardComponent = () => {
  const { state, setState } = useDashboardState();
  return (
    <DialogComponent
      className="h-[calc(100vh-200px)] w-[calc(100vw-400px)]"
      name="View"
      isOpen={state.showCreateDialog}
      closeDialog={() => setState({ ...state, showCreateDialog: false })}
    >
      <div>View Document</div>
    </DialogComponent>
  );
};
const CreateTemplateComponent = () => {
  const { state, setState } = useDashboardState();
  return (
    <DialogComponent
      className="h-[calc(100vh-200px)] w-[calc(100vw-400px)]"
      name="Create Template"
      isOpen={state.showCreateTemplateDialog}
      closeDialog={() => setState({ ...state, showCreateTemplateDialog: false })}
    >
      <div>Create Template</div>
    </DialogComponent>
  );
};

const StatusCardComponent = () => {
  // Example data (replace with real data as needed)
  const totalProcessed = 2341;
  const statusItems = [
    {
      label: 'Processed Documents',
      count: 350,
      icon: (
        <span className="flex h-12 w-12 items-center justify-center rounded-full bg-green-100">
          <ThumbsUp className="text-[#53c31c]" size={24} />
        </span>
      ),
    },
    {
      label: 'In Progress',
      count: 910,
      icon: (
        <span className="flex h-12 w-12 items-center justify-center rounded-full bg-orange-100">
          <Clock className="text-yellow-500" fill="#fde68a" size={24} />
        </span>
      ),
    },
    {
      label: 'Ready to Review',
      count: 660,
      icon: (
        <span className="flex h-12 w-12 items-center justify-center rounded-full bg-purple-100">
          <CheckCircle className="text-purple-500" fill="#e9d5ff" size={24} />
        </span>
      ),
    },
    {
      label: 'Invalid Files',
      count: 421,
      icon: (
        <span className="flex h-12 w-12 items-center justify-center rounded-full bg-red-100">
          <AlertCircle className="text-red-500" fill="#fecaca" size={24} />
        </span>
      ),
    },
  ];

  return (
    <div className="h-full rounded-2xl border bg-white p-6 shadow-sm">
      <div className="mb-4 flex items-center justify-between">
        <div className="text-lg font-semibold">Quick Summary</div>
        <a href="#" className="text-sm text-sky-500 hover:underline">
          See More
        </a>
      </div>
      <div className="mb-4 flex items-center justify-between rounded-xl border bg-white p-4">
        <div className="text-3xl font-bold">{totalProcessed}</div>
        <div className="text-sm text-gray-500">Processed Documents</div>
      </div>
      <div className="space-y-4">
        {statusItems.map((item, idx) => (
          <div key={item.label} className="flex cursor-pointer items-center justify-between rounded-xl border bg-white p-3 transition hover:shadow">
            <div className="flex items-center gap-3">
              {item.icon}
              <div className="flex flex-col gap-2">
                <div className="text-sm text-gray-500">{item.label}</div>
                <div className="text-xl font-semibold text-gray-700">{item.count}</div>
              </div>
            </div>
            <ChevronRight className="text-sky-500" size={20} />
          </div>
        ))}
      </div>
    </div>
  );
};
