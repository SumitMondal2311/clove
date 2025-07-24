import { instance } from "@/lib/axios";

export async function signup(formData: { email: string; password: string }) {
    const { status, data } = await instance.post("/auth/signup", formData);
    const ok = status === 201;
    if (ok) {
        localStorage.setItem("__user__", data?.user);
        localStorage.setItem("__access_token__", data?.accessToken);
        localStorage.setItem("__auth__", "true");
    }
    return {
        ok,
        data,
    };
}
export async function login(formData: { email: string; password: string }) {
    const { status, data } = await instance.post("/auth/login", formData);
    const ok = status === 200;
    if (ok) {
        localStorage.setItem("__user__", data?.user);
        localStorage.setItem("__access_token__", data?.accessToken);
        localStorage.setItem("__auth__", "true");
    }
    return {
        ok,
        data,
    };
}

export async function logout() {
    const { status, data } = await instance.post("/auth/logout");
    const ok = status === 200;
    if (ok) {
        localStorage.removeItem("__auth__");
        localStorage.removeItem("__access_token__");
        localStorage.removeItem("__user__");
    }
    return {
        ok,
        data,
    };
}

export async function refreshToken() {
    const { status, data } = await instance.post("/auth/refresh-token");
    const ok = status === 200;
    if (ok) {
        localStorage.setItem("__access_token__", data?.accessToken);
    }
    return {
        ok,
        data,
    };
}
