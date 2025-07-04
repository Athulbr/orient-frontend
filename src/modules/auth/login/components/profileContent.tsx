import React from 'react';
import { useMsal, useIsAuthenticated } from '@azure/msal-react';
import { useNavigate } from 'react-router-dom';
import { callMsGraph } from '../../../config/sso/graph';
import { loginRequest } from '../../../config/sso/msal-config';
import httpRequest from '../../../../global-utils/httpRequest';
import { useToastStore } from '../../../../components/toast/ToastStore';
import { useLoginPageState } from '../hooks/LoginPageStateProvider';
const ProfileContent: React.FC<any> = ({ data }) => {
  const { instance, accounts } = useMsal();
  const isAuthenticated = useIsAuthenticated();
  const toast = useToastStore();
  const { state, setState } = useLoginPageState();

  if (isAuthenticated) {
    instance
      .acquireTokenSilent({
        ...loginRequest,
        account: accounts[0],
      })
      .then((response: any) => {
        callMsGraph(response.accessToken).then(async response => {
          const ssoRegistraion = {
            firstName: response.givenName,
            lastName: response.surname,
            email: response.mail,
            sso: true,
          };

          try {
            const res = await httpRequest('POST', `${import.meta.env.VITE_NODE_URL}/api/auth/signup`, ssoRegistraion);
            if (res.data?.accessToken) {
              window?.sessionStorage?.setItem('accessToken', JSON.stringify(res.data?.accessToken));
              window?.sessionStorage?.setItem('firstName', JSON.stringify(res?.data?.user?.firstName));

              toast.success('Logged in successfully');
              setTimeout(() => {
                window?.location?.replace('/');
              }, 500);
            } else {
              setState(prev => ({ ...prev, authError: 'Authentication failed. Please try again.' }));
            }
          } catch (error: any) {
            console.error('Google login error:', error);
            setState(prev => ({ ...prev, authError: 'Failed to login with Google. Please try again.' }));
          } finally {
            setState(prev => ({ ...prev, oAuthLoading: false }));
          }
        });
      });
  }

  return <></>;
};

export default ProfileContent;
