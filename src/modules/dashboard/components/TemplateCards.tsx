import { ChevronRight, MoreVertical, Upload } from 'lucide-react';
import { Button } from '../../../components/Button';
import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDashboardState } from '../hooks/dashboardContext';
import { useDashboardApi } from '../hooks/useDashboardApi';
import { Dropdown } from '../../../components/Dropdown';

interface TemplateCardsComponentIF {
  test?: string;
}

export const TemplateCardsComponent: React.FC<TemplateCardsComponentIF> = () => {
  const { state, setState } = useDashboardState();

  const navigate = useNavigate();
  const { getTemplatesApi } = useDashboardApi();

  useEffect(() => {
    getTemplatesApi();
  }, []);
  return (
    <div className="relative">
      <div
        onClick={() => navigate('/docsnap/template/list')}
        className="absolute top-0 right-0 z-1 flex h-full w-25 cursor-pointer items-center justify-center gap-1 border border-sky-200 bg-white text-sm text-nowrap text-sky-600 hover:bg-gray-100"
      >
        View All
        <ChevronRight size={14} />
      </div>
      {state.loadingTemplates ? (
        <div className="flex min-h-40 gap-6 overflow-x-auto pr-30">
          {Array.from({ length: 5 }).map((_, idx) => (
            <TemplateCardComponent key={idx} isLoading />
          ))}
        </div>
      ) : (
        <div className="flex min-h-40 gap-6 overflow-x-auto pr-30">
          {state.templates.map((template, idx) => (
            <TemplateCardComponent key={idx} name={template.name} />
          ))}
        </div>
      )}
    </div>
  );
};

export const TemplateCardComponent = ({
  name,
  uploaded = 0,
  pending = 0,
  approved = 0,
  onUpload,
  isLoading = false,
}: {
  name?: string;
  uploaded?: number;
  pending?: number;
  approved?: number;
  onUpload?: () => void;
  isLoading?: boolean;
}) => {
  if (isLoading) {
    return (
      <div className="relative flex h-40 min-w-80 flex-col justify-between rounded-2xl border border-gray-200 bg-gradient-to-br from-gray-50 to-white px-3 py-4 transition">
        {/* Title and Menu Row */}
        <div className="mb-2 flex w-full items-start justify-between">
          <div className="h-4 w-24 animate-pulse rounded bg-gray-200" />
          <div className="h-8 w-8 animate-pulse rounded bg-gray-200" />
        </div>
        {/* Stats Row */}
        <div className="mb-2 flex w-full justify-between">
          <div className="flex flex-col items-center">
            <div className="h-3 w-12 animate-pulse rounded bg-gray-200" />
            <div className="mt-0.5 h-4 w-8 animate-pulse rounded bg-gray-200" />
          </div>
          <div className="flex flex-col items-center">
            <div className="h-3 w-12 animate-pulse rounded bg-gray-200" />
            <div className="mt-0.5 h-4 w-8 animate-pulse rounded bg-gray-200" />
          </div>
          <div className="flex flex-col items-center">
            <div className="h-3 w-12 animate-pulse rounded bg-gray-200" />
            <div className="mt-0.5 h-4 w-8 animate-pulse rounded bg-gray-200" />
          </div>
        </div>
        {/* Upload Button Row */}
        <div className="mt-auto flex w-full justify-end">
          <div className="h-8 w-24 animate-pulse rounded bg-gray-200" />
        </div>
      </div>
    );
  }

  return (
    <div className="relative flex h-40 min-w-80 flex-col justify-between rounded-2xl border border-gray-200 bg-gradient-to-br from-gray-50 to-white px-3 py-4 transition">
      {/* Title and Menu Row */}
      <div className="mb-2.5 flex w-full items-start justify-between">
        <div className="text font-semibold text-gray-800">{name}</div>
        <Dropdown options={['Test-1', 'Test-2']} onChange={() => {}}>
          <button className="cursor-pointer rounded-md border border-gray-200 bg-white p-1.5 text-gray-500 hover:bg-gray-100">
            <MoreVertical size={18} />
          </button>
        </Dropdown>
      </div>
      {/* Stats Row */}
      <div className="mb-2 flex w-full justify-between">
        <div className="flex flex-col items-center">
          <span className="text-xs text-gray-500">Uploaded</span>
          <span className="mt-0.5 font-semibold text-gray-600">{uploaded}</span>
        </div>
        <div className="flex flex-col items-center">
          <span className="text-xs text-gray-500">Pending</span>
          <span className="mt-0.5 font-semibold text-gray-600">{pending}</span>
        </div>
        <div className="flex flex-col items-center">
          <span className="text-xs text-gray-500">Approved</span>
          <span className="mt-0.5 font-semibold text-gray-600">{approved}</span>
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
