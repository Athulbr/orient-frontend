import { Key } from 'lucide-react';
import { useParams } from 'react-router-dom';
import { useToastStore } from '../../../../components/toast/ToastStore';
import { useLoginPageState } from './LoginPageStateProvider';
import { validateEmail, validatePassword } from '../utils';
import httpRequest from '../../../../global-utils/httpRequest';
import { useEffect } from 'react';
import { usePermissionStore } from '../../../../zustand-store/PermissionStore';
import { config } from '../../../../config/default';

export const useLoginPageApi = () => {
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

    // ============================= login With PHP Session ==================================
    const loginWithPhpSession = async (sessionToken: string) => {
        try {
            setState(prev => ({ ...prev, oAuthLoading: true, authError: '' }));

            const res = await httpRequest('POST', `${config.nodeApiUrl}/auth/bootstrap`, { token: sessionToken });

            if (res.data?.accessToken) {
                window?.sessionStorage?.setItem('accessToken', JSON.stringify(res.data?.accessToken));
                window?.sessionStorage?.setItem('reactLoginTime', Date.now().toString());
                if (res.data?.orientSessionId) {
                    window?.sessionStorage?.setItem('orientSessionId', res.data.orientSessionId);
                }
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
                setState(prev => ({ ...prev, authError: 'Authentication with Orient session failed.', oAuthLoading: false }));
            }
        } catch (error: any) {
            console.error('Orient Session login error:', error);
            setState(prev => ({ ...prev, authError: 'Please open from Orient portal', oAuthLoading: false }));
        }
    };

    useEffect(() => {
        const queryParams = new URLSearchParams(window.location.search);
        const sessionToken = queryParams.get('token');

        if (sessionToken) {
            window.history.replaceState({}, document.title, window.location.pathname);
            loginWithPhpSession(sessionToken);
        } else {
            // No token present — Show login page.
        }
    }, []);

    // ============================= Return ==================================
    return { loginWithEmailAndPassword, loginWithPhpSession };
};
