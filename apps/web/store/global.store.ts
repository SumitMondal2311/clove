import { create } from "zustand";

type GlobalStoreType = {
    loading: boolean;
    setLoading: (state: boolean) => void;
};

export const globalStore = create<GlobalStoreType>((set) => ({
    loading: false,
    setLoading: (state) => set({ loading: state }),
}));
