import { apiClient } from "@/lib/axios";

export const signupApi = async (data: { email: string; password: string }) => {
    return apiClient.post("/auth/signup", data);
};

export const verifyEmailApi = async (token: string) => {
    return apiClient.post(`/auth/verify-email?token=${token}`);
};

export const refreshTokenApi = async () => {
    return apiClient.post("/auth/refresh-token");
};

export const loginApi = async (data: { email: string; password: string }) => {
    return apiClient.post("/auth/login", data);
};

export const logoutApi = async () => {
    return apiClient.post("/auth/logout");
};
