import { useUserAccountState } from './userAccountContext';
import httpRequest from '../../../../../global-utils/httpRequest';
import { useToastStore } from '../../../../../components/toast/ToastStore';

export const useUserAccountApi = () => {
    const { state, setState } = useUserAccountState();
    const toast = useToastStore();

    // ============================= CREATE USERACCOUNT ==================================

    const getUserApi = async (id: string) => {
        try {
            setState(prev => ({ ...prev, loadingUser: true }));
            const res: any = await httpRequest('GET', `${import.meta.env.VITE_NODE_URL}/api/user/${id}`);
            setState(prev => ({ ...prev, user: res.data }));
            toast.success('UserAccount fetched successfully');
            return true;
        } catch (error) {
            console.error('error:===========', error);
            toast.error('Failed to fetch userAccount');
        } finally {
            setState(prev => ({ ...prev, loadingUser: false }));
        }
    };
    const updateUserName = async (firstName: string, lastName: string) => {
        try {
            setState(prev => ({ ...prev, loadingUser: true }));
            const res: any = await httpRequest('PATCH', `${import.meta.env.VITE_NODE_URL}/api/user/update/${state.user?._id}`, { firstName, lastName });
            setState(prev => ({ ...prev, updateNameDialog: false, user: res.data }));
            toast.success('Name updated successfully');
            return true;
        } catch (error) {
            console.error('error:===========', error);
            toast.error('Failed to update name');
        } finally {
            setState(prev => ({ ...prev, loadingUser: false }));
        }
    };
    const updateUserPassword = async (password: string) => {
        try {
            setState(prev => ({ ...prev, loadingUser: true }));
            const res: any = await httpRequest('PATCH', `${import.meta.env.VITE_NODE_URL}/api/user/update-password/${state.user?._id}`, { password });
            setState(prev => ({ ...prev, updatePasswordDialog: false, user: res.data }));
            toast.success('Password updated successfully');
            return true;
        } catch (error) {
            console.error('error:===========', error);
            toast.error('Failed to update password');
        } finally {
            setState(prev => ({ ...prev, loadingUser: false }));
        }
    };
    const logout = async () => {
        window.sessionStorage.clear();
        toast.success('Logged out successfully');
        setTimeout(() => {
            window?.location?.replace('/');
        }, 1000);
    };

    return { getUserApi, updateUserName, updateUserPassword, logout };
};
