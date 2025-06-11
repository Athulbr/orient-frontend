import { useParams } from 'react-router-dom';
import { useToastStore } from '../../../../components/toast/ToastStore';
import { useSignupPageState } from './SignupPageStateProvider';
import { validateEmail, validatePassword } from '../utils';
import httpRequest from '../../../../utils/httpRequest';
import { useGoogleLogin } from '@react-oauth/google';
import { useEffect } from 'react';

export const useSignupPageApi = () => {
  const { state, setState } = useSignupPageState();
  const toast = useToastStore();

  // ============================= UseEffect ==================================
  useEffect(() => {
    if (!state.isSubmitClicked) return;
    const nameError = validateEmail(state.email);
    const emailError = validateEmail(state.email);
    const passwordError = validatePassword(state.password);
    const confirmPasswordError = validatePassword(state.password);
    setState(prev => ({ ...prev, fieldError: { name: nameError, email: emailError, password: passwordError, confirmPassword: confirmPasswordError } }));
  }, [state.email, state.password]);

  // ============================= signup With Email And Password ==================================
  const signupWithEmailAndPassword = async () => {
    setState(prev => ({ ...prev, isSubmitClicked: true }));
    const nameError = validateEmail(state.email);
    const emailError = validateEmail(state.email);
    const passwordError = validatePassword(state.password);
    const confirmPasswordError = validatePassword(state.password);
    if (emailError || passwordError) {
      setState(prev => ({ ...prev, fieldError: { name: nameError, email: emailError, password: passwordError, confirmPassword: confirmPasswordError } }));
      return;
    }
    setState(prev => ({ ...prev, loading: true }));
    try {
      const res = await httpRequest('POST', `${import.meta.env.VITE_NODE_URL}/api/auth/signup`, { email: state.email, password: state.password });
      if (res?.data?.accessToken) {
        window?.sessionStorage?.setItem('accessToken', JSON.stringify(res?.data?.accessToken));
        window?.sessionStorage?.setItem('firstName', JSON.stringify(res?.data?.user?.firstName));
        toast.success('Logged in successfully');
        setTimeout(() => {
          window?.location?.replace('/');
        }, 500);
      } else {
        setState(prev => ({ ...prev, authError: 'Signup failed. Please check your credentials.' }));
      }
    } catch (error: any) {
      console.log('error:===========', error.message);
      if (error.message === 'Invalid password') return setState(prev => ({ ...prev, authError: 'Invalid password' }));

      setState(prev => ({ ...prev, authError: 'Something went wrong' }));
    } finally {
      setState(prev => ({ ...prev, loading: false }));
    }
  };

  // ============================= signup With Google ==================================
  const signupWithGoogle = useGoogleLogin({
    onSuccess: async (response: any) => {
      try {
        setState(prev => ({ ...prev, loading: true, authError: '' }));

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
        console.error('Google signup error:', error);
        setState(prev => ({ ...prev, authError: 'Failed to signup with Google. Please try again.' }));
      } finally {
        setState(prev => ({ ...prev, loading: false }));
      }
    },
    onError: error => {
      console.error('Google Signup Failed:', error);
      setState(prev => ({ ...prev, loading: false, authError: 'Failed to connect to Google. Please try again.' }));
    },
  });

  // ============================= Return ==================================
  return { signupWithEmailAndPassword, signupWithGoogle };
};
