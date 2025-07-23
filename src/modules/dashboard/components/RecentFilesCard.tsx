import { ChevronRight } from 'lucide-react';
import { StatusBadge } from './StatusBadge';
import { useNavigate } from 'react-router-dom';
import { useEffect } from 'react';
import { useDashboardApi } from '../hooks/useDashboardApi';
import { useDashboardState } from '../hooks/dashboardContext';
import { formatDate } from '../../../builders/tablebuilder/render-tablebuilder/utils/formatDate';
import SkeletonLoader from './SkeletonLoader';

const RecentFilesCardComponent: React.FC = () => {
  const { state, setState } = useDashboardState();

  const navigate = useNavigate();
  const { getRecordsApi } = useDashboardApi();

  useEffect(() => {
    getRecordsApi();
  }, []);

  return (
    <div className="flex h-auto flex-1 flex-col gap-y-3 overflow-y-hidden rounded-2xl border border-[#F9F0FF] bg-white px-3 lg:h-full lg:flex-1 lg:px-4">
      <div className="flex items-center justify-between px-4 pt-6">
        <h5 className="text-gray-800">Recent Files</h5>
        <span
          onClick={() => navigate('/docsnap/record/list')}
          className="flex cursor-pointer items-center gap-2 text-sm font-light text-sky-600 hover:text-sky-600"
        >
          View All <ChevronRight size={14} className="text-sky-600" />
        </span>
      </div>
      {state.loadingRecords ? (
        <SkeletonLoader />
      ) : state.records.length > 0 ? (
        <div className="h-full overflow-y-hidden">
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
                <tr key={idx} className="cursor-pointer" onClick={() => navigate(`/docsnap/record/view/${row._id}`)}>
                  <td title={row.name} className="max-w-50 min-w-25 truncate px-5 py-4 text-sm font-light whitespace-nowrap text-gray-900">
                    {row.name}
                  </td>
                  <td className="max-w-50 min-w-25 px-5 py-4 text-sm font-light whitespace-nowrap text-gray-900">{row.documentType}</td>
                  <td className="max-w-50 min-w-25 px-5 py-4 text-sm font-light whitespace-nowrap text-gray-900">{row.extractedBy}</td>
                  <td className="max-w-50 min-w-25 px-5 py-4 text-sm whitespace-nowrap">
                    <StatusBadge status={'Review'} />
                  </td>
                  <td className="max-w-50 min-w-25 px-7 py-4 text-sm font-light whitespace-nowrap text-gray-900">{formatDate(row.updatedAt)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="flex h-full w-full items-center justify-center rounded-2xl bg-white text-gray-400">Your recently uploaded files will appear here</div>
      )}
    </div>
  );
};

export default RecentFilesCardComponent;
