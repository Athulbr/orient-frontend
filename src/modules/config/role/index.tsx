import { useState } from 'react';
import PageContainer from '../../../components/PageContainer';
import PageNameComponent from '../../../components/PageName';
import { RoleStateProvider } from './hooks/roleContext';
import { ListRoleComponent } from './ListRoleComponent';
import { DialogComponent } from '../../../components/DialogComponent';
import CreteRoleComponent from './CreateRoleComponent';
import ViewRoleComponent from './ViewRoleComponent';

export interface RoleStateIF {
  showViewDialog: boolean;
  showCreateDialog: boolean;
  loading: boolean;
  id: string;
  role: any | null;
  refresh: number;
}
const initialState: RoleStateIF = {
  showViewDialog: false,
  showCreateDialog: false,
  loading: false,
  id: '',
  role: null,
  refresh: 1,
};

const ListRolePage: React.FC = () => {
  const [state, setState] = useState<RoleStateIF>(initialState);

  return (
    <RoleStateProvider value={{ state, setState }}>
      {state.showViewDialog ? (
        <DialogComponent closeDialog={() => setState(prev => ({ ...prev, showViewDialog: false }))} name="Create Role" isOpen className="w-[90vw]">
          <ViewRoleComponent />
        </DialogComponent>
      ) : (
        <PageContainer className="gap-2">
          <PageNameComponent name="List of Roles" />
          <ListRoleComponent />
        </PageContainer>
      )}
      <CreteRoleComponent />
    </RoleStateProvider>
  );
};

export default ListRolePage;
