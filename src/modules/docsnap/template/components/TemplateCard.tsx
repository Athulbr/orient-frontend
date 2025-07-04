import { MoreVertical, Upload } from 'lucide-react';
import { Dropdown } from '../../../../components/Dropdown';
import { Button } from '../../../../components/Button';
import httpRequest from '../../../../global-utils/httpRequest';
import { useToastStore } from '../../../../components/toast/ToastStore';
interface PropsIF {
  template?: any;
  onClickUpload?: () => void;
  isLoading?: boolean;
  refreshPage?: () => void;
}

export const TemplateCardComponent: React.FC<PropsIF> = ({ template, onClickUpload, isLoading = false, refreshPage }) => {
  const toast = useToastStore();
  const handleDropdownOptionChange = async (option: string) => {
    if (option === 'Delete') {
      const res = await httpRequest('DELETE', `${import.meta.env.VITE_NODE_URL}/api/idp/template/delete/${template._id}`);
      if (res) {
        refreshPage && refreshPage();
        toast.success('Template deleted successfully');
      }
    }
  };
  if (!template) return null;
  const { name, uploaded, pending, approved } = template;
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
        <Dropdown options={['Delete']} onChange={handleDropdownOptionChange}>
          <button className="cursor-pointer rounded-md border border-gray-200 bg-white p-1.5 text-gray-500 hover:bg-gray-100">
            <MoreVertical size={18} />
          </button>
        </Dropdown>
      </div>
      {/* Stats Row */}
      <div className="mb-2 flex w-full justify-between">
        <div className="flex flex-col items-end">
          <span className="text-xs text-gray-500">Uploaded</span>
          <span className="mt-0.5 font-semibold text-gray-600">{uploaded || 0}</span>
        </div>
        <div className="flex flex-col items-end">
          <span className="text-xs text-gray-500">Pending</span>
          <span className="mt-0.5 font-semibold text-gray-600">{pending || 0}</span>
        </div>
        <div className="flex flex-col items-end">
          <span className="text-xs text-gray-500">Approved</span>
          <span className="mt-0.5 font-semibold text-gray-600">{approved || 0}</span>
        </div>
      </div>
      {/* Upload Button Row */}
      <div className="mt-auto flex w-full justify-end">
        <Button startIcon={<Upload size={16} />} onClick={onClickUpload} small>
          Upload
        </Button>
      </div>
    </div>
  );
};
