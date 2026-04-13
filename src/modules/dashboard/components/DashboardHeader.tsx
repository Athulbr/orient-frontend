import { Plus } from 'lucide-react';
import { FC, useRef, useState, type ChangeEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '../../../components/Button';
import Spinner from '../../../components/Spinner';
import { useDashboardState } from '../hooks/dashboardContext';
import { usePermissionStore } from '../../../zustand-store/PermissionStore';
import { useToastStore } from '../../../components/toast/ToastStore';
import httpUploadRequest from '../../../global-utils/httpUploadRequest';
import httpFileRequest from '../../../global-utils/httpFileRequest';
import { config } from '../../../config/default';

export const DashboardHeaderComponent: FC = () => {
    const { state, setState } = useDashboardState();
    const { user } = usePermissionStore();
    const toast = useToastStore();
    const navigate = useNavigate();
    const [isUserGuideMenuOpen, setIsUserGuideMenuOpen] = useState(false);
    const [isUserGuideDownloading, setIsUserGuideDownloading] = useState(false);
    const [isUserGuideUploading, setIsUserGuideUploading] = useState(false);
    const fileInputRef = useRef<HTMLInputElement | null>(null);

    const isContentCreationModule = sessionStorage.getItem('module') === 'content-creation';

    const handleUserGuideClick = async () => {
        if (isUserGuideDownloading) {
            return;
        }
        setIsUserGuideDownloading(true);
        try {
            const blob = await httpFileRequest('GET', `${config.nodeApiUrl}/idp/user-guide/download`);
            const blobUrl = URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = blobUrl;
            link.download = 'user-guide.pdf';
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            URL.revokeObjectURL(blobUrl);
            setIsUserGuideMenuOpen(false);
        } catch (error) {
            console.error('Failed to open user guide', error);
            toast.error('Unable to open user guide');
        } finally {
            setIsUserGuideDownloading(false);
        }
    };

    const handleCreateTemplateClick = () => {
        if (user?.role?.name === 'superadmin') {
            const selectedTenant = sessionStorage.getItem('selectedTenant');
            if (!selectedTenant) {
                toast.error('Please select a tenant');
                return;
            }
            setState({ ...state, showCreateTemplateDialog: true });
        } else {
            setState({ ...state, showCreateTemplateDialog: true });
        }
    };

    const handleEditClick = () => {
        console.log('Clicked edit button');
        fileInputRef.current?.click();
    };

    const handleUserGuideFileChange = async (event: ChangeEvent<HTMLInputElement>) => {
        const selectedFile = event.target.files?.[0];
        event.target.value = '';
        if (!selectedFile) {
            return;
        }

        if (selectedFile.type !== 'application/pdf') {
            toast.error('Please select a PDF file');
            return;
        }

        try {
            setIsUserGuideUploading(true);
            await httpUploadRequest(`${config.nodeApiUrl}/idp/user-guide/upload`, selectedFile);
            setIsUserGuideMenuOpen(false);
        } catch (error) {
            console.error('Failed to upload user guide', error);
            toast.error('Unable to upload user guide');
        } finally {
            setIsUserGuideUploading(false);
        }
    };

    const handleUserGuideMenuToggle = () => {
        if (isUserGuideDownloading || isUserGuideUploading) {
            return;
        }
        setIsUserGuideMenuOpen(prev => !prev);
    };

    return (
        <section className="flex w-full items-center justify-between gap-y-4 px-2">
            <div className="flex-1 text-xl lg:text-2xl">
                Welcome to makez.ai, <span className="capitalize">{user?.firstName}</span>
            </div>
            <div className="flex items-center gap-2">
                {isContentCreationModule && (
                    <>
                        <div className="relative">
                            <Button permission="viewEdit:userGuide" outlined onClick={handleUserGuideMenuToggle} disabled={isUserGuideDownloading || isUserGuideUploading}>
                                User Guide
                                {(isUserGuideDownloading || isUserGuideUploading) && <Spinner className="text-gray-500" size={16} />}
                            </Button>
                            <input ref={fileInputRef} type="file" accept="application/pdf" className="hidden" onChange={handleUserGuideFileChange} />
                            {isUserGuideMenuOpen && (
                                <div className="absolute right-0 top-full z-50 mt-2 w-44 overflow-hidden rounded-md border border-slate-200 bg-white shadow-lg">
                                    <button className="w-full px-3 py-2 text-left text-sm hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-60" onClick={handleUserGuideClick} disabled={isUserGuideDownloading || isUserGuideUploading}>
                                        <span className="inline-flex items-center gap-2">
                                            View
                                            {isUserGuideDownloading && <Spinner className="text-gray-500" size={14} />}
                                        </span>
                                    </button>
                                    <button className="w-full px-3 py-2 text-left text-sm hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-60" onClick={handleEditClick} disabled={isUserGuideDownloading || isUserGuideUploading}>
                                        <span className="inline-flex items-center gap-2">
                                            Edit
                                            {isUserGuideUploading && <Spinner className="text-gray-500" size={14} />}
                                        </span>
                                    </button>
                                </div>
                            )}
                        </div>
                        <Button permission="view:userGuide" outlined onClick={handleUserGuideClick} disabled={isUserGuideDownloading}>
                            User Guide
                            {isUserGuideDownloading && <Spinner className="text-gray-500" size={16} />}
                        </Button>
                    </>
                )}
                <Button outlined onClick={() => navigate('/agent/list')}>
                    Makez Agents
                </Button>
                <Button outlined onClick={() => navigate('/docsnap/template/list')}>
                    View Template
                </Button>
                <Button permission="create:template" startIcon={<Plus strokeWidth={1.5} size={18} />} onClick={handleCreateTemplateClick} data-tour-id="create-template">
                    Create Template
                </Button>
            </div>
        </section>
    );
};
