import { MultiSelect } from '../../../../../../components/MultiSelect';
import { useListRecordCustomTableState } from '../hooks/listRecordCustomTableStateContext';
import { useListRecordCustomTableApi } from '../hooks/useListRecordCustomTableApi';
import useTablepersistance from '../../../../../../hooks/useTablepersistance';
interface StatusSelectorIF {
    test?: string;
}

const statusList = [
    { label: 'Extracted', value: 'extracted' },
    { label: 'Processing', value: 'processing' },
    { label: 'Failed', value: 'failed' },
    { label: 'Submitted', value: 'submitted' }
];


const StatusSelector: React.FC<StatusSelectorIF> = () => {
    const { state, setState } = useListRecordCustomTableState();
    const { setFiltersParam, getFiltersFromQuery } = useTablepersistance();

    const handleChange = (values: string[]) => {
        setState(prev => ({ ...prev, selectedStatuses: values, page: 1 }));
        // Merge with other filters if needed
        const filters = getFiltersFromQuery() || {};
        filters.selectedStatuses = values;
        setFiltersParam(filters);
    };

    return (
        <MultiSelect
            className="w-fit"
            placeholder="All Status"
            options={statusList}
            values={state.selectedStatuses}
            onValuesChange={handleChange}
        />
    );
};

export default StatusSelector;
