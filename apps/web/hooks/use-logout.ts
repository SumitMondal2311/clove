"use client";

import { logoutApi } from "@/lib/api";
import { authStore } from "@/store/auth.store";
import { useMutation } from "@tanstack/react-query";
import { AxiosError } from "axios";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

export const useLogout = () => {
    const router = useRouter();

    return useMutation({
        mutationFn: logoutApi,
        onSuccess: (response) => {
            const { message } = response.data;
            toast.success(message || "Logged out successfully");
            authStore.setState({ accessToken: null });
            router.push("/login");
        },
        onError: (error) => {
            if (error instanceof AxiosError) {
                toast.error(error.response?.data?.message || "Internal server error");
            } else {
                toast.error("Failed to log out");
            }
        },
    });
};
