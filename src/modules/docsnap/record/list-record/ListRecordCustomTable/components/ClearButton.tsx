import { X } from 'lucide-react';
import { Button } from '../../../../../../components/Button';
import { useListRecordCustomTableState } from '../hooks/listRecordCustomTableStateContext';

interface ClearButtonIF {
    test?: string;
}

export const ClearButton: React.FC<ClearButtonIF> = () => {
    const { setState } = useListRecordCustomTableState();
    return (
        <Button
            className="flex cursor-pointer items-center gap-1 rounded border px-3 py-2 text-sm transition-colors hover:bg-gray-100"
            onClick={() =>
                setState(prev => ({
                    ...prev,
                    page: 1,
                    selectedStatuses: [],
                    selectedTemplates: [],
                    selectedValidator: '',
                    searchText: '',
                    startDate: '',
                    endDate: '',
                    pageSize: 10
                }))
            }
            outlined
        >
            <X className="h-3.5 w-3.5" />
            Clear
        </Button>
    );
};
