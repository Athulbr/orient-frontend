import { useState } from 'react';
import PageContainer from '../../../components/PageContainer';
import PageNameComponent from '../../../components/PageName';
import { TenantStateProvider } from './hooks/tenantContext';
import { ListTenantComponent } from './ListTenantComponent';
import { DialogComponent } from '../../../components/DialogComponent';
import CreateTenantComponent from './CreateTenantComponent';
import Breadcrumbs from '../../../components/Breadcrumbs';
import { ViewTenantComponent } from './ViewTenantComponent';

export interface TenantStateIF {
  showViewDialog: boolean;
  showCreateDialog: boolean;
  loading: boolean;
  id: string;
  tenant: any | null;
  refresh: number;
}

const initialState: TenantStateIF = {
  showViewDialog: false,
  showCreateDialog: false,
  loading: false,
  id: '',
  tenant: null,
  refresh: 1,
};

const ListTenantPage: React.FC = () => {
  const [state, setState] = useState<TenantStateIF>(initialState);

  return (
    <TenantStateProvider value={{ state, setState }}>
      {state.showViewDialog ? (
        <DialogComponent closeDialog={() => setState(prev => ({ ...prev, showViewDialog: false }))} name="View Tenant" isOpen className="w-[90vw]">
          <ViewTenantComponent />
        </DialogComponent>
      ) : (
        <PageContainer className="gap-2">
          <PageNameComponent name="List of Tenants">
            <Breadcrumbs page="listTenant" />
          </PageNameComponent>
          <ListTenantComponent />
        </PageContainer>
      )}
      <CreateTenantComponent />
    </TenantStateProvider>
  );
};

export default ListTenantPage;
