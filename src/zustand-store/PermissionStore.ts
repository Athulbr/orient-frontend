import { create } from 'zustand';

interface PermissionStoreIF {
  permissions: string[];
  checkPermission: (permission: string) => boolean;
  setPermissions: (permissions: string[]) => void;
}

export const usePermissionStore = create<PermissionStoreIF>((set, get) => ({
  permissions: [],
  checkPermission: (permission: string) => {
    return get().permissions.includes(permission);
  },
  setPermissions: (permissions: string[]) => {
    set({ permissions });
  },
}));
