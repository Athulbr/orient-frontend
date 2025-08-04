import { create } from 'zustand';

interface UseViewRecordGlobalStoreIF {
    refresh: number;
    updateRefresh: () => void;
}

export const useViewRecordGlobalStore = create<UseViewRecordGlobalStoreIF>(set => ({
    refresh: 1,
    updateRefresh: () => {
        set(state => ({
            refresh: state.refresh + 1
        }));
    }
}));
