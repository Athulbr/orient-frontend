import { useParams } from 'react-router-dom';
import { useToastStore } from '../../../../components/toast/ToastStore';
import { useLoginPageState } from './LoginPageStateProvider';
import { validateEmail, validatePassword } from '../utils';
import httpRequest from '../../../../utils/httpRequest';
import { useGoogleLogin } from '@react-oauth/google';
import { useEffect } from 'react';

export const useLoginPageApi = () => {
  const { state, setState } = useLoginPageState();
  const toast = useToastStore();

  // ============================= UseEffect ==================================
  useEffect(() => {
    if (!state.isSubmitClicked) return;
    const emailError = validateEmail(state.email);
    const passwordError = validatePassword(state.password);
    setState(prev => ({ ...prev, fieldError: { email: emailError, password: passwordError } }));
  }, [state.email, state.password]);

  // ============================= login With Email And Password ==================================
  const loginWithEmailAndPassword = async () => {
    setState(prev => ({ ...prev, isSubmitClicked: true }));
    const emailError = validateEmail(state.email);
    const passwordError = validatePassword(state.password);
    if (emailError || passwordError) {
      setState(prev => ({ ...prev, fieldError: { email: emailError, password: passwordError } }));
      return;
    }
    setState(prev => ({ ...prev, loading: true }));
    try {
      const res = await httpRequest('POST', `${import.meta.env.VITE_NODE_URL}/api/auth/login`, { email: state.email, password: state.password });
      if (res?.data?.accessToken) {
        window?.sessionStorage?.setItem('accessToken', JSON.stringify(res?.data?.accessToken));
        window?.sessionStorage?.setItem('firstName', JSON.stringify(res?.data?.user?.firstName));
        toast.success('Logged in successfully');
        setTimeout(() => {
          window?.location?.replace('/');
        }, 500);
      } else {
        setState(prev => ({ ...prev, authError: 'Login failed. Please check your credentials.' }));
      }
    } catch (error: any) {
      console.log('error:===========', error.message);
      if (error.message === 'Invalid password') return setState(prev => ({ ...prev, authError: 'Invalid Credentials' }));
      if (error.message === 'Invalid email') return setState(prev => ({ ...prev, authError: 'Invalid Credentials' }));

      setState(prev => ({ ...prev, authError: 'Something went wrong' }));
    } finally {
      setState(prev => ({ ...prev, loading: false }));
    }
  };

  // ============================= login With Google ==================================
  const loginWithGoogle = useGoogleLogin({
    onSuccess: async (response: any) => {
      try {
        setState(prev => ({ ...prev, oAuthLoading: true, authError: '' }));

        const user = await httpRequest('GET', 'https://www.googleapis.com/oauth2/v3/userinfo', {}, response.access_token);
        const ssoRegistration = {
          firstName: user.given_name,
          lastName: user.family_name,
          email: user.email,
        };
        const res = await httpRequest('POST', `${import.meta.env.VITE_NODE_URL}/api/auth/signup`, ssoRegistration);
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
    },
    onError: error => {
      console.error('Google Login Failed:', error);
      setState(prev => ({ ...prev, oAuthLoading: false, authError: 'Failed to connect to Google. Please try again.' }));
    },
  });

  // ============================= Return ==================================
  return { loginWithEmailAndPassword, loginWithGoogle };
};
