import { Search, CircleChevronRight } from 'lucide-react';
import { useEffect, useState } from 'react';
import httpRequest from '../../../../../global-utils/httpRequest';
import { DialogComponent } from '../../../../../components/DialogComponent';
import { useNavigate } from 'react-router-dom';
import DragAndDropFileInput from '../../../../../components/DragAndDropFileInput';
import httpUploadRequest from '../../../../../global-utils/httpUploadRequest';
import FullScreenLoader from '../../../../../components/FullScreenLoader';
import { config } from '../../../../../config/default';

export const CreateTemplateComponent = ({ state, setState }: any) => {
    const [selectedTemplateName, setSelectedTemplateName] = useState('');
    const navigate = useNavigate();
    const [selectedTemplate, setSelectedTemplate] = useState<any>(null);
    const [searchQuery, setSearchQuery] = useState('');
    const [error, setError] = useState('');
    const [showFileUploadUI, setShowFileUploadUI] = useState(false);

    useEffect(() => {
        const module = sessionStorage.getItem('module');
        if (module === 'document-generation') {
            setShowFileUploadUI(true);
            setSelectedTemplateName('');
        }
    }, [state.showCreateTemplateDialog]);

    const handleSubmit = async () => {
        if (showFileUploadUI) return;

        const template = state.templates.find((template: any) => template.name === selectedTemplateName);
        if (template) {
            setError('Template name already exists, Please choose any other name');
            return;
        }
        const requestBody = {
            name: selectedTemplateName,
            templateId: selectedTemplate._id
        };
        setState({ ...state, loadingCreateTemplate: true });
        const res = await httpRequest('POST', `${config.nodeApiUrl}/idp/template/create`, requestBody);
        const resp = await httpRequest('POST', `${config.nodeApiUrl}/idp/template`, {
            pageSize: 1000,
            custom: true,
            filters: { deleted: false }
        });
        window?.sessionStorage?.setItem('templates', JSON.stringify(resp?.data));
        if (state.isDashboard) {
            setState({ ...state, loadingCreateTemplate: false });
            navigate('/docsnap/template/list');
            return;
        }
        setState({ ...state, showCreateTemplateDialog: false, refresh: state.refresh + 1 });
    };

    const onChangeTemplateName = (e: any) => {
        const template = state.predefinedTemplates.find((template: any) => template.name === e.target.value);
        if (template) {
            setError('Template name already exists, Please choose any other name');
        } else {
            setError('');
        }
        setSelectedTemplateName(e.target.value);
    };

    const closeDialog = () => {
        setState({ ...state, showCreateTemplateDialog: false });
        setError('');
        setSelectedTemplateName('');
        setShowFileUploadUI(false);
    };

    if (!state.showCreateTemplateDialog) return null;
    return (
        <DialogComponent
            className="max-h-[calc(100vh-100px)] w-[calc(100vw-400px)]"
            name={showFileUploadUI ? 'Upload Document' : 'Create Template'}
            isOpen={state.showCreateTemplateDialog}
            closeDialog={closeDialog}
            primaryButtonText={showFileUploadUI ? '' : state.loadingCreateTemplate ? 'Creating Template...' : 'Create Template'}
            onPrimaryAction={handleSubmit}
        >
            <div className="h-full p-6">
                {showFileUploadUI ? (
                    <FileUploadUIComponent closeDialog={closeDialog} />
                ) : (
                    <div className="flex h-full flex-col gap-8">
                        <div className="flex w-full items-center rounded-md border pl-3">
                            <Search className="text-gray-500" size={20} />
                            <input
                                className="h-10 flex-1 px-4 text-sm outline-none"
                                placeholder="Search templates..."
                                value={searchQuery}
                                onChange={e => setSearchQuery(e.target.value)}
                            />
                        </div>

                        <div className="flex h-full w-full flex-wrap gap-4">
                            {state.predefinedTemplates
                                .filter((template: any) => template.name.toLowerCase().includes(searchQuery.toLowerCase()))
                                .map((template: any, idx: number) => (
                                    <div
                                        key={idx}
                                        onClick={() => {
                                            setSelectedTemplateName(template.name);
                                            setSelectedTemplate(template);
                                        }}
                                        className={`flex h-14 w-60 cursor-pointer items-center justify-between rounded-lg border p-3 text-sm ${selectedTemplateName === template.name ? 'border border-sky-500 bg-sky-50' : 'bg-white'}`}
                                    >
                                        {template.name}
                                        <CircleChevronRight size={14} className="text-gray-500" />
                                    </div>
                                ))}
                            <div
                                onClick={() => {
                                    setShowFileUploadUI(true);
                                    setSelectedTemplateName('');
                                }}
                                className={`flex h-14 w-60 cursor-pointer items-center justify-between rounded-lg border p-3 text-sm ${selectedTemplateName === 'Custom' ? 'border border-sky-500 bg-sky-50' : 'bg-white'}`}
                            >
                                Custom <CircleChevronRight size={14} className="text-gray-500" />
                            </div>
                        </div>
                        <div className="flex flex-col gap-1.5">
                            <label className="pl-1 text-sm font-light text-gray-600" htmlFor="templateName">
                                Template Name
                            </label>
                            <input
                                name="templateName"
                                className={`min-h-10 flex-1 rounded-md border px-4 text-sm outline-none ${error ? 'border-red-500' : ''}`}
                                value={selectedTemplateName}
                                onChange={onChangeTemplateName}
                            />
                            {error && <p className="pl-1 text-sm text-red-500">{error}</p>}
                        </div>
                    </div>
                )}
            </div>
        </DialogComponent>
    );
};

const FileUploadUIComponent = ({ closeDialog }: { closeDialog: () => void }) => {
    const navigate = useNavigate();
    const [uploading, setUploading] = useState(false);
    const onFileDrop = async (files: File[]) => {
        setUploading(true);
        const s3Response = await httpUploadRequest(`${config.nodeApiUrl}/idp/document/upload`, files[0] as File);
        navigate(`/docsnap/template/create/${s3Response.data?.fileName}`);
        closeDialog();
        setUploading(false);
    };
    return (
        <div className="flex h-[50vh] w-full flex-col items-center justify-center">
            {uploading ? <FullScreenLoader text="Uploading Document" /> : <DragAndDropFileInput accept="application/pdf,image/*" onFilesChange={onFileDrop} />}
        </div>
    );
};
