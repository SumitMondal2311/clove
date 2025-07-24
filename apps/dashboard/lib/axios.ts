import { refreshToken } from "@/features/api";
import { useAuthStore } from "@/stores/auth-store";
import axios from "axios";

const NEXT_PUBLIC_API_ORIGIN = process.env.NEXT_PUBLIC_API_ORIGIN;
if (!NEXT_PUBLIC_API_ORIGIN) {
    throw new Error("Invalid or missing NEXT_PUBLIC_API_ORIGIN env variable");
}

export const instance = axios.create({
    headers: {
        "Content-Type": "application/json",
    },
    baseURL: NEXT_PUBLIC_API_ORIGIN,
    withCredentials: true,
});

instance.interceptors.request.use((config) => {
    const accessToken = localStorage.getItem("__access_token__");
    if (accessToken) {
        config.headers.Authorization = `Bearer ${accessToken}`;
    }

    return config;
});

instance.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response) {
            return Promise.resolve({
                status: error.response.status,
                data: error.response.data,
            });
        }
        return Promise.reject(error);
    }
);

instance.interceptors.response.use(
    (response) => response,
    async (error) => {
        const { response, config: originalRequest } = error;
        const { accessToken } = useAuthStore.getState();

        if (response?.status === 401 && !accessToken && !originalRequest._retry) {
            originalRequest._retry = true;
            const { ok } = await refreshToken();
            if (ok && accessToken) {
                originalRequest.headers["authorization"] = `Bearer ${accessToken}`;

                return axios(originalRequest);
            }
        }

        return Promise.reject(error);
    }
);
