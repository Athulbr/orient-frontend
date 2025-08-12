import { Edit, MoreVertical, Upload } from 'lucide-react';
import { Dropdown } from '../../../../../components/Dropdown';
import { Button } from '../../../../../components/Button';
import httpRequest from '../../../../../global-utils/httpRequest';
import { useToastStore } from '../../../../../components/toast/ToastStore';
import { useNavigate } from 'react-router-dom';
import { AlertDialog } from '../../../../../components/alert/AlertDialog';
import { useAlertStore } from '../../../../../components/alert/AlertStore';
import { usePermissionStore } from '../../../../../zustand-store/PermissionStore';
interface PropsIF {
    template?: any;
    onClickUpload?: () => void;
    isLoading?: boolean;
    refreshPage?: () => void;
    flexBasis?: string;
}

export const TemplateCardComponent: React.FC<PropsIF> = ({ template, onClickUpload, isLoading = false, refreshPage, flexBasis }) => {
    const toast = useToastStore();
    const navigate = useNavigate();
    const { showAlert } = useAlertStore();
    const { checkPermission } = usePermissionStore();

    const handleDropdownOptionChange = async (option: string) => {
        const deleteTemplateApi = async (id: string) => {
            try {
                const res = await httpRequest('DELETE', `${import.meta.env.VITE_NODE_URL}/idp/template/delete/${id}`);
                refreshPage && refreshPage();
                toast.success('Template deleted successfully');
            } catch (error) {
                console.error('error:===========', error);
                toast.error('Failed to delete Template');
            }
        };
        if (option === 'Delete') {
            showAlert({
                alertText: 'Are you sure you want to delete this template?',
                primaryButtonText: 'Delete',
                onPrimaryAction: () => deleteTemplateApi(template._id)
            });
        }
    };

    const cardStyle = flexBasis ? { flexBasis, minWidth: 0 } : {};

    if (isLoading) {
        return (
            <div
                className="relative flex h-40 max-w-100 min-w-75 flex-1 flex-col justify-between rounded-2xl border border-gray-200 bg-gradient-to-br from-gray-50 to-white px-3 py-4 transition"
                style={cardStyle}
            >
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
                <div className="mt-auto flex w-full justify-between">
                    <div className="h-7 w-24 animate-pulse rounded bg-gray-200" />
                    <div className="h-7 w-24 animate-pulse rounded bg-gray-200" />
                </div>
            </div>
        );
    }

    if (!template) return null;
    const { total, submitted, extracted } = template.count;

    return (
        <div
            // onClick={() => navigate(`/docsnap/template/view/${template._id}`)} // Uncomment to enable navigation on click based on tenant settings
            className="relative flex h-40 max-w-100 min-w-75 flex-1 flex-col justify-between rounded-2xl border border-gray-200 bg-gradient-to-br from-gray-50 to-white px-3 py-4 transition"
            style={cardStyle}
        >
            {/* Title and Menu Row */}
            <div className="mb-2.5 flex w-full items-start justify-between">
                <div className="text truncate pr-2 font-semibold text-gray-800">{template?.name}</div>
                {checkPermission('delete:template') && (
                    <Dropdown options={['Delete']} onChange={handleDropdownOptionChange}>
                        <button className="flex-shrink-0 cursor-pointer rounded-md border border-gray-200 bg-white p-1.5 text-gray-500 hover:bg-gray-100">
                            <MoreVertical size={18} />
                        </button>
                    </Dropdown>
                )}
            </div>
            {/* Stats Row */}
            <div className="mb-2 flex w-full justify-between">
                <div className="flex flex-col items-end">
                    <span className="text-xs text-gray-500">Submitted</span>
                    <span className="mt-0.5 font-semibold text-gray-600">{submitted || 0}</span>
                </div>
                <div className="flex flex-col items-end">
                    <span className="text-xs text-gray-500">Extracted</span>
                    <span className="mt-0.5 font-semibold text-gray-600">{extracted || 0}</span>
                </div>
                <div className="flex flex-col items-end">
                    <span className="text-xs text-gray-500">Total</span>
                    <span className="mt-0.5 font-semibold text-gray-600">{total || 0}</span>
                </div>
            </div>
            {/* Upload Button Row */}
            <div className="flex w-full justify-between gap-2">
                <Button
                    permission="update:template"
                    outlined
                    startIcon={<Edit size={14} className="text-gray-500" />}
                    onClick={() => navigate(`/docsnap/template/update/${template._id}`)}
                    small
                >
                    Edit Fields
                </Button>
                <Button permission="extract:document" startIcon={<Upload size={14} />} onClick={onClickUpload} small>
                    Upload
                </Button>
            </div>
        </div>
    );
};
