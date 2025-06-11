import { useState } from 'react';
import PageContainer from '../../../components/PageContainer';
import PageNameComponent from '../../../components/PageName';
import CreateUserComponent from './CreateUserComponent';
import { UserStateProvider } from './hooks/userContext';
import { ListUserComponent } from './ListUserComponent';

export interface UserStateIF {
  showCreateDialog: boolean;
  loading: boolean;
  id: string;
}
const initialState = {
  showCreateDialog: false,
  loading: false,
  id: '',
};

const ListUserPage: React.FC = () => {
  const [state, setState] = useState<UserStateIF>(initialState);

  return (
    <UserStateProvider value={{ state, setState }}>
      <PageContainer className="gap-4">
        <PageNameComponent name="User List" showBackButton>
          <div className="cursor-pointer pt-1 pl-15 text-xs text-gray-500 hover:text-blue-400">Config&nbsp;&nbsp;/&nbsp;&nbsp;Users</div>
        </PageNameComponent>
        <ListUserComponent />
        <CreateUserComponent />
      </PageContainer>
    </UserStateProvider>
  );
};

export default ListUserPage;
