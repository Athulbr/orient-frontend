import { ChevronRight, MoreVertical, Upload } from 'lucide-react';
import { Button } from '../../../components/Button';
import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDashboardState } from '../hooks/dashboardContext';
import { useDashboardApi } from '../hooks/useDashboardApi';

interface TemplateCardsComponentIF {
  test?: string;
}

export const TemplateCardsComponent: React.FC<TemplateCardsComponentIF> = () => {
  const { state, setState } = useDashboardState();

  const navigate = useNavigate();
  const { getTemplatesApi } = useDashboardApi();

  console.log('state.templates:===========', state.templates);

  useEffect(() => {
    getTemplatesApi();
  }, []);
  if (!state.templates || state.templates.length === 0) return null;
  return (
    <div className="relative">
      <div
        onClick={() => navigate('/docsnap/template/list')}
        className="absolute top-0 right-0 z-1 flex h-full w-25 cursor-pointer items-center justify-center gap-1 border border-sky-200 bg-white text-sm text-nowrap text-sky-600 hover:bg-gray-100"
      >
        View All
        <ChevronRight size={14} />
      </div>
      <div className="flex min-h-40 gap-6 overflow-x-auto pr-30">
        {state.templates.map((template, idx) => (
          <TemplateCardComponent key={idx} name={template.name} />
        ))}
      </div>
    </div>
  );
};

const TemplateCardComponent = ({
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
