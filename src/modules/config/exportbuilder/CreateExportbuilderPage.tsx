import { useEffect, useState } from 'react';
import BackButton from '../../../components/BackButton';
import { Button } from '../../../components/Button';
import { useToastStore } from '../../../components/toast/ToastStore';
import { useExportbuilderState } from '../../../modules/config/exportbuilder/hooks/exportbuilderContext';
import { useExportbuilderApi } from '../../../modules/config/exportbuilder/hooks/useExportbuilderApi';
import Spinner from '../../../components/Spinner';
import { ExcelExportDialogNew } from '../../../builders/excelbuilder/preview';
import { ExcelExportBuilder, ExcelSheetConfig } from '../../../builders/excelbuilder/builder';

interface CreateExportbuilderIF {}

export const CreateExportbuilderPage: React.FC<CreateExportbuilderIF> = () => {
    const { state, setState } = useExportbuilderState();
    const generateId = () => Math.random().toString(36).substr(2, 9);
    const toast = useToastStore();
    const { createExportbuilderApi, updateExportbuilderApi, getExportbuilderByIdApi, getRecordsApi } = useExportbuilderApi();
    const [sheets, setSheets] = useState<ExcelSheetConfig[]>([{ id: generateId(), sheetName: 'Sheet 1', columns: [] }]);

    useEffect(() => {
        getRecordsApi({ pageSize: 20, filters: { deleted: false }, startDate: null, endDate: null });
    }, []);

    useEffect(() => {
        if (state.id) {
            getExportbuilderByIdApi(state.id);
        }
    }, [state.id]);

    useEffect(() => {
        if (state.exportbuilder) {
            setSheets(state.exportbuilder.sheets);
        }
    }, [state.exportbuilder]);

    const handleCreateExportbuilder = async () => {
        setState(prev => ({ ...prev, loading: true }));
        if (sheets[0]?.columns?.length === 0) {
            toast.error('Please add at least one column to the first sheet before creating the export builder');
            return;
        }
        const payload = {
            name: 'Albert Test 3',
            sheets: sheets
        };
        if (state.id) {
            await updateExportbuilderApi(payload);
        } else {
            await createExportbuilderApi(payload);
        }
        setState(prev => ({ ...prev, id: '', exportbuilder: null, createDialog: false, loading: false }));
        toast.success('Exportbuilder created successfully');
    };

    return (
        <div className="absolute top-0 left-0 w-screen h-screen bg-white max-h-screen flex flex-col">
            <header className="flex items-center gap-4 p-3 justify-between">
                <div className="flex items-center gap-2">
                    <BackButton onClick={() => setState(prev => ({ ...prev, id: '', exportbuilder: null, createDialog: false, loading: false }))} />
                    <div className=" w-full text-xl font-semibold text-gray-800">{state.id ? 'Update Exportbuilder' : 'Create Exportbuilder'}</div>
                </div>
                <Button
                    onClick={handleCreateExportbuilder}
                    outlined
                    disabled={state.loading}
                    startIcon={state.loading ? <Spinner className="h-4 w-4 animate-spin" /> : undefined}
                >
                    {state.id ? 'Update' : 'Create'} Exportbuilder
                </Button>
            </header>
            <ExcelExportDialogNew template={sheets} inputData={state.records} />
            <ExcelExportBuilder sheets={sheets} setSheets={setSheets} inputData={state.records} />
        </div>
    );
};
