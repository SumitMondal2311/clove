"use client";

import { useRouter } from "next/navigation";

export default function Page() {
    const router = useRouter();
    return (
        <div className="flex h-screen items-center justify-center">
            Clove - Manage Auth and Users with Ease
        </div>
    );
}
