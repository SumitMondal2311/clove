import { create } from "zustand";

type User = {
    sessionId: string;
    id: string;
    primary: string;
    email: string;
    verified: string;
};

type UserStoreType = {
    user: User | null;
    setUser: (user: User) => void;
};

export const userStore = create<UserStoreType>((set) => ({
    user: null,
    setUser: (user) => set({ user }),
}));
