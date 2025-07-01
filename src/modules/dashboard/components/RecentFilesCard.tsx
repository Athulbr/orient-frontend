import { ChevronRight } from 'lucide-react';
import { StatusBadge } from './StatusBadge';
import { useNavigate } from 'react-router-dom';
import { useEffect } from 'react';
import { useDashboardApi } from '../hooks/useDashboardApi';
import { useDashboardState } from '../hooks/dashboardContext';
import { formatDate } from '../../../builders/tablebuilder/render-tablebuilder/utils/formatDate';
import FullScreenLoader from '../../../components/FullScreenLoader';

const RecentFilesCardComponent: React.FC = () => {
  const { state, setState } = useDashboardState();

  const navigate = useNavigate();
  const { getRecordsApi } = useDashboardApi();

  useEffect(() => {
    getRecordsApi();
  }, []);

  return (
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
      {state.loadingRecords ? (
        <FullScreenLoader />
      ) : (
        <div className="h-full overflow-y-auto">
          <table className="min-w-full">
            <thead className="sticky top-0 left-0 border-b border-gray-100 bg-white text-nowrap">
              <tr>
                <th className="px-5 py-4 text-left text-sm font-bold text-gray-800">Name</th>
                <th className="px-5 py-4 text-left text-sm font-bold text-gray-800">Document Type</th>
                <th className="px-5 py-4 text-left text-sm font-bold text-gray-800">Extracted By</th>
                <th className="px-5 py-4 text-left text-sm font-bold text-gray-800">Status</th>
                <th className="px-5 py-4 text-left text-sm font-bold text-gray-800">Completed On</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 bg-white">
              {state.records.map((row, idx) => (
                <tr key={idx} className="cursor-pointer">
                  <td className="max-w-75 min-w-50 px-5 py-4 text-sm font-light whitespace-nowrap text-gray-900">{row.name}</td>
                  <td className="max-w-75 min-w-50 px-5 py-4 text-sm font-light whitespace-nowrap text-gray-900">{row.documentType}</td>
                  <td className="max-w-75 min-w-50 px-5 py-4 text-sm font-light whitespace-nowrap text-gray-900">{row.extractedBy}</td>
                  <td className="max-w-75 min-w-50 px-5 py-4 text-sm whitespace-nowrap">
                    <StatusBadge status={'Review'} />
                  </td>
                  <td className="max-w-75 min-w-50 px-7 py-4 text-sm font-light whitespace-nowrap text-gray-900">{formatDate(row.updatedAt)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default RecentFilesCardComponent;

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
