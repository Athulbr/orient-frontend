import { useToastStore } from '../../../../components/toast/ToastStore';
import { useSignupPageState } from './SignupPageStateProvider';
import { validateConfirmPassword, validateEmail, validateFirstName, validateLastName, validatePassword } from '../utils';
import httpRequest from '../../../../global-utils/httpRequest';
import { useGoogleLogin } from '@react-oauth/google';
import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useMsal } from '@azure/msal-react';
import { loginRequest } from '../../login/sso/msal-config';

export const useSignupPageApi = () => {
    const { state, setState } = useSignupPageState();
    const toast = useToastStore();
    const { instance, accounts } = useMsal();

    const navigate = useNavigate();

    // ============================= UseEffect ==================================
    useEffect(() => {
        if (!state.isSubmitClicked) return;
        const firstNameError = validateFirstName(state.firstName);
        const lastNameError = validateLastName(state.lastName);
        const emailError = validateEmail(state.email);
        const passwordError = validatePassword(state.password);
        const confirmPasswordError = validateConfirmPassword(state.password, state.confirmPassword);
        setState(prev => ({
            ...prev,
            fieldError: {
                firstName: firstNameError,
                lastName: lastNameError,
                email: emailError,
                password: passwordError,
                confirmPassword: confirmPasswordError
            }
        }));
    }, [state.email, state.password, state.firstName, state.lastName, state.confirmPassword]);

    // ============================= signup With Email And Password ==================================
    const signupWithEmailAndPassword = async () => {
        setState(prev => ({ ...prev, isSubmitClicked: true }));
        const firstNameError = validateFirstName(state.firstName);
        const lastNameError = validateLastName(state.lastName);
        const emailError = validateEmail(state.email);
        const passwordError = validatePassword(state.password);
        const confirmPasswordError = validateConfirmPassword(state.password, state.confirmPassword);
        if (firstNameError || lastNameError || emailError || passwordError || confirmPasswordError) {
            setState(prev => ({
                ...prev,
                fieldError: {
                    firstName: firstNameError,
                    lastName: lastNameError,
                    email: emailError,
                    password: passwordError,
                    confirmPassword: confirmPasswordError
                }
            }));
            return;
        }
        setState(prev => ({ ...prev, loading: true }));
        try {
            const requestBody = {
                firstName: state.firstName,
                lastName: state.lastName,
                email: state.email,
                password: state.password,
                confirmPassword: state.confirmPassword
            };
            const res = await httpRequest('POST', `${import.meta.env.VITE_NODE_URL}/user/signup`, requestBody);
            if (res?.success) setState(prev => ({ ...prev, signUpSuccess: true }));
        } catch (error: any) {
            console.error('error:===========', error.message);
            if (error.message === 'User already exists') return setState(prev => ({ ...prev, authError: 'User already exists' }));
            setState(prev => ({ ...prev, authError: 'Something went wrong' }));
        } finally {
            setState(prev => ({ ...prev, loading: false }));
        }
    };

    // ============================= login With Google ==================================
    const signupWithGoogle = useGoogleLogin({
        onSuccess: async (response: any) => {
            try {
                setState(prev => ({ ...prev, oAuthLoading: true, authError: '' }));

                const user = await httpRequest('POST', `${import.meta.env.VITE_NODE_URL}/auth/google/userinfo`, { access_token: response?.access_token });
                const ssoRegistration = {
                    firstName: user.given_name,
                    lastName: user.family_name,
                    email: user.email,
                    sso: true
                };
                const res = await httpRequest('POST', `${import.meta.env.VITE_NODE_URL}/auth/signup`, ssoRegistration);
                if (res.data?.accessToken) {
                    window?.sessionStorage?.setItem('accessToken', JSON.stringify(res.data?.accessToken));
                    window?.sessionStorage?.setItem('firstName', JSON.stringify(res?.data?.user?.firstName));
                    window?.sessionStorage?.setItem('user', JSON.stringify(res?.data?.user));
                    // window?.sessionStorage?.setItem('role', JSON.stringify(res?.data?.role));
                    const resp = await Promise.all([
                        httpRequest('POST', `${import.meta.env.VITE_NODE_URL}/builder/tablebuilder/query`, { pageSize: 1000 }),
                        httpRequest('POST', `${import.meta.env.VITE_NODE_URL}/builder/formbuilder/query`, { pageSize: 1000 })
                    ]);
                    window?.sessionStorage?.setItem('tablebuilder', JSON.stringify(resp[0]?.data));
                    window?.sessionStorage?.setItem('formbuilder', JSON.stringify(resp[1]?.data));
                    toast.success('Logged in successfully');
                    window?.location?.replace('/');
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
        }
    });

    // ============================= login With MSAL ==================================
    const loginWithMSAL = async () => {
        console.info('Login with Microsoft initiated');
        instance.loginRedirect(loginRequest).catch(e => {
            console.error('Sign In issue---->', e);
        });
    };

    // ============================= Return ==================================
    return { signupWithEmailAndPassword, signupWithGoogle, loginWithMSAL };
};
