import { Edit, FileText, FormInput, MoreVertical, Plus, Upload } from 'lucide-react';
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
import { useState } from 'react';
import { UseFormbuilder } from '../../../../../builders/formbuilder/use-formbuilder';
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

                toast.success('Template deleted successfully');
                window.location.reload();
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
        if (option === 'Sample input') {
            downloadSampleExcel();
        }
    };

    const downloadSampleExcel = () => {
        // --- File 1 ---
        const headers1 = [
            'name',
            'description',
            'primary_keyword',
            'type_of_article',
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
                {checkPermission('delete:template') && (
                    <Dropdown options={[...(exportTemplate ? ['Export'] : []), 'Delete', ...(module === 'content-creation' ? ['Sample input'] : [])]} onChange={handleDropdownOptionChange}>
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
                    data-tour-id="edit-fields-button"
                >
                    Edit Fields
                </Button>
                <Button
                    permission="update:template"
                    outlined
                    startIcon={<FileText size={14} className="text-gray-500" />}
                    onClick={onClickManualButtonHandler}
                    small
                    hidden={module !== 'content-creation'}
                >
                    Manual Input
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
        </div>
    );
};
