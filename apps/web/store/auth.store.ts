import { create } from "zustand";

type AuthStoreType = {
    accessToken: string | null;
    setAccessToken: (token: string | null) => void;
    logout: () => void;
};

export const authStore = create<AuthStoreType>((set) => ({
    accessToken: null,
    setAccessToken: (token) => set({ accessToken: token }),
    logout: () => {
        set({ accessToken: null });
    },
}));
