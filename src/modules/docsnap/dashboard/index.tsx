import { ArrowRightIcon, ChevronRight, Plus, Search, ThumbsUp, Clock, CheckCircle, AlertCircle, Upload, CircleChevronRight, MoreVertical } from 'lucide-react';
import { Button } from '../../../components/Button';
import { UseTablebuilder } from '../../../builders/tablebuilder/render-tablebuilder/components/UseTablebuilder';
import { ButtonBox } from '../../../components/ButtonBox';
import { RecordStatusCustomUI } from '../record/list-record/components/RecordStatusCustomUI';
import { DashboardStateProvider, useDashboardState } from './hooks/dashboardContext';
import { FC, useState } from 'react';
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
      <div className="flex flex-1 flex-col gap-4 overflow-hidden px-1 py-2 lg:px-6 lg:py-6">
        <DashboardHeaderComponent />
        <div className="h-full flex-1 overflow-y-auto p-1">
          <div className="flex h-full min-h-400 flex-1 flex-col gap-6 overflow-y-auto lg:min-h-192">
            <div className="flex w-full flex-1 flex-col gap-6 overflow-hidden lg:flex-row">
              <div className="h-auto flex-1 overflow-y-hidden rounded-2xl border bg-white px-1 lg:h-full lg:flex-1 lg:px-4">
                <div className="flex items-center justify-between px-2 pt-4">
                  <h5 className="font-semibold">Recent Files</h5>
                  <span
                    onClick={() => navigate('/docsnap/record/list')}
                    className="flex cursor-pointer items-center gap-2 text-sm text-sky-500 hover:text-sky-600"
                  >
                    View All <ChevronRight size={14} className="text-gray-500" />
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
              <StatusCardComponent />
            </div>
            <div className="relative">
              <div
                onClick={() => navigate('/docsnap/template/list')}
                className="absolute top-0 right-0 z-1 flex h-full w-25 cursor-pointer items-center justify-center gap-1 border border-sky-200 bg-white text-sm text-nowrap text-sky-600 hover:bg-gray-100"
              >
                View All
                <ChevronRight size={14} />
              </div>
              <div className="flex min-h-40 gap-6 overflow-x-auto pr-30">
                <TemplateCardComponent name="Driving Licence" />
                <TemplateCardComponent name="Invoice" />
                <TemplateCardComponent name="Purchase Order" />
                <TemplateCardComponent name="Insurance" />
                <TemplateCardComponent name="Receipt" />
                <TemplateCardComponent name="ID Card" />
              </div>
            </div>
          </div>
        </div>
      </div>
      <CreateDashboardComponent />
      <CreateTemplateComponent />
    </DashboardStateProvider>
  );
};

export default DashboardPage;

export const TemplateCardComponent = ({
  name,
  uploaded = 0,
  pending = 0,
  approved = 0,
  onUpload,
}: {
  name: string;
  uploaded?: number;
  pending?: number;
  approved?: number;
  onUpload?: () => void;
}) => {
  return (
    <div className="relative flex h-40 min-w-80 flex-col justify-between rounded-2xl border border-gray-200 bg-gradient-to-br from-white to-gray-50 p-4 shadow-sm transition hover:shadow-md">
      {/* Title and Menu Row */}
      <div className="mb-2 flex w-full items-start justify-between">
        <div className="text-lg font-semibold text-gray-800">{name}</div>
        <button className="cursor-pointer rounded-md border border-gray-200 bg-white p-1.5 text-gray-500 hover:bg-gray-100">
          <MoreVertical size={18} />
        </button>
      </div>
      {/* Stats Row */}
      <div className="mb-2 flex w-full justify-between">
        <div className="flex flex-col items-center">
          <span className="text-xs text-gray-500">Uploaded</span>
          <span className="mt-0.5 text-base font-semibold text-gray-800">{uploaded}</span>
        </div>
        <div className="flex flex-col items-center">
          <span className="text-xs text-gray-500">Pending</span>
          <span className="mt-0.5 text-base font-semibold text-gray-800">{pending}</span>
        </div>
        <div className="flex flex-col items-center">
          <span className="text-xs text-gray-500">Approved</span>
          <span className="mt-0.5 text-base font-semibold text-gray-800">{approved}</span>
        </div>
      </div>
      {/* Upload Button Row */}
      <div className="mt-auto flex w-full justify-end">
        <Button startIcon={<Upload size={16} />} onClick={onUpload} small>
          Upload
        </Button>
      </div>
    </div>
  );
};

const DashboardHeaderComponent: FC = () => {
  const { state, setState } = useDashboardState();
  return (
    <section className="flex w-full items-center justify-between gap-4 px-2">
      <div className="flex-1 text-xl font-semibold lg:text-2xl">Welcome to Makez.ai, John</div>
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
      className="h-[400px] w-[800px]"
      name="Create Template"
      isOpen={state.showCreateTemplateDialog}
      closeDialog={() => setState({ ...state, showCreateTemplateDialog: false })}
      primaryButtonText="Create Template"
    >
      <div className="h-full p-6">
        <div className="flex h-full flex-col gap-6">
          <div className="flex w-full items-center rounded-md border pl-3">
            <Search className="text-gray-500" size={20} />
            <input className="h-10 flex-1 px-4 text-sm outline-none" placeholder="Search" />
          </div>
          <div className="flex h-full w-full flex-wrap gap-x-4">
            <div className="flex h-12 w-56 cursor-pointer items-center justify-between rounded-md border bg-white p-3 text-sm">
              Driving Licence
              <CircleChevronRight size={14} className="text-gray-500" />
            </div>
            <div className="flex h-12 w-56 cursor-pointer items-center justify-between rounded-md border bg-white p-3 text-sm">
              Invoice
              <CircleChevronRight size={14} className="text-gray-500" />
            </div>
            <div className="flex h-12 w-56 cursor-pointer items-center justify-between rounded-md border bg-white p-3 text-sm">
              Purchase Order
              <CircleChevronRight size={14} className="text-gray-500" />
            </div>
            <div className="flex h-12 w-56 cursor-pointer items-center justify-between rounded-md border bg-white p-3 text-sm">
              Insurance
              <CircleChevronRight size={14} className="text-gray-500" />
            </div>
            <div className="flex h-12 w-56 cursor-pointer items-center justify-between rounded-md border bg-white p-3 text-sm">
              Receipt
              <CircleChevronRight size={14} className="text-gray-500" />
            </div>
            <div className="flex h-12 w-56 cursor-pointer items-center justify-between rounded-md border bg-white p-3 text-sm">
              ID Card
              <CircleChevronRight size={14} className="text-gray-500" />
            </div>
          </div>
        </div>
      </div>
    </DialogComponent>
  );
};

const StatusCardComponent = () => {
  // Example data (replace with real data as needed)
  const totalDocuments = 2341;
  const statusItems = [
    {
      label: 'Processed Documents',
      count: 350,
      icon: (
        <span className="flex h-12 w-12 items-center justify-center rounded-full bg-green-100">
          <ThumbsUp className="text-[#53c31c]" size={28} />
        </span>
      ),
    },
    {
      label: 'In Progress',
      count: 910,
      icon: (
        <span className="flex h-12 w-12 items-center justify-center rounded-full bg-yellow-100">
          <Clock className="text-yellow-500" size={28} />
        </span>
      ),
    },
    {
      label: 'Ready to Review',
      count: 660,
      icon: (
        <span className="flex h-12 w-12 items-center justify-center rounded-full bg-blue-100">
          <CheckCircle className="text-blue-500" size={28} />
        </span>
      ),
    },
    {
      label: 'Invalid Files',
      count: 421,
      icon: (
        <span className="flex h-12 w-12 items-center justify-center rounded-full bg-red-100">
          <AlertCircle className="text-red-500" size={28} />
        </span>
      ),
    },
  ];

  return (
    // <div className="flex h-full flex-col gap-4 rounded-2xl border bg-red-200 p-5 shadow-sm">
    <div className="flex h-fit w-full flex-col gap-4 rounded-2xl border bg-white p-5 shadow-sm lg:h-full lg:w-100">
      <div className="mb-2 flex items-center justify-between">
        <div className="text-lg font-semibold">Quick Summary</div>
        <a href="#" className="flex items-center gap-1 text-sm text-sky-500 hover:underline">
          See More <ChevronRight size={16} />
        </a>
      </div>
      <div className="mb-2 flex items-center justify-between rounded-xl border bg-white p-4">
        <div className="text-4xl font-bold">{totalDocuments}</div>
        <div className="text-base text-gray-500">Total Documents</div>
      </div>
      {/* <div className="border-b" /> */}
      <div className="flex flex-col gap-4">
        {statusItems.map((item, idx) => (
          <div key={item.label} className="flex h-20 cursor-pointer items-center justify-between rounded-xl border bg-white px-5 transition hover:shadow">
            <div className="flex items-center gap-3">
              {item.icon}
              <div className="flex flex-col">
                <span className="text-sm text-gray-500">{item.label}</span>
                <span className="text-2xl font-semibold text-gray-700">{item.count}</span>
              </div>
            </div>
            <ChevronRight className="text-sky-500" size={22} />
          </div>
        ))}
      </div>
    </div>
  );
};
