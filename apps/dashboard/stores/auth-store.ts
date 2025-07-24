import { create } from "zustand";

interface UseAuthStore {
    accessToken: string;
    auth: boolean;
    setAccessToken: (token: string) => void;
    setAuth: (state: boolean) => void;
}

export const useAuthStore = create<UseAuthStore>((set) => ({
    accessToken: "",
    auth: false,
    setAccessToken: (token) => set({ accessToken: token }),
    setAuth: (state) => set({ auth: state }),
}));
