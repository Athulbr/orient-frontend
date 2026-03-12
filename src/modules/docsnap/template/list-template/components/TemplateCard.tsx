import { Edit, FileText, FormInput, MoreVertical, Plus, Upload, Save, RotateCcw, Copy, Check, Info } from 'lucide-react';
import * as XLSX from 'xlsx';
import { Dropdown } from '../../../../../components/Dropdown';
import { Button } from '../../../../../components/Button';
import httpRequest from '../../../../../global-utils/httpRequest';
import { useToastStore } from '../../../../../components/toast/ToastStore';
import { useNavigate } from 'react-router-dom';
import { AlertDialog } from '../../../../../components/alert/AlertDialog';
import { useAlertStore } from '../../../../../components/alert/AlertStore';
import { usePermissionStore } from '../../../../../zustand-store/PermissionStore';
import { config } from '../../../../../config/default';
import { useState, useEffect } from 'react';
import { UseFormbuilder } from '../../../../../builders/formbuilder/use-formbuilder';
import { DialogComponent } from '../../../../../components/DialogComponent';
interface PropsIF {
    template?: any;
    onClickUpload?: () => void;
    isLoading?: boolean;
    refreshPage?: () => void;
    flexBasis?: string;
    exportTemplate?: (id: string) => void;
    onClickManualButton?: () => void;
    isFirstCard?: boolean;
}

export const TemplateCardComponent: React.FC<PropsIF> = ({
    template,
    onClickUpload,
    isLoading = false,
    refreshPage,
    flexBasis,
    exportTemplate,
    onClickManualButton,
    isFirstCard = false
}) => {
    const toast = useToastStore();
    const navigate = useNavigate();
    const { showAlert } = useAlertStore();
    const { checkPermission } = usePermissionStore();
    const [showCreateDialog, setShowCreateDialog] = useState(false);
    const [creatingRecord, setCreatingRecord] = useState(false);
    const [showDuplicateDialog, setShowDuplicateDialog] = useState(false);
    const [duplicateTemplateName, setDuplicateTemplateName] = useState('');
    const [isDuplicating, setIsDuplicating] = useState(false);
    const [showPromptDialog, setShowPromptDialog] = useState(false);

    const module = sessionStorage.getItem('module');

    const handleDropdownOptionChange = async (option: string) => {
        const deleteTemplateApi = async (id: string) => {
                try {
                const res = await httpRequest('DELETE', `${config.nodeApiUrl}/idp/template/delete/${id}`);

                const prevSelectedTenant = window?.sessionStorage?.getItem('selectedTenant');
                window?.sessionStorage?.removeItem('selectedTenant');

                const resp = await httpRequest('POST', `${config.nodeApiUrl}/idp/template`, {
                    pageSize: 1000,
                    custom: true,
                    filters: { deleted: false }
                });
                window?.sessionStorage?.setItem('templates', JSON.stringify(resp?.data));

                if (prevSelectedTenant) {
                    window?.sessionStorage?.setItem('selectedTenant', prevSelectedTenant);
                }

                toast.success(`Template deleted successfully`);
                if (refreshPage) {
                    refreshPage();
                } else {
                    window.location.reload();
                }
                return true;
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
        if (option === 'Export') {
            exportTemplate && exportTemplate(template._id);
        }
        if (option === 'Duplicate') {
            setDuplicateTemplateName(`${template.name}-copy`);
            setShowDuplicateDialog(true);
        }
        if (option === 'Sample input') {
            downloadSampleExcel();
        }
    };

    const duplicateTemplateApi = async () => {
        if (!duplicateTemplateName.trim()) {
            toast.error('Template name is required');
            return;
        }

        const currentTenant = window?.sessionStorage?.getItem('selectedTenant');
        try {
            setIsDuplicating(true);
            
            // First fetch the full template details since the list item might not have fields
            let fullTemplate = template;
            try {
                const fullTemplateRes: any = await httpRequest('GET', `${config.nodeApiUrl}/idp/template/${template._id}`);
                if (fullTemplateRes?.data) {
                    fullTemplate = fullTemplateRes.data;
                }
            } catch (err) {
                console.error('Failed to fetch full template details structure', err);
            }
            
            const requestBody = {
                name: duplicateTemplateName,
                templateId: fullTemplate._id,
                ...(fullTemplate.settings && { settings: fullTemplate.settings }),
                ...(fullTemplate.fields && { fields: fullTemplate.fields }),
                ...(fullTemplate.s3FileName && { s3FileName: fullTemplate.s3FileName })
            };
            const res = await httpRequest('POST', `${config.nodeApiUrl}/idp/template/create`, requestBody);

            // Bypass: Temporarily remove selectedTenant to fetch ALL templates
            window?.sessionStorage?.removeItem('selectedTenant');

            const resp = await httpRequest('POST', `${config.nodeApiUrl}/idp/template`, {
                pageSize: 1000,
                custom: true,
                filters: { deleted: false }
            });

            // Restore selectedTenant after fetching
            if (currentTenant) {
                window?.sessionStorage?.setItem('selectedTenant', currentTenant);
            }

            window?.sessionStorage?.setItem('templates', JSON.stringify(resp?.data));
            
            toast.success('Template duplicated successfully');
            setShowDuplicateDialog(false);
            
            if (refreshPage) {
                refreshPage();
            } else {
                window.location.reload();
            }
        } catch (error: any) {
            console.error('error:===========', error);
            toast.error(error?.message || 'Failed to duplicate Template');

            // Restore selectedTenant in case of error
            if (currentTenant) {
                window?.sessionStorage?.setItem('selectedTenant', currentTenant);
            }
        } finally {
            setIsDuplicating(false);
        }
    };

    const downloadSampleExcel = () => {
        // --- File 1 ---
        const headers1 = [
            'name',
            'description',
            'primary_keyword',
            'author',
            'product_links',
        ];

        const sampleRow1 = [
            '',
            '',
            '',
            '',
            '',
            'links should be comma seperated eg:-https://www.example_1.com,https://www.example_2.com/blogs.html,https://www.example_3.com/products.html'
        ];

        const worksheetData1 = [headers1, sampleRow1, Array(headers1.length).fill(''), Array(headers1.length).fill('')];
        const worksheet1 = XLSX.utils.aoa_to_sheet(worksheetData1);
        const workbook1 = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(workbook1, worksheet1, 'Sample');
        XLSX.writeFile(workbook1, 'sample_upload_template.xlsx');
    };

    const cardStyle = flexBasis ? { flexBasis, minWidth: 0 } : {};

    if (isLoading) {
        return (
            <div
                className="relative flex h-45 max-w-100 min-w-75 flex-1 flex-col justify-between rounded-2xl border border-gray-200 bg-gradient-to-br from-gray-50 to-white px-3 py-4 transition"
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

    const handleCreateRecord = async (data: any) => {
        setCreatingRecord(true);
        const res: any = await httpRequest('GET', `${config.nodeApiUrl}/idp/template/${template._id}`);
        const values: any = {};
        res.data?.fields?.forEach((field: any) => {
            field?.subFields?.forEach((subField: any) => {
                values[subField.jsonKey] = '_______________';
            });
        });

        const createReqObject = {
            status: 'extracted',
            extractedData: null,
            pdfFileName: '',
            name: data.name,
            templateId: template._id,
            description: data.description,
            module: 'document-generation'
        };

        await httpRequest('POST', `${config.nodeApiUrl}/idp/history/create`, createReqObject);
        toast.success('Record created successfully');
        setShowCreateDialog(false);
        setCreatingRecord(false);
        navigate('/docsnap/record/list');
    };

    if (!template) return null;
    const { total, submitted, extracted } = template.count;

    const onClickUploadHandler = () => {
        const user = JSON.parse(sessionStorage.getItem('user') || '');
        if (user?.role?.name === 'superadmin') {
            const selectedTenant = sessionStorage.getItem('selectedTenant');
            if (!selectedTenant) {
                toast.error('Please select a tenant');
                return;
            }
            onClickUpload && onClickUpload();
        } else {
            onClickUpload && onClickUpload();
        }
    };
    const onClickManualButtonHandler = () => {
        const user = JSON.parse(sessionStorage.getItem('user') || '');
        if (user?.role?.name === 'superadmin') {
            const selectedTenant = sessionStorage.getItem('selectedTenant');
            if (!selectedTenant) {
                toast.error('Please select a tenant');
                return;
            }
            onClickManualButton && onClickManualButton();
        } else {
            onClickManualButton && onClickManualButton();
        }
    };

    return (
        <div
            // onClick={() => navigate(`/docsnap/template/view/${template._id}`)} // Uncomment to enable navigation on click based on tenant settings
            className="relative flex h-45 max-w-100 min-w-85 flex-1 flex-col justify-between rounded-2xl border border-gray-200 bg-gradient-to-br from-gray-50 to-white px-3 py-4 transition"
            style={cardStyle}
            data-tour-id={isFirstCard ? 'first-template-card' : undefined}
        >
            {/* Title and Menu Row */}
            <div className="mb-2.5 flex w-full items-start justify-between">
                <div className="text truncate pr-2 font-semibold text-gray-800">{template?.name}</div>
                {(checkPermission('delete:template') || checkPermission('export:template') || checkPermission('duplicate:template') || module === 'content-creation') && (
                    <Dropdown
                        options={[
                            ...(exportTemplate && checkPermission('export:template') ? ['Export'] : []),
                            ...(checkPermission('duplicate:template') ? ['Duplicate'] : []),
                            ...(checkPermission('delete:template') ? ['Delete'] : []),
                            ...(module === 'content-creation' ? ['Sample input'] : [])
                        ]}
                        onChange={handleDropdownOptionChange}
                    >
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
                {module === 'content-creation' ? (
                    <Button
                        permission="edit:prompt"
                        outlined
                        startIcon={<FileText size={14} className="text-gray-500" />}
                        onClick={() => setShowPromptDialog(true)}
                        small
                    >
                        Prompt
                    </Button>
                ) : (
                    <Button
                        permission="update:template"
                        outlined
                        startIcon={<Edit size={14} className="text-gray-500" />}
                        onClick={() => navigate(`/docsnap/template/update/${template._id}`)}
                        small
                        data-tour-id="edit-fields-button"
                    >
                        Edit Fields
                    </Button>
                )}
                <Button
                    permission="update:template"
                    outlined
                    startIcon={<FileText size={14} className="text-gray-500" />}
                    onClick={onClickManualButtonHandler}
                    small
                    hidden={module !== 'content-creation'}
                >
                    Create
                </Button>
                <Button
                    permission="extract:document"
                    startIcon={module === 'document-generation' ? <Plus size={14} /> : <Upload size={14} />}
                    onClick={module === 'document-generation' ? () => setShowCreateDialog(true) : onClickUploadHandler}
                    small
                    data-tour-id="upload-button"
                >
                    {module === 'document-generation' ? 'Create' : 'Upload'}
                </Button>
            </div>
            {showCreateDialog && (
                <UseFormbuilder
                    name="Create Record Form"
                    closeDialog={() => setShowCreateDialog(false)}
                    onSubmit={handleCreateRecord}
                    loadingPrimaryButton={creatingRecord}
                />
            )}

            <DialogComponent
                isOpen={showDuplicateDialog}
                closeDialog={() => setShowDuplicateDialog(false)}
                name="Duplicate Template"
                primaryButtonText={isDuplicating ? 'Duplicating...' : 'Duplicate'}
                onPrimaryAction={duplicateTemplateApi}
                className="w-[450px]"
            >
                <div className="flex flex-col gap-1.5 p-6">
                    <label className="pl-1 text-sm font-light text-gray-600" htmlFor="duplicateTemplateName">
                        New Template Name
                    </label>
                    <input
                        name="duplicateTemplateName"
                        className="min-h-10 flex-1 rounded-md border border-gray-300 px-4 text-sm outline-none outline-0 focus:border-sky-500"
                        value={duplicateTemplateName}
                        onChange={e => setDuplicateTemplateName(e.target.value)}
                        placeholder="Enter new template name"
                        autoFocus
                    />
                </div>
            </DialogComponent>

            <PromptDialog isOpen={showPromptDialog} closeDialog={() => setShowPromptDialog(false)} template={template} refreshPage={refreshPage} />
        </div>
    );
};

const PromptDialog = ({ isOpen, closeDialog, template, refreshPage }: { isOpen: boolean, closeDialog: () => void, template: any, refreshPage?: () => void }) => {
    const [editingPrompt, setEditingPrompt] = useState('');
    const [copied, setCopied] = useState(false);
    const toast = useToastStore();

    useEffect(() => {
        if (isOpen) {
            setEditingPrompt(template?.settings?.extractionPrompt || '');
        }
    }, [isOpen, template]);

    const handleSave = async () => {
        const updatedSettings = {
            ...template.settings,
            extractionPrompt: editingPrompt
        };
        const requestBody = {
            fields: template.fields,
            settings: updatedSettings,
            s3FileName: template.s3FileName,
            name: template.name,
            description: template.description,
            active: template.active
        };
        try {
            await httpRequest('PATCH', `${config.nodeApiUrl}/idp/template/update/${template._id}`, requestBody);
            
            const prevSelectedTenant = window?.sessionStorage?.getItem('selectedTenant');
            window?.sessionStorage?.removeItem('selectedTenant');

            const resp: any = await httpRequest('POST', `${config.nodeApiUrl}/idp/template`, {
                pageSize: 1000,
                custom: true,
                filters: { deleted: false }
            });
            window?.sessionStorage?.setItem('templates', JSON.stringify(resp?.data));

            if (prevSelectedTenant) {
                window?.sessionStorage?.setItem('selectedTenant', prevSelectedTenant);
            }

            toast.success('Prompt updated successfully');
            closeDialog();
            if (refreshPage) {
                refreshPage();
            } else {
                window.location.reload();
            }
        } catch (error) {
            toast.error('Failed to update Prompt');
        }
    };

    const handleCopy = () => {
        navigator.clipboard.writeText(editingPrompt);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    const handleReset = () => {
        setEditingPrompt(template?.settings?.extractionPrompt || '');
    };

    return (
        <DialogComponent name="Edit Prompt" className="h-[90%] w-[90%]" isOpen={isOpen} closeDialog={closeDialog} disableBlurCloseDialog>
            <div className="flex h-full flex-1 gap-0 overflow-hidden p-4">
                <div className="flex flex-1 flex-col">
                    <div className="flex items-center justify-between border-b px-5 py-3">
                        <div className="flex items-center gap-2">
                            <span className="text-sm font-medium text-gray-800">Prompt Editor</span>
                            <span className="rounded bg-gray-100 px-2 py-0.5 text-[10px] font-medium tracking-wide text-gray-500">MANUAL</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <Button
                                small
                                outlined
                                startIcon={copied ? <Check size={14} className="text-green-500" /> : <Copy size={14} />}
                                onClick={handleCopy}
                                disabled={!editingPrompt.trim()}
                            >
                                {copied ? 'Copied' : 'Copy'}
                            </Button>
                            <Button small outlined startIcon={<RotateCcw size={14} />} onClick={handleReset}>
                                Reset
                            </Button>
                        </div>
                    </div>
                    <div className="flex items-start gap-2 border-b bg-blue-50/60 px-5 py-2.5">
                        <Info size={14} className="mt-0.5 shrink-0 text-blue-500" />
                        <p className="text-xs leading-relaxed text-blue-700">
                            Use <code className="rounded bg-blue-100 px-1 py-0.5 font-mono text-[11px] font-medium text-blue-800">{'{{variableName}}'}</code> to
                            insert dynamic data at runtime —{' '}
                            <code className="rounded bg-blue-100 px-1 py-0.5 font-mono text-[11px] text-blue-800">{'{{documentText}}'}</code>,{' '}
                            <code className="rounded bg-blue-100 px-1 py-0.5 font-mono text-[11px] text-blue-800">{'{{schema}}'}</code>,{' '}
                            <code className="rounded bg-blue-100 px-1 py-0.5 font-mono text-[11px] text-blue-800">{'{{previousOutput}}'}</code>
                        </p>
                    </div>
                    <textarea
                        value={editingPrompt}
                        onChange={e => setEditingPrompt(e.target.value)}
                        className="flex-1 resize-none p-5 font-mono text-sm leading-relaxed text-gray-800 outline-none placeholder:text-gray-400"
                        placeholder={`Write your extraction prompt here...\n\nUse {{variableName}} to insert dynamic data. For example:\n\nExtract the following fields from the document:\n{{documentText}}\n\nUse this schema for extraction:\n{{schema}}\n\nEnsure all dates are in YYYY-MM-DD format.\nReturn null for missing fields.`}
                        spellCheck={false}
                    />
                </div>
            </div>

            {/* Footer */}
            <div className="flex items-center justify-end gap-3 border-t bg-gray-50/50 px-6 py-4">
                <Button outlined onClick={closeDialog}>
                    Cancel
                </Button>
                <Button startIcon={<Save size={16} />} onClick={handleSave}>
                    Save Prompt
                </Button>
            </div>
        </DialogComponent>
    );
};
