import { Key } from 'lucide-react';
import { loginRequest } from '../sso/msal-config';
import { useParams } from 'react-router-dom';
import { useToastStore } from '../../../../components/toast/ToastStore';
import { useLoginPageState } from './LoginPageStateProvider';
import { validateEmail, validatePassword } from '../utils';
import httpRequest from '../../../../global-utils/httpRequest';
import { useGoogleLogin } from '@react-oauth/google';
import { useMsal } from '@azure/msal-react';
import { useEffect } from 'react';
import { usePermissionStore } from '../../../../zustand-store/PermissionStore';

export const useLoginPageApi = () => {
    const { instance, accounts } = useMsal();
    const { state, setState } = useLoginPageState();
    const { settings, checkPermission, setPermissions } = usePermissionStore();
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
            const res = await httpRequest('POST', `${import.meta.env.VITE_NODE_URL}/auth/login`, { email: state.email, password: state.password });
            if (res?.data?.accessToken) {
                window?.sessionStorage?.setItem('accessToken', JSON.stringify(res?.data?.accessToken));
                window?.sessionStorage?.setItem('user', JSON.stringify(res?.data?.user));
                window?.sessionStorage?.setItem('role', JSON.stringify(res?.data?.role));
                window?.sessionStorage?.setItem('permissions', JSON.stringify(res?.data?.permissions));

                const resp = await Promise.all([
                    httpRequest('POST', `${import.meta.env.VITE_NODE_URL}/builder/tablebuilder/query`, { pageSize: 1000 }),
                    httpRequest('POST', `${import.meta.env.VITE_NODE_URL}/builder/formbuilder/query`, { pageSize: 1000 })
                ]);
                window?.sessionStorage?.setItem('tablebuilder', JSON.stringify(resp[0]?.data));
                window?.sessionStorage?.setItem('formbuilder', JSON.stringify(resp[1]?.data));


                if (res?.data?.permissions[0]?.key?.includes('create:transcription') && res?.data?.user?.role?.name !== 'superadmin') {
                    window?.location?.replace('/transcript/list');
                } else {
                    const permissions = [
                        'create:template',
                        'read:template',
                        'delete:template',
                        'update:template',
                        'extract:document',
                        'read:user',
                        'read:module',
                        'read:feature',
                        'read:role',
                        'read:tenant',
                        'read:subscription-model',
                        'read:formbuilder',
                        'read:tablebuilder',
                        'read:comment',
                        'read:prompt-tuning'
                    ];
                    window?.sessionStorage?.setItem('permissions', JSON.stringify(permissions));
                    toast.success('Logged in successfully');
                    window?.location?.replace('/');
                }
            } else {
                setState(prev => ({ ...prev, authError: 'Login failed. Please check your credentials.' }));
            }
        } catch (error: any) {
            console.error('error:===========', error.message);
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
    return { loginWithEmailAndPassword, loginWithGoogle, loginWithMSAL };
};
