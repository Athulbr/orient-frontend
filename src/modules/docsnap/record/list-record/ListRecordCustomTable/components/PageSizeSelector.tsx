import { SingleSelect } from '../../../../../../components/SingleSelect';
import { useListRecordCustomTableState } from '../hooks/listRecordCustomTableStateContext';
import { useListRecordCustomTableApi } from '../hooks/useListRecordCustomTableApi';

export const PageSizeSelector = () => {
    const { state, setState } = useListRecordCustomTableState();
    const { getRecordsApi } = useListRecordCustomTableApi();

    const onChangePageSize = (value: string) => {
        setState(prev => ({ ...prev, pageSize: parseInt(value) }));
        getRecordsApi({ pageSize: parseInt(value) });
    };

    const options = [10, 20, 50, 100].map(size => ({
        label: `${size} Rows`,
        value: size.toString()
    }));

    return <SingleSelect options={options} value={state.pageSize.toString()} onValueChange={onChangePageSize} />;
};
