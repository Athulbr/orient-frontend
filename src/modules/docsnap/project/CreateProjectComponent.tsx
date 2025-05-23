import { UseFormbuilder } from '../../../builders/formbuilder/use-formbuilder';
import { useProjectState } from './hooks/projectContext';

const CreateProjectComponent: React.FC = ({}) => {
  const { state, setState } = useProjectState();
  return (
    <UseFormbuilder
      isOpen={state.showCreateDialog}
      title={state.id ? 'Update Project' : 'Add Project'}
      name="Create Project Form"
      className="w-130"
      onSubmit={e => console.log(e)}
      closeDialog={() => setState(prev => ({ ...prev, showCreateDialog: false, id: '' }))}
    />
  );
};

export default CreateProjectComponent;
