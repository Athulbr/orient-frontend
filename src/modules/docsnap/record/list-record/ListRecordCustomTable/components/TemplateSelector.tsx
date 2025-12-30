import { MultiSelect } from '../../../../../../components/MultiSelect';
import { useListRecordCustomTableState } from '../hooks/listRecordCustomTableStateContext';
interface TemplateSelectorIF {
    test?: string;
}

const templateList = JSON.parse(sessionStorage.getItem('templates') || '[]');

const selectedTenant = sessionStorage.getItem('selectedTenant');
const options: { label: string; value: string }[] = [];
templateList.map((template: any) => {
    if (selectedTenant === template.tenantId) {
        options.push({
            label: template.name,
            value: template._id
        });
    }
});

const TemplateSelector: React.FC<TemplateSelectorIF> = () => {
    const { state, setState } = useListRecordCustomTableState();
    return (
        <MultiSelect
            className=" w-80"
            placeholder="All Templates"
            options={options}
            values={state.selectedTemplates}
            onValuesChange={(values: string[]) => {
                setState(prev => ({ ...prev, selectedTemplates: values }));
            }}
        />
    );
};

export default TemplateSelector;
