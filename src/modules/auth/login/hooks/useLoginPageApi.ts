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
import { config } from '../../../../config/default';

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
        //===== only for developers ======
        const autoLoginCredential = window?.localStorage?.getItem('autologin') === 'true' ? { email: 'sam@demo.com', password: 'welcome' } : null;
        //===== only for developers ======
        if (!autoLoginCredential) {
            setState(prev => ({ ...prev, isSubmitClicked: true }));
            const emailError = validateEmail(state.email);
            const passwordError = validatePassword(state.password);
            if (emailError || passwordError) {
                setState(prev => ({ ...prev, fieldError: { email: emailError, password: passwordError } }));
                return;
            }
        }
        setState(prev => ({ ...prev, loading: true }));

        try {
            const res = await httpRequest(
                'POST',
                `${config.nodeApiUrl}/auth/login`,
                autoLoginCredential ? autoLoginCredential : { email: state.email, password: state.password }
            );
            if (res?.data?.accessToken) {
                window?.sessionStorage?.setItem('accessToken', JSON.stringify(res?.data?.accessToken));
                window?.sessionStorage?.setItem('user', JSON.stringify(res?.data?.user));
                window?.sessionStorage?.setItem('role', JSON.stringify(res?.data?.user?.role));
                window?.sessionStorage?.setItem('permissions', JSON.stringify(res?.data?.permissions));

                const resp = await Promise.all([
                    httpRequest('POST', `${config.nodeApiUrl}/builder/tablebuilder/query`, { pageSize: 1000 }),
                    httpRequest('POST', `${config.nodeApiUrl}/builder/formbuilder/query`, { pageSize: 1000 }),
                    httpRequest('POST', `${config.nodeApiUrl}/idp/pre-template`, { pageSize: 1000, custom: true, filters: { deleted: false } }),
                    httpRequest('POST', `${config.nodeApiUrl}/idp/template`, { pageSize: 1000, custom: true, filters: { deleted: false } })
                ]);
                window?.sessionStorage?.setItem('tablebuilder', JSON.stringify(resp[0]?.data));
                window?.sessionStorage?.setItem('formbuilder', JSON.stringify(resp[1]?.data));
                window?.sessionStorage?.setItem('predefinedTemplates', JSON.stringify(resp[2]?.data));
                window?.sessionStorage?.setItem('templates', JSON.stringify(resp[3]?.data));

                toast.success('Logged in successfully');
                window?.location?.replace('/');
            } else {
                setState(prev => ({ ...prev, authError: 'Login failed. Please check your credentials.' }));
            }
        } catch (error: any) {
            console.error('error:===========', error.message);
            if (error.message === 'Invalid password') return setState(prev => ({ ...prev, authError: 'Invalid Credentials' }));
            if (error.message === 'Invalid email') return setState(prev => ({ ...prev, authError: 'Invalid Credentials' }));

            setState(prev => ({ ...prev, authError: error.message }));
        } finally {
            setState(prev => ({ ...prev, loading: false }));
        }
    };

    // ============================= login With Google ==================================
    const loginWithGoogle = useGoogleLogin({
        onSuccess: async (response: any) => {
            try {
                setState(prev => ({ ...prev, oAuthLoading: true, authError: '' }));

                const user = await httpRequest('POST', `${config.nodeApiUrl}/auth/google/userinfo`, { access_token: response?.access_token });
                const ssoRegistration = {
                    firstName: user.given_name,
                    lastName: user.family_name,
                    email: user.email,
                    sso: true
                };
                const res = await httpRequest('POST', `${config.nodeApiUrl}/auth/signup`, ssoRegistration);
                if (res.data?.accessToken) {
                    window?.sessionStorage?.setItem('accessToken', JSON.stringify(res.data?.accessToken));
                    window?.sessionStorage?.setItem('firstName', JSON.stringify(res?.data?.user?.firstName));
                    window?.sessionStorage?.setItem('user', JSON.stringify(res?.data?.user));
                    window?.sessionStorage?.setItem('permissions', JSON.stringify(res?.data?.permissions));
                    // window?.sessionStorage?.setItem('role', JSON.stringify(res?.data?.role));
                    const resp = await Promise.all([
                        httpRequest('POST', `${config.nodeApiUrl}/builder/tablebuilder/query`, { pageSize: 1000 }),
                        httpRequest('POST', `${config.nodeApiUrl}/builder/formbuilder/query`, { pageSize: 1000 }),
                        httpRequest('POST', `${config.nodeApiUrl}/idp/pre-template`, { pageSize: 1000, custom: true, filters: { deleted: false } }),
                        httpRequest('POST', `${config.nodeApiUrl}/idp/template`, { pageSize: 1000, custom: true, filters: { deleted: false } })
                    ]);
                    window?.sessionStorage?.setItem('tablebuilder', JSON.stringify(resp[0]?.data));
                    window?.sessionStorage?.setItem('formbuilder', JSON.stringify(resp[1]?.data));
                    window?.sessionStorage?.setItem('predefinedTemplates', JSON.stringify(resp[2]?.data));
                    window?.sessionStorage?.setItem('templates', JSON.stringify(resp[3]?.data));
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

    // ============================= login With PHP Session ==================================
    const loginWithPhpSession = async (sessionToken: string) => {
        try {
            setState(prev => ({ ...prev, oAuthLoading: true, authError: '' }));
            const userJson = atob(decodeURIComponent(sessionToken));
            const phpUser = JSON.parse(userJson);

            console.log('phpUser:===========', phpUser);

            let firstName = phpUser.name || phpUser.username;
            let lastName = '';
            if (phpUser.name && phpUser.name.includes(' ')) {
                const parts = phpUser.name.split(' ');
                firstName = parts[0];
                lastName = parts.slice(1).join(' ');
            }

            const ssoRegistration = {
                firstName: firstName,
                lastName: lastName,
                email: phpUser.email || `${phpUser.username}@makez.com`,
                sso: true
            };

            const res = await httpRequest('POST', `${config.nodeApiUrl}/auth/signup`, ssoRegistration);

            if (res.data?.accessToken) {
                window?.sessionStorage?.setItem('accessToken', JSON.stringify(res.data?.accessToken));
                window?.sessionStorage?.setItem('reactLoginTime', Date.now().toString());
                window?.sessionStorage?.setItem('firstName', JSON.stringify(res?.data?.user?.firstName));
                window?.sessionStorage?.setItem('user', JSON.stringify(res?.data?.user));
                window?.sessionStorage?.setItem('permissions', JSON.stringify(res?.data?.permissions));

                const resp = await Promise.all([
                    httpRequest('POST', `${config.nodeApiUrl}/builder/tablebuilder/query`, { pageSize: 1000 }),
                    httpRequest('POST', `${config.nodeApiUrl}/builder/formbuilder/query`, { pageSize: 1000 }),
                    httpRequest('POST', `${config.nodeApiUrl}/idp/pre-template`, { pageSize: 1000, custom: true, filters: { deleted: false } }),
                    httpRequest('POST', `${config.nodeApiUrl}/idp/template`, { pageSize: 1000, custom: true, filters: { deleted: false } })
                ]);
                window?.sessionStorage?.setItem('tablebuilder', JSON.stringify(resp[0]?.data));
                window?.sessionStorage?.setItem('formbuilder', JSON.stringify(resp[1]?.data));
                window?.sessionStorage?.setItem('predefinedTemplates', JSON.stringify(resp[2]?.data));
                window?.sessionStorage?.setItem('templates', JSON.stringify(resp[3]?.data));
                window?.location?.replace('/docsnap');
            } else {
                setState(prev => ({ ...prev, authError: 'Authentication with PHP session failed.' }));
            }
        } catch (error: any) {
            console.error('PHP Session login error:', error);
            setState(prev => ({ ...prev, authError: 'Failed to login via Makez PHP. Please try again.' }));
        } finally {
            setState(prev => ({ ...prev, oAuthLoading: false }));
        }
    };

    useEffect(() => {
        const queryParams = new URLSearchParams(window.location.search);
        const sessionToken = queryParams.get('token');
        if (sessionToken) {
            loginWithPhpSession(sessionToken);
        }
    }, []);

    // ============================= Return ==================================
    return { loginWithEmailAndPassword, loginWithGoogle, loginWithMSAL, loginWithPhpSession };
};
