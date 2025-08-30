import { AUTH_ROUTES } from "@/configs/all-routes";
import { authStore } from "@/store/auth.store";
import axios, { AxiosError, AxiosRequestConfig } from "axios";
import { refreshTokenApi } from "./api";

export const apiClient = axios.create({
    baseURL: process.env.NEXT_PUBLIC_API_URL,
    withCredentials: true,
    headers: {
        "Content-Type": "application/json",
    },
});

apiClient.interceptors.request.use((config) => {
    const { accessToken } = authStore.getState();
    if (accessToken) {
        config.headers.Authorization = `Bearer ${accessToken}`;
    }
    return config;
});

let refreshing = false;
let failedQueue: Array<{
    resolve: (value: unknown) => void;
    reject: (reason?: any) => void;
}> = [];

const processQueue = (error: AxiosError | null, token = null) => {
    failedQueue.forEach((prom) => {
        if (error) {
            prom.reject(error);
        } else {
            prom.resolve(token);
        }
    });

    failedQueue = [];
};

apiClient.interceptors.response.use(
    (response) => response,
    async (error: AxiosError) => {
        const originalRequest = error.config as AxiosRequestConfig & {
            _retry: boolean;
        };

        if (
            error.response?.status !== 401 ||
            originalRequest._retry ||
            AUTH_ROUTES.some((route) => originalRequest.url?.includes(route))
        ) {
            return Promise.reject(error);
        }

        if (refreshing) {
            return new Promise((resolve, reject) => {
                failedQueue.push({ resolve, reject });
            }).then(() => {
                const { accessToken } = authStore.getState();
                const headers = originalRequest.headers;

                if (headers) {
                    headers.Authorization = `Bearer ${accessToken}`;
                }

                return apiClient(originalRequest);
            });
        }

        originalRequest._retry = true;
        refreshing = true;

        try {
            const { data } = await refreshTokenApi();
            const { accessToken } = data;
            authStore.setState({ accessToken });
            processQueue(null, accessToken);
            const headers = originalRequest.headers;

            if (headers) {
                headers.Authorization = `Bearer ${accessToken}`;
            }

            return apiClient(originalRequest);
        } catch (refreshError) {
            processQueue(refreshError as AxiosError);
            authStore.getState().logout();
            return Promise.reject(refreshError);
        } finally {
            refreshing = false;
        }
    }
);
