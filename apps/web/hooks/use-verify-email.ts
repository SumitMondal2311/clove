"use client";

import { verifyEmailApi } from "@/lib/api";
import { authStore } from "@/store/auth.store";
import { useMutation } from "@tanstack/react-query";
import { AxiosError } from "axios";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

export const useVerifyEmail = () => {
    const router = useRouter();

    return useMutation({
        mutationFn: verifyEmailApi,
        onSuccess: (response) => {
            const { accessToken, message } = response.data;
            toast.success(message || "Email verified successfully");
            authStore.setState({ accessToken });
            router.push("/dashboard");
        },
        onError: (error) => {
            if (error instanceof AxiosError) {
                toast.error(error.response?.data?.message || "Internal server error");
            } else {
                toast.error("Failed to verify email");
            }
        },
    });
};
