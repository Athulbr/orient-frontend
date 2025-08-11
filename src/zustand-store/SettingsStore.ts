import { create } from 'zustand';
import httpRequest from '../global-utils/httpRequest';

interface SettingsStoreIF {
    // ============================== USER SETTINGS ===============================
    userSettings: any;
    submitUserSettings: (settings?: any) => Promise<void>;
    getUserSettings: () => Promise<void>;
    // ============================== DOCSNAP SETTINGS ===============================
    docsnapSettings: any;
    submitDocsnapSettings: (settings?: any) => Promise<void>;
    getDocsnapSettings: () => Promise<void>;
    // ============================== TENANT SETTINGS ===============================
    tenantSettings: any;
    submitTenantSettings: (settings?: any) => Promise<void>;
    getTenantSettings: () => Promise<void>;
}

export const useSettingsStore = create<SettingsStoreIF>(set => ({
    // ============================== USER SETTINGS ===============================
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
    },
    // ============================== DOCSNAP SETTINGS ===============================
    docsnapSettings: {},
    submitDocsnapSettings: async (settings?: any) => {
        try {
            const res = await httpRequest('POST', `${import.meta.env.VITE_NODE_URL}/api/docsnap/settings/submit`, {
                settings
            });
            set({ docsnapSettings: settings });
        } catch (error) {
            console.log(error);
        }
    },
    getDocsnapSettings: async () => {
        try {
            const res = await httpRequest('GET', `${import.meta.env.VITE_NODE_URL}/api/docsnap/settings/list`);
            set({ docsnapSettings: res.data.settings });
        } catch (error) {
            console.log(error);
        }
    },
    // ============================== TENANT SETTINGS ===============================
    tenantSettings: {},
    submitTenantSettings: async (settings?: any) => {
        try {
            const res = await httpRequest('POST', `${import.meta.env.VITE_NODE_URL}/api/tenant/settings/submit`, {
                settings
            });
            set({ tenantSettings: settings });
        } catch (error) {
            console.log(error);
        }
    },
    getTenantSettings: async () => {
        try {
            const res = await httpRequest('GET', `${import.meta.env.VITE_NODE_URL}/api/tenant/settings/list`);
            set({ tenantSettings: res.data.settings });
        } catch (error) {
            console.log(error);
        }
    }
    // ============================== TENANT SETTINGS ===============================
}));
