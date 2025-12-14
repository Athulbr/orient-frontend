import { Upload } from 'lucide-react';
import BackButton from '../../../components/BackButton';
import { Button } from '../../../components/Button';
import Spinner from '../../../components/Spinner';
import { useExportbuilderState } from './hooks/exportbuilderContext';
import { ExcelExportDialogNew } from '../../../builders/excelbuilder/preview/ExcelPreviewComponent';
import { useExportbuilderApi } from './hooks/useExportbuilderApi';
import { useEffect, useMemo, useState } from 'react';
import DateTimePicker, { DateRange } from '../../../components/DateTimePicker';
import { SingleSelect } from '../../../components/SingleSelect';

interface ViewExportbuilderPageIF {
    test?: string;
}

const ViewExportbuilderPage: React.FC<ViewExportbuilderPageIF> = () => {
    const { getExportbuilderByIdApi, getRecordsApi } = useExportbuilderApi();
    const { state, setState } = useExportbuilderState();
    const [startDate, setStartDate] = useState<string | null>(null);
    const [endDate, setEndDate] = useState<string | null>(null);
    const [selectedTemplateId, setSelectedTemplateId] = useState<string>('');
    const [selectedStatus, setSelectedStatus] = useState<string>('');
    const tenant = useMemo(() => {
        const allTemplates = JSON.parse(sessionStorage.getItem('templates') || '');
        const tenantId = sessionStorage.getItem('selectedTenant') ?? JSON.parse(sessionStorage.getItem('user') || '').tenant?._id;
        const templates = allTemplates
            .filter((item: any) => item.tenantId === tenantId)
            .map((item: any) => ({
                value: item._id,
                label: item.name
            }));
        return {
            tenantId,
            templates
        };
    }, []);

    useEffect(() => {
        const payload: any = {
            pageSize: 100,
            filters: { deleted: false },
            startDate: startDate,
            endDate: endDate,
            tenantId: tenant.tenantId || ''
        };
        if (selectedTemplateId) payload.filters.templateId = selectedTemplateId;
        if (selectedStatus) payload.filters.status = selectedStatus;
        getRecordsApi(payload);
    }, [startDate, endDate, selectedTemplateId, selectedStatus]);
    useEffect(() => {
        if (state.id) {
            getExportbuilderByIdApi(state.id);
        }
    }, [state.id]);

    return (
        <div className="absolute top-0 left-0 w-screen h-screen bg-white max-h-screen flex flex-col">
            <header className="flex items-center gap-4 p-3 justify-between border-b">
                <div className="flex items-center gap-2">
                    <BackButton onClick={() => setState(prev => ({ ...prev, id: '', exportbuilder: null, viewDialog: false, loading: false }))} />
                    <div className=" w-full text-xl font-semibold text-gray-800">{state.exportbuilder?.name}</div>
                </div>
                <div className="flex gap-2 items-center">
                    {state.totalRecords && <p className="text-green-600 text-sm pr-4">Total Records: {state.totalRecords}</p>}
                    <Button outlined disabled={state.loading} startIcon={state.loading ? <Spinner className="h-4 w-4 animate-spin" /> : <Upload size={14} />}>
                        Export JSON
                    </Button>
                    <Button outlined disabled={state.loading} startIcon={state.loading ? <Spinner className="h-4 w-4 animate-spin" /> : <Upload size={14} />}>
                        Export .XLSX
                    </Button>
                </div>
            </header>
            <ExcelExportDialogNew hideDownloadButtons template={state.exportbuilder?.sheets || []} inputData={state.records} />
            <div className="w-full h-[400px] p-4 flex gap-4">
                <DateTimePicker
                    onChange={(range: DateRange) => {
                        setStartDate(range.startDate);
                        setEndDate(range.endDate);
                    }}
                />
                <div className="w-full max-w-md p-6 bg-white border border-gray-200 rounded-xl shadow-lg transition-shadow duration-200">
                    <div className="flex items-center justify-between mb-4 border-b pb-3">
                        <h3 className="text-lg font-semibold text-gray-800">Select Template</h3>
                    </div>

                    <SingleSelect
                        label="Templates"
                        options={[{ label: 'All Templates', value: '' }, ...tenant.templates]}
                        value={selectedTemplateId}
                        placeholder="Select Template"
                        className="w-full"
                        onValueChange={(value: string) => setSelectedTemplateId(value)}
                    />
                </div>
                <div className="w-full max-w-md p-6 bg-white border border-gray-200 rounded-xl shadow-lg transition-shadow duration-200">
                    <div className="flex items-center justify-between mb-4 border-b pb-3">
                        <h3 className="text-lg font-semibold text-gray-800">Select Status</h3>
                    </div>

                    <SingleSelect
                        label="Status"
                        options={[
                            { label: 'All Status', value: '' },
                            { label: 'Processing', value: 'processing' },
                            { label: 'Extracted', value: 'extracted' },
                            { label: 'Viewed', value: 'viewed' },
                            { label: 'Submitted', value: 'submitted' },
                            { label: 'Failed', value: 'failed' },
                            { label: 'Invalid', value: 'invalid' }
                        ]}
                        value={selectedStatus}
                        placeholder="Select Status"
                        className="w-full"
                        onValueChange={(value: string) => setSelectedStatus(value)}
                    />
                </div>
            </div>
        </div>
    );
};

export default ViewExportbuilderPage;
