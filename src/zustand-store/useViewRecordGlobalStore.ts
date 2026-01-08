import { create } from 'zustand';

interface UseGlobalVariableStoreIF {
    refresh: number;
    updateRefresh: () => void;
}

export const useGlobalVariableStore = create<UseGlobalVariableStoreIF>(set => ({
    refresh: 1,
    updateRefresh: () => {
        set(state => ({
            refresh: state.refresh + 1
        }));
    }
}));
