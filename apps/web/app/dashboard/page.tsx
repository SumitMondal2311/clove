"use client";

import { LogoutButton } from "@/components/features/auth/logout-button";
import { userStore } from "@/store/user.store";

export default function DashboardPage() {
    const { user } = userStore();
    return (
        <div className="flex h-screen flex-col items-center justify-center">
            <span className="absolute left-8 top-8 font-mono text-2xl font-semibold">
                Dashboard
            </span>
            <LogoutButton />
            <span>Logout</span>
            <span>{user?.email || "email"}</span>
        </div>
    );
}
