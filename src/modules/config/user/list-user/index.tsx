import { useState } from 'react';
import CreateUserComponent from './CreateUserComponent';
import { UserStateProvider } from './hooks/userContext';
import { ListUserComponent } from './ListUserComponent';
import PageContainer from '../../../../components/PageContainer';
import PageNameComponent from '../../../../components/PageName';

export interface UserStateIF {
  showCreateDialog: boolean;
  loading: boolean;
  id: string;
  refresh: number;
}
const initialState = {
  showCreateDialog: false,
  loading: false,
  id: '',
  refresh: 1,
};

const ListUserPage: React.FC = () => {
  const [state, setState] = useState<UserStateIF>(initialState);

  return (
    <UserStateProvider value={{ state, setState }}>
      <PageContainer className="gap-4">
        <PageNameComponent name="User List" />
        <ListUserComponent />
        <CreateUserComponent />
      </PageContainer>
    </UserStateProvider>
  );
};

export default ListUserPage;
