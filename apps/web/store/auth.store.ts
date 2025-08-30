import { create } from "zustand";
import { userStore } from "./user.store";

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
        userStore.setState({ user: null });
    },
}));
