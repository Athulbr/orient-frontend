import { UseFormbuilder } from '../../../builders/formbuilder/use-formbuilder';
import { useUserState } from './hooks/userContext';

const CreateUserComponent: React.FC = ({}) => {
  const { state, setState } = useUserState();
  return (
    <UseFormbuilder
      isOpen={state.showCreateDialog}
      title={state.id ? 'Update User' : 'Add User'}
      name="Create User Form"
      className="w-130"
      onSubmit={e => console.log(e)}
      closeDialog={() => setState(prev => ({ ...prev, showCreateDialog: false, id: '' }))}
    />
  );
};

export default CreateUserComponent;
