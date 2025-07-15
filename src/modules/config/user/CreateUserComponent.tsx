import { UseFormbuilder } from '../../../builders/formbuilder/use-formbuilder';
import { useUserState } from './hooks/userContext';
import { useUserApiService } from './hooks/useUserApiService';

const CreateUserComponent: React.FC = ({}) => {
  const { state, setState } = useUserState();
  const { createUserApi } = useUserApiService();
  return (
    <UseFormbuilder
      isOpen={state.showCreateDialog}
      title={state.id ? 'Update User' : 'Add User'}
      name="Create User Form"
      className="w-130"
      onSubmit={createUserApi}
      closeDialog={() => setState(prev => ({ ...prev, showCreateDialog: false, id: '' }))}
    />
  );
};

export default CreateUserComponent;
