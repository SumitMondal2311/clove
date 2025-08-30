import { meApi } from "@/lib/api";
import { userStore } from "@/store/user.store";
import { useMutation } from "@tanstack/react-query";

export const useMe = () => {
    return useMutation({
        mutationFn: meApi,
        onSuccess: (response) => {
            const { user } = response.data;
            userStore.setState({ user });
        },
    });
};
