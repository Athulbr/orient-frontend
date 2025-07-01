import { ArrowRightIcon, ChevronRight, Plus, Search, ThumbsUp, Clock, CheckCircle, AlertCircle, Upload, CircleChevronRight, MoreVertical } from 'lucide-react';
import { Button } from '../../../components/Button';
import { ButtonBox } from '../../../components/ButtonBox';
import { RecordStatusCustomUI } from '../record/list-record/components/RecordStatusCustomUI';
import { DashboardStateProvider, useDashboardState } from './hooks/dashboardContext';
import { FC, useEffect, useState } from 'react';
import { DialogComponent } from '../../../components/DialogComponent';
import { useNavigate } from 'react-router-dom';
import { DashboardHeaderComponent } from '../../dashboard/components/DashboardHeader';
import { StatusCardComponent } from '../../dashboard/components/StatusCard';

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

  return (
    <DashboardStateProvider value={{ state, setState }}>
      <div className="flex flex-1 flex-col gap-y-4 overflow-hidden bg-[#F4F7FE] px-3 pt-2 lg:px-6 lg:pt-5 2xl:pb-4">
        <DashboardHeaderComponent />
        <div className="h-full flex-1 overflow-y-auto p-1">
          <div className="mb-4 flex h-full min-h-400 flex-1 flex-col gap-6 overflow-y-auto lg:min-h-192 2xl:mb-0">
            <div className="flex w-full flex-1 flex-col gap-6 overflow-hidden lg:flex-row">
              <StatusCardComponent />
            </div>
          </div>
        </div>
      </div>
      <CreateDashboardComponent />
      {/* <CreateTemplateComponent /> */}
    </DashboardStateProvider>
  );
};

export default DashboardPage;

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
