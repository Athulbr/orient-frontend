import { create } from 'zustand';
import httpRequest from '../global-utils/httpRequest';

interface SettingsStoreIF {
    userSettings: any;
    submitUserSettings: (settings?: any) => Promise<void>;
    getUserSettings: () => Promise<void>;
}

export const useSettingsStore = create<SettingsStoreIF>(set => ({
    userSettings: {},
    submitUserSettings: async (settings?: any) => {
        try {
            const res = await httpRequest('POST', `${import.meta.env.VITE_NODE_URL}/api/user/settings/submit`, {
                settings
            });
            set({ userSettings: settings });
        } catch (error) {
            console.log(error);
        }
    },
    getUserSettings: async () => {
        try {
            const res = await httpRequest('GET', `${import.meta.env.VITE_NODE_URL}/api/user/settings/list`);
            set({ userSettings: res.data.settings });
        } catch (error) {
            console.log(error);
        }
    }
}));
