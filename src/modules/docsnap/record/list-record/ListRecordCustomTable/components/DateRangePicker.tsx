import DateTimePicker, { DateRangeIF } from '../../../../../../components/DateTimePicker';
import { useListRecordCustomTableState } from '../hooks/listRecordCustomTableStateContext';

interface DateRangePickerIF {
    test?: string;
}

const DateRangePicker: React.FC<DateRangePickerIF> = () => {
    const { state, setState } = useListRecordCustomTableState();

    const onDateChange = ({ startDate, endDate }: DateRangeIF) => {
        setState(prev => ({ ...prev, startDate, endDate }));
    };
    return <DateTimePicker onChange={onDateChange} />;
};

export default DateRangePicker;
