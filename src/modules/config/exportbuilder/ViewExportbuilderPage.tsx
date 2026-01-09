import BackButton from '../../../components/BackButton';
import { useExportbuilderState } from './hooks/exportbuilderContext';
import { ExcelExportDialogNew } from '../../../builders/excelbuilder/preview';
import { useExportbuilderApi } from './hooks/useExportbuilderApi';
import { useEffect, useMemo, useState } from 'react';
import { useToastStore } from '../../../components/toast/ToastStore';
import Spinner from '../../../components/Spinner';
import DateTimePicker, { DateRangeIF } from '../../../components/DateTimePicker';
import { SingleSelect } from '../../../components/SingleSelect';
import { Button } from '../../../components/Button';

interface ViewExportbuilderPageIF {
    test?: string;
}

const ViewExportbuilderPage: React.FC<ViewExportbuilderPageIF> = () => {
    const { getExportbuilderByIdApi, getRecordsApi, exportBuilderApi } = useExportbuilderApi();
    const { state, setState } = useExportbuilderState();
    const [startDate, setStartDate] = useState<string | null>(null);
    const [endDate, setEndDate] = useState<string | null>(null);
    const [selectedTemplateId, setSelectedTemplateId] = useState<string>('');
    const [selectedStatus, setSelectedStatus] = useState<string>('');
    const [selectedFilterValues, setSelectedFilterValues] = useState<Record<string, string>>({});
    const [initialFilterOptions, setInitialFilterOptions] = useState<Record<string, string[]>>({});
    const [exporting, setExporting] = useState(false);
    const toast = useToastStore();
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
    const getValueByPath = (obj: any, path?: string) => {
        if (!obj || !path) return undefined;
        return path.split('.').reduce((acc: any, seg: string) => (acc && acc[seg] !== undefined ? acc[seg] : undefined), obj);
    };

    // Convert saved filters to API format
    const getFiltersFromConfig = () => {
        const baseFilters: any = { deleted: false };

        // Apply user-selected filter values
        Object.keys(selectedFilterValues).forEach(key => {
            if (selectedFilterValues[key]) {
                baseFilters[key] = selectedFilterValues[key];
            }
        });

        return baseFilters;
    };

    useEffect(() => {
        const fetchRecords = async () => {
            const payload: any = {
                pageSize: 100,
                filters: getFiltersFromConfig(),
                startDate: startDate,
                endDate: endDate,
                tenantId: tenant.tenantId || '',
                ...(state.selectedTemplateId && state.selectedTemplateId.length ? { templateId: state.selectedTemplateId } : {})
            };
            if (selectedTemplateId) payload.filters.templateId = selectedTemplateId;
            if (selectedStatus) payload.filters.status = selectedStatus;

            try {
                setState(prev => ({ ...prev, loading: true }));
                await getRecordsApi(payload);
            } catch (err) {
                console.error('fetchRecords error:', err);
            } finally {
                setState(prev => ({ ...prev, loading: false }));
            }

            // Extract filter options from records (only on initial load when no filters are selected)
            if (Object.keys(selectedFilterValues).length === 0 && Object.keys(initialFilterOptions).length === 0 && state.exportbuilder?.filters) {
                const filterOptionsMap: Record<string, string[]> = {};

                state.exportbuilder.filters.forEach((filter: { jsonPath: string }) => {
                    const key = filter.jsonPath ? filter.jsonPath.split('.').slice(-1)[0] : '';
                    if (key && Array.isArray(state.records)) {
                        const uniqueValues = Array.from(
                            new Set(state.records.map((record: any) => record[key]).filter(val => val !== undefined && val !== null))
                        ).slice(0, 50);
                        filterOptionsMap[key] = uniqueValues.map(String);
                    }
                });

                setInitialFilterOptions(filterOptionsMap);
            }
        };

        fetchRecords();
    }, [startDate, endDate, selectedTemplateId, selectedStatus, selectedFilterValues]);

    useEffect(() => {
        if (state.id) {
            getExportbuilderByIdApi(state.id);
        }
    }, [state.id]);

    const buildHistoryPayload = () => {
        const payload: any = {
            pageSize: 1000,
            filters: getFiltersFromConfig(),
            startDate: startDate,
            endDate: endDate,
            tenantId: tenant.tenantId || '',
            ...(state.selectedTemplateId && state.selectedTemplateId.length ? { templateId: state.selectedTemplateId } : {})
        };
        if (selectedTemplateId) payload.filters.templateId = selectedTemplateId;
        if (selectedStatus) payload.filters.status = selectedStatus;
        return payload;
    };

    const handleServerExport = async (format: 'json' | 'xlsx', activeSheetIndex = 0) => {
        try {
            setExporting(true);
            const payload = {
                ...buildHistoryPayload(),
                format,
                exportbuilder: state.exportbuilder,
                activeSheetIndex
            };

            const result = await exportBuilderApi(payload);

            if (result?.blob) {
                const url = window.URL.createObjectURL(result.blob);
                const link = document.createElement('a');
                link.href = url;
                link.download = result.fileName || 'Record_Export.xlsx';
                document.body.appendChild(link);
                link.click();
                link.remove();
                window.URL.revokeObjectURL(url);
            } else if (result?.jsonData) {
                const jsonString = JSON.stringify(result.jsonData, null, 2);
                const blob = new Blob([jsonString], { type: 'application/json' });
                const url = window.URL.createObjectURL(blob);
                const link = document.createElement('a');
                link.href = url;
                link.download = result.fileName || 'Record_Export.json';
                document.body.appendChild(link);
                link.click();
                link.remove();
                window.URL.revokeObjectURL(url);
            }
        } catch (error) {
            toast.error('Failed to export records');
        } finally {
            setExporting(false);
        }
    };

    return (
        <div className="absolute top-0 left-0 w-screen h-screen bg-white max-h-screen flex flex-col">
            <header className="flex items-center gap-4 p-3 justify-between border-b">
                <div className="flex items-center gap-2">
                    <BackButton onClick={() => setState(prev => ({ ...prev, id: '', exportbuilder: null, viewDialog: false, loading: false }))} />
                    <div className=" w-full text-xl font-semibold text-gray-800">{state.exportbuilder?.name}</div>
                </div>
                <div className="flex items-center">
                    <p className="text-green-600 text-sm pr-1">Total Records:</p>
                    {state.loading ? (
                        <Spinner size={16} className="text-green-600 ml-1" />
                    ) : (
                        <p className="text-green-600 text-sm pr-4 ml-1">{(state.totalRecords ?? 0).toLocaleString()}</p>
                    )}
                    {/* <Button outlined disabled={state.loading} startIcon={state.loading ? <Spinner className="h-4 w-4 animate-spin" /> : <Upload size={14} />}>
                        Export JSON
                    </Button>
                    <Button outlined disabled={state.loading} startIcon={state.loading ? <Spinner className="h-4 w-4 animate-spin" /> : <Upload size={14} />}>
                        Export .XLSX
                    </Button> */}
                </div>
            </header>
            <div className="w-full p-4 flex gap-4 overflow-x-auto flex-nowrap items-center">
                <SingleSelect
                    // label="Templates"
                    options={[{ label: 'All Templates', value: '' }, ...tenant.templates]}
                    value={selectedTemplateId}
                    placeholder="Select Template"
                    className="min-w-60 flex-shrink-0"
                    onValueChange={(value: string) => setSelectedTemplateId(value)}
                />

                <SingleSelect
                    // label="Status"
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
                    className="min-w-60 flex-shrink-0"
                    onValueChange={(value: string) => setSelectedStatus(value)}
                />

                {/* Render filter selects from exportbuilder configuration */}
                {state.exportbuilder?.filters &&
                    Array.isArray(state.exportbuilder.filters) &&
                    state.exportbuilder.filters.map((filter: { jsonPath: string; javascript?: string; customLabel?: string }) => {
                        // Extract key from jsonPath (last segment)
                        const key = filter.jsonPath ? filter.jsonPath.split('.').slice(-1)[0] : '';

                        // Derive dynamic options from current records immediately (so they appear when records arrive)
                        const dynamicFromRecords = Array.isArray(state.records)
                            ? Array.from(
                                  new Set(
                                      state.records
                                        .map((record: any) => getValueByPath(record, filter.jsonPath))
                                          .filter((val: any) => val !== undefined && val !== null)
                                  )
                              ).slice(0, 50).map(String)
                            : [];

                        // Prefer initial (cached) options if available, otherwise use dynamic values
                        const dataOptions = initialFilterOptions[key] && initialFilterOptions[key].length > 0 ? initialFilterOptions[key] : dynamicFromRecords;

                        // Prepare saved options (from config) first, then append dynamic options without duplication
                        const savedOptionsRaw: any = (filter as any).options || [];
                        const savedOptions = Array.isArray(savedOptionsRaw) ? savedOptionsRaw.map(String) : [];
                        const dynamicOptionsStrings = dataOptions.map(String);
                        const dynamicFiltered = dynamicOptionsStrings.filter(opt => !savedOptions.includes(opt));

                        const mergedOptions = [
                            { label: `All ${key}`, value: '' },
                            ...(filter.javascript && filter.customLabel ? [{ label: filter.customLabel, value: '__custom_js__' }] : []),
                            ...savedOptions.map((opt: string) => ({ label: opt, value: opt })),
                            ...dynamicFiltered.map((opt: string) => ({ label: opt, value: opt }))
                        ];

                        return (
                            key && (filter.javascript || savedOptions.length > 0 || dataOptions.length > 0) && (
                                <SingleSelect
                                    key={filter.jsonPath}
                                    options={mergedOptions}
                                    value={selectedFilterValues[key] || ''}
                                    placeholder={`Select ${key}`}
                                    className="min-w-60 flex-shrink-0"
                                    onValueChange={(value: string) => setSelectedFilterValues(prev => ({ ...prev, [key]: value }))}
                                />
                            )
                        );
                    })}
                <div className="flex-shrink-0">
                    <DateTimePicker
                        onChange={(range: DateRangeIF) => {
                            setStartDate(range.startDate);
                            setEndDate(range.endDate);
                        }}
                    />
                </div>
            </div>
            <ExcelExportDialogNew
                totalRecords={state.totalRecords}
                template={state.exportbuilder?.sheets || []}
                inputData={state.records}
                serverExportLoading={exporting}
                recordsLoading={state.loading}
                onServerJsonExport={(activeSheetIndex: number) => handleServerExport('json', activeSheetIndex)}
                onServerXlsxExport={() => handleServerExport('xlsx')}
            />
        </div>
    );
};

export default ViewExportbuilderPage;
