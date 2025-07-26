import { User } from "@clove/database";
import { create } from "zustand";

interface UseAuthStore {
    user: User;
    accessToken: string;
    auth: boolean;
    setUser: (user: User) => void;
    setAccessToken: (token: string) => void;
    setAuth: (state: boolean) => void;
}

export const useAuthStore = create<UseAuthStore>((set) => ({
    user: {} as User,
    auth: false,
    accessToken: "",
    setUser: (user) => set({ user }),
    setAccessToken: (token) => set({ accessToken: token }),
    setAuth: (state) => set({ auth: state }),
}));
