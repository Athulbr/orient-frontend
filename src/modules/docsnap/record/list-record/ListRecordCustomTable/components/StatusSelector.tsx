import { MultiSelect } from '../../../../../../components/MultiSelect';
import { useListRecordCustomTableState } from '../hooks/listRecordCustomTableStateContext';
import { useListRecordCustomTableApi } from '../hooks/useListRecordCustomTableApi';
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
    const { getRecordsApi } = useListRecordCustomTableApi();
    return (
        <MultiSelect
            className="w-fit"
            placeholder="All Status"
            options={statusList}
            values={state.selectedStatuses}
            onValuesChange={(values: string[]) => {
                setState(prev => ({ ...prev, selectedStatuses: values }));
                getRecordsApi({
                    selectedStatuses: values
                });
            }}
        />
    );
};

export default StatusSelector;
