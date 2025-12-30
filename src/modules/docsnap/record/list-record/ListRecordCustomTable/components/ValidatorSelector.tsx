import { SingleSelect } from '../../../../../../components/SingleSelect';
import { useListRecordCustomTableState } from '../hooks/listRecordCustomTableStateContext';
interface ValidatorSelectorIF {
    test?: string;
}

const ValidatorSelector: React.FC<ValidatorSelectorIF> = () => {
    const { state, setState } = useListRecordCustomTableState();
    // if (true) return null;
    return (
        <SingleSelect
            value={state.selectedValidator}
            options={[
                { label: 'All Validators', value: '' },
                { label: 'Validator 1', value: 'validator1' },
                { label: 'Validator 2', value: 'validator2' }
            ]}
            onValueChange={value => setState(prev => ({ ...prev, selectedValidator: value }))}
            placeholder="Validator"
            className="w-36"
        />
    );
};

export default ValidatorSelector;
