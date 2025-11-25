import { create } from 'zustand';
import httpRequest from '../global-utils/httpRequest';
import { useToastStore } from '../components/toast/ToastStore';
import { usePermissionStore } from './PermissionStore';
import { config } from '../config/default';

interface SettingsStoreIF {
    // ============================== USER SETTINGS ===============================
    userSettings: any;
    userSettingResponse: string;
    submitUserSettings: (settings?: any) => Promise<void>;
    getUserSettings: () => Promise<void>;
    // ============================== DOCSNAP SETTINGS ===============================
    docsnapSettings: any;
    docsnapSettingResponse: string;
    submitDocsnapSettings: (settings?: any) => Promise<void>;
    getDocsnapSettings: () => Promise<void>;
    // ============================== TENANT SETTINGS ===============================
    tenantSettings: any;
    tenantSettingResponse: string;
    selectedTenant: any;
    submitTenantSettings: (settings?: any) => Promise<void>;
    getTenantSettings: () => Promise<void>;
    setSelectedTenant: (tenant: any) => void;
}

export const useSettingsStore = create<SettingsStoreIF>((set, get) => ({
    // ============================== USER SETTINGS ===============================
    userSettings: {},
    userSettingResponse: '',
    submitUserSettings: async (settings?: any) => {
        try {
            const res = await httpRequest('POST', `${config.nodeApiUrl}/user/settings/submit`, {
                settings
            });
            set({ userSettings: settings, userSettingResponse: res?.message ? res?.message : 'Setting updated successfully' });
        } catch (error) {
            console.error(error);
        }
    },
    getUserSettings: async () => {
        try {
            const res = await httpRequest('GET', `${config.nodeApiUrl}/user/settings/list`);
            set({ userSettings: res.data.settings });
        } catch (error) {
        }
    },
    // ============================== DOCSNAP SETTINGS ===============================
    docsnapSettings: {},
    docsnapSettingResponse: '',
    submitDocsnapSettings: async (settings?: any) => {
        try {
            const res = await httpRequest('POST', `${config.nodeApiUrl}/idp/settings/submit`, {
                settings
            });
            set({ docsnapSettings: settings, docsnapSettingResponse: res?.message ? res?.message : 'Setting updated successfully' });
        } catch (error) {
            console.error(error);
        }
    },
    getDocsnapSettings: async () => {
        try {
            const res = await httpRequest('GET', `${config.nodeApiUrl}/idp/settings/list`);
            set({ docsnapSettings: res.data.settings });
            return res.data.settings;
        } catch (error) {
            console.error(error);
        }
    },
    // ============================== TENANT SETTINGS ===============================
    tenantSettings: {},
    tenantSettingResponse: '',
    selectedTenant: null,
    submitTenantSettings: async (settings?: any) => {
        if (!get().selectedTenant && !window.sessionStorage.getItem('selectedTenant')) {
            useToastStore.getState().error('Tenant not selected');
            return;
        }
        try {
            const res = await httpRequest('POST', `${config.nodeApiUrl}/tenant/settings/submit`, {
                settings,
                tenantId: !get().selectedTenant ? window.sessionStorage.getItem('selectedTenant') : get().selectedTenant
            });
            set({ tenantSettings: settings, tenantSettingResponse: res?.message ? res?.message : 'Setting updated successfully' });
        } catch (error) {
            console.error(error);
        }
    },
    getTenantSettings: async () => {
        try {
            let tenantId = get().selectedTenant ? get().selectedTenant : window.sessionStorage.getItem('selectedTenant');
            if (!tenantId) {
                let user: any = window.sessionStorage.getItem('user');
                user = JSON.parse(user);
                tenantId = user?.tenant?._id;
            }
            if (!tenantId) {
                useToastStore.getState().error('Tenant not selected');
                return;
            }
            const res = await httpRequest('GET', `${config.nodeApiUrl}/tenant/settings/list/${tenantId}`);
            if (res.data === null) {
                set({ tenantSettings: {} });
            }
            set({ tenantSettings: res?.data?.settings });
            return res?.data?.settings;
        } catch (error) {
            console.error(error);
        }
    },
    setSelectedTenant: async (tenant: any) => {
        window.sessionStorage.setItem('selectedTenant', tenant);
        const res = await httpRequest('GET', `${config.nodeApiUrl}/tenant/settings/list/${tenant}`);
        if (res.data === null) {
            set({ tenantSettings: {} });
        }
        set({ tenantSettings: res?.data?.settings });
        set({ selectedTenant: tenant });
    }
    // ============================== TENANT SETTINGS ===============================
}));
