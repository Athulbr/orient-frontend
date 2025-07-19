import { useEffect, useState } from 'react';
import { UserAccountStateProvider } from './hooks/userAccountContext';
import PageContainer from '../../../../components/PageContainer';
import PageNameComponent from '../../../../components/PageName';
import Breadcrumbs from '../../../../components/Breadcrumbs';
import { useNavigate, useParams } from 'react-router-dom';
import UserDetailsComponent from './UserDetailsComponent';
import { useUserAccountApi } from './hooks/useUserAccountApi';

export interface UserAccountStateIF {
  id: string;
  userAccount: any | null;
  loadingUserAccount: boolean;
}
const initialState = {
  id: '',
  userAccount: null,
  loadingUserAccount: false,
};

const UserAccountDetailsPage: React.FC = () => {
  const [state, setState] = useState<UserAccountStateIF>(initialState);
  const navigate = useNavigate();

  return (
    <UserAccountStateProvider value={{ state, setState }}>
      <PageContainer className="gap-4 pt-6">
        <Breadcrumbs page="UserAccount" className="px-7" />
        <PageNameComponent className="border-b px-6 pb-4" name="Account Details" showBackButton customGoBackFunction={() => navigate('/')} />
        <UserDetailsComponent />
      </PageContainer>
    </UserAccountStateProvider>
  );
};

export default UserAccountDetailsPage;
