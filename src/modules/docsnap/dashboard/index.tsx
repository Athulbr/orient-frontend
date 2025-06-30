import { ArrowRightIcon, ChevronRight, Plus, Search, ThumbsUp, Clock, CheckCircle, AlertCircle, Upload, CircleChevronRight, MoreVertical } from 'lucide-react';
import { Button } from '../../../components/Button';
import { ButtonBox } from '../../../components/ButtonBox';
import { RecordStatusCustomUI } from '../record/list-record/components/RecordStatusCustomUI';
import { DashboardStateProvider, useDashboardState } from './hooks/dashboardContext';
import { FC, useEffect, useState } from 'react';
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

  useEffect(() => {
    const tablebuilder = window?.sessionStorage?.getItem('tablebuilder');
    const data = tablebuilder ? JSON.parse(tablebuilder) : null;
    console.log('data:===========', data);
  }, []);

  // Dummy data for the table
  const dummyTableData = [
    {
      name: 'PO_Private_001',
      documentType: 'Driving License',
      extractedBy: 'Alex Parker',
      status: 'Processed',
      completedOn: 'Jun 22, 2025, 01:55 PM',
    },
    {
      name: 'PO_Private_456',
      documentType: 'Invoice',
      extractedBy: 'Jamie Lee',
      status: 'Processed',
      completedOn: 'Jun 22, 2025, 02:09 PM',
    },
    {
      name: 'PO_VA_saalfield',
      documentType: 'Purchase Order',
      extractedBy: 'Brandon Michael Herr',
      status: 'Processed',
      completedOn: 'Jun 19, 2025, 01:18 PM',
    },
    {
      name: 'FAX_20241015_1',
      documentType: 'Insurance',
      extractedBy: 'Morgan Thompson',
      status: 'In Progress',
      completedOn: 'Jun 15, 2025, 06:27 AM',
    },
    {
      name: 'FAX_20241015_2',
      documentType: 'ID',
      extractedBy: 'Casey Davis',
      status: 'Review',
      completedOn: 'Jun 12, 2025, 01:10 PM',
    },
    {
      name: 'PO_VA_saalfield2',
      documentType: 'Medical Reports',
      extractedBy: 'Tyler Johnson',
      status: 'Review',
      completedOn: 'Jun 12, 2025, 01:10 PM',
    },
    {
      name: 'PO_Private_002',
      documentType: 'Driving License',
      extractedBy: 'Ashley Nicole Mitchel',
      status: 'Processed',
      completedOn: 'Jun 11, 2025, 06:09 AM',
    },
    {
      name: 'PO_Private_457',
      documentType: 'Invoice',
      extractedBy: 'Jordan Scott',
      status: 'Invalid',
      completedOn: 'Jun 9, 2025, 03:14 PM',
    },
    {
      name: 'INV_2025_001',
      documentType: 'Invoice',
      extractedBy: 'Sarah Wilson',
      status: 'Processed',
      completedOn: 'Jun 8, 2025, 11:30 AM',
    },
    {
      name: 'DL_CA_12345',
      documentType: 'Driving License',
      extractedBy: 'Michael Chen',
      status: 'In Progress',
      completedOn: 'Jun 7, 2025, 09:15 AM',
    },
    {
      name: 'INS_POL_789',
      documentType: 'Insurance',
      extractedBy: 'Emily Rodriguez',
      status: 'Review',
      completedOn: 'Jun 6, 2025, 04:45 PM',
    },
    {
      name: 'PO_TECH_2025',
      documentType: 'Purchase Order',
      extractedBy: 'David Kim',
      status: 'Processed',
      completedOn: 'Jun 5, 2025, 02:20 PM',
    },
    {
      name: 'REC_GROCERY_001',
      documentType: 'Receipt',
      extractedBy: 'Lisa Anderson',
      status: 'Invalid',
      completedOn: 'Jun 4, 2025, 07:30 AM',
    },
    {
      name: 'ID_PASSPORT_456',
      documentType: 'ID',
      extractedBy: 'Robert Taylor',
      status: 'Processed',
      completedOn: 'Jun 3, 2025, 01:55 PM',
    },
    {
      name: 'MED_REPORT_789',
      documentType: 'Medical Reports',
      extractedBy: 'Jennifer Brown',
      status: 'In Progress',
      completedOn: 'Jun 2, 2025, 10:10 AM',
    },
    {
      name: 'INV_FREELANCE_2025',
      documentType: 'Invoice',
      extractedBy: 'Christopher Lee',
      status: 'Review',
      completedOn: 'Jun 1, 2025, 03:25 PM',
    },
    {
      name: 'DL_NY_67890',
      documentType: 'Driving License',
      extractedBy: 'Amanda Garcia',
      status: 'Processed',
      completedOn: 'May 31, 2025, 08:40 AM',
    },
    {
      name: 'INS_AUTO_456',
      documentType: 'Insurance',
      extractedBy: 'Kevin Martinez',
      status: 'Invalid',
      completedOn: 'May 30, 2025, 12:15 PM',
    },
  ];

  // Status badge component
  const StatusBadge = ({ status }: { status: string }) => {
    let color = '';
    let icon = null;
    switch (status) {
      case 'Processed':
        color = 'bg-green-100 text-green-700 border-green-300';
        icon = <ThumbsUp size={14} className="mr-2 text-green-500" />;
        break;
      case 'In Progress':
        color = 'bg-yellow-100 text-yellow-700 border-yellow-300';
        icon = <Clock size={14} className="mr-2 text-yellow-500" />;
        break;
      case 'Review':
        color = 'bg-blue-100 text-blue-700 border-blue-300';
        icon = <CheckCircle size={14} className="mr-2 text-blue-500" />;
        break;
      case 'Invalid':
        color = 'bg-red-100 text-red-700 border-red-300';
        icon = <AlertCircle size={14} className="mr-2 text-red-500" />;
        break;
      default:
        color = 'bg-gray-100 text-gray-700 border-gray-300';
    }
    return (
      <span className={`inline-flex items-center rounded-md border px-2 py-1 text-xs font-medium ${color}`}>
        {icon}
        {status}
      </span>
    );
  };

  return (
    <DashboardStateProvider value={{ state, setState }}>
      <div className="flex flex-1 flex-col gap-y-4 overflow-hidden bg-[#F4F7FE] px-3 pt-2 lg:px-6 lg:pt-5 2xl:pb-4">
        <DashboardHeaderComponent />
        <div className="h-full flex-1 overflow-y-auto p-1">
          <div className="mb-4 flex h-full min-h-400 flex-1 flex-col gap-6 overflow-y-auto lg:min-h-192 2xl:mb-0">
            <div className="flex w-full flex-1 flex-col gap-6 overflow-hidden lg:flex-row">
              <div className="flex h-auto flex-1 flex-col gap-y-4 overflow-y-hidden rounded-2xl border border-[#F9F0FF] bg-white px-3 lg:h-full lg:flex-1 lg:px-4">
                <div className="flex items-center justify-between px-2 pt-4">
                  <h5 className="text-gray-800">Recent Files</h5>
                  <span
                    onClick={() => navigate('/docsnap/record/list')}
                    className="flex cursor-pointer items-center gap-2 text-sm font-light text-sky-600 hover:text-sky-600"
                  >
                    View All <ChevronRight size={14} className="text-sky-600" />
                  </span>
                </div>
                <div className="h-full overflow-y-auto">
                  <table className="min-w-full">
                    <thead className="sticky top-0 left-0 border-b border-gray-100 bg-white text-nowrap">
                      <tr>
                        <th className="px-3 py-4 text-left text-sm font-bold text-gray-800">Name</th>
                        <th className="px-3 py-4 text-left text-sm font-bold text-gray-800">Document Type</th>
                        <th className="px-3 py-4 text-left text-sm font-bold text-gray-800">Extracted By</th>
                        <th className="px-3 py-4 text-left text-sm font-bold text-gray-800">Status</th>
                        <th className="px-3 py-4 text-left text-sm font-bold text-gray-800">Completed On</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100 bg-white">
                      {dummyTableData.map((row, idx) => (
                        <tr key={idx} className="cursor-pointer">
                          <td className="max-w-75 min-w-50 px-3 py-4 text-sm font-light whitespace-nowrap text-gray-900">{row.name}</td>
                          <td className="max-w-75 min-w-50 px-3 py-4 text-sm font-light whitespace-nowrap text-gray-900">{row.documentType}</td>
                          <td className="max-w-75 min-w-50 px-3 py-4 text-sm font-light whitespace-nowrap text-gray-900">{row.extractedBy}</td>
                          <td className="max-w-75 min-w-50 px-3 py-4 text-sm whitespace-nowrap">
                            <StatusBadge status={row.status} />
                          </td>
                          <td className="max-w-75 min-w-50 px-3 py-4 text-sm font-light whitespace-nowrap text-gray-900">{row.completedOn}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
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
    <div className="relative flex h-40 min-w-80 flex-col justify-between rounded-2xl border border-gray-200 bg-gradient-to-br from-gray-50 to-white px-3 py-4 transition">
      {/* Title and Menu Row */}
      <div className="mb-2 flex w-full items-start justify-between">
        <div className="text font-semibold text-gray-800">{name}</div>
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
  const totalDocuments = 2461;

  return (
    // <div className="flex h-full flex-col gap-y-4 px-3 rounded-2xl border bg-red-200 p-5 shadow-sm">
    <div className="order-[-1] flex h-fit w-full flex-col gap-y-4 rounded-2xl border border-[#F9F0FF] bg-white px-5 py-6 lg:order-1 lg:h-full lg:w-100">
      <div className="flex items-center justify-between">
        <div className="text-gray-800">Quick Summary</div>
        {/* <a href="#" className="flex items-center gap-1 text-sm text-sky-500 hover:underline">
          See More <ChevronRight size={16} />
        </a> */}
      </div>
      <div className="mb-1 flex items-center justify-between rounded-xl border bg-white px-4 py-4 xl:py-6">
        <div className="text-[24px]">{totalDocuments}</div>
        <div className="text-sm font-light text-gray-500">Total Documents</div>
      </div>
      {/* <div className="border-b" /> */}
      <div className="flex h-full flex-col gap-y-4">
        {statusItems.map((item, idx) => (
          <div key={item.label} className="flex min-h-17 flex-1 cursor-pointer items-center justify-between rounded-xl border bg-white px-5 transition">
            <div className="flex items-center gap-3">
              {item.icon}
              <div className="flex flex-col">
                <span className="text-[12px] font-light text-gray-500">{item.label}</span>
                <span className="font-semibold text-gray-700">{item.count}</span>
              </div>
            </div>
            <ChevronRight className="text-sky-500" size={22} />
          </div>
        ))}
      </div>
    </div>
  );
};

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
    label: 'Ready to Review',
    count: 660,
    icon: (
      <span className="flex h-12 w-12 items-center justify-center rounded-full bg-blue-100">
        <CheckCircle className="text-blue-500" size={28} />
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
    label: 'Invalid Files',
    count: 421,
    icon: (
      <span className="flex h-12 w-12 items-center justify-center rounded-full bg-red-100">
        <AlertCircle className="text-red-500" size={28} />
      </span>
    ),
  },
  {
    label: 'Failed Files',
    count: 120,
    icon: (
      <span className="flex h-12 w-12 items-center justify-center rounded-full bg-red-100">
        <AlertCircle className="text-red-500" size={28} />
      </span>
    ),
  },
];
