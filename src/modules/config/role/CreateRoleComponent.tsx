import { UseFormbuilder } from '../../../builders/formbuilder/use-formbuilder';
import { useRoleState } from './hooks/roleContext';

interface CreteRoleComponentIF {
  test?: string;
}

const CreteRoleComponent: React.FC<CreteRoleComponentIF> = () => {
  const { state, setState } = useRoleState();
  return (
    <UseFormbuilder
      isOpen={state.showCreateDialog}
      title="Create Role"
      name="Create Role Form"
      className="w-130"
      onSubmit={e => alert('CreateRole Submit')}
      closeDialog={() => setState(prev => ({ ...prev, showCreateDialog: false, id: '' }))}
    />
  );
};

export default CreteRoleComponent;
