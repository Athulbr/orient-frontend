import { useMsal, AuthenticatedTemplate, UnauthenticatedTemplate, useIsAuthenticated } from '@azure/msal-react';
import style from './microsoft-sso.module.css';
import { useNavigate } from 'react-router-dom';
import { loginRequest } from '../../../config/sso/msal-config';
import MSIcon from '../../../../assets/svg-icons/MSIcon';

const MicrosoftLogin: React.FC<any> = ({ className, children }) => {
  const { instance, accounts } = useMsal();
  const navigate = useNavigate();
  const isAuthenticated = useIsAuthenticated();

  const loginWithMicrosoft = async () => {
    console.log('Login with Microsoft initiated');
    instance.loginRedirect(loginRequest).catch(e => {
      console.log('Sign In issue---->', e);
    });
  };

  const handleLogout = () => {
    instance.logoutRedirect({
      postLogoutRedirectUri: '/',
    });
  };

  return (
    <>
      <AuthenticatedTemplate>
        <button type="button" onClick={handleLogout}>
          <MSIcon width={20} height={20} />
          <span>Microsoft Out</span>
        </button>
      </AuthenticatedTemplate>
      <UnauthenticatedTemplate>
        <button type="button" onClick={loginWithMicrosoft}>
          <MSIcon width={20} height={20} />
          <span>Microsoft</span>
        </button>
      </UnauthenticatedTemplate>

      {children}
    </>
  );
};

export default MicrosoftLogin;
