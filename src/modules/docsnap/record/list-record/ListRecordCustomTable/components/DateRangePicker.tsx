import DateTimePicker from '../../../../../../components/DateTimePicker';

interface DateRangePickerIF {
    test?: string;
}

const DateRangePicker: React.FC<DateRangePickerIF> = () => {
    return <DateTimePicker onChange={() => {}} />;
};

export default DateRangePicker;
