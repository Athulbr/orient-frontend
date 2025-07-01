import { UseFormbuilder } from '../../../builders/formbuilder/use-formbuilder';
import { useTenantState } from './hooks/tenantContext';
import { useTenantsApi } from './hooks/useTenantApi';

interface CreateTenantComponentIF {
  test?: string;
}

const CreateTenantComponent: React.FC<CreateTenantComponentIF> = () => {
  const { state, setState } = useTenantState();
  const { createTenantApi, updateTenantApi } = useTenantsApi();

  return (
    <UseFormbuilder
      isOpen={state.showCreateDialog}
      title={state.tenant ? 'Update Tenant' : 'Create Tenant'}
      name="Create Tenant Form"
      className="w-130"
      existingData={state.tenant || {}}
      onSubmit={e => (state.tenant ? updateTenantApi(e) : createTenantApi(e))}
      closeDialog={() => setState(prev => ({ ...prev, showCreateDialog: false, id: '', tenant: null }))}
    />
  );
};

export default CreateTenantComponent;
