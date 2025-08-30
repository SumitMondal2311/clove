"use client";

import { Button } from "@/components/ui/button";
import { useVerifyEmail } from "@/hooks/use-verify-email";
import { Loader2 } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useEffect, useState } from "react";

function VerifyEmailContent() {
    const searchParams = useSearchParams();
    const [token] = useState<string | null>(() => searchParams.get("token"));
    const { mutate, error, isError, isPending } = useVerifyEmail();
    const router = useRouter();

    useEffect(() => {
        mutate(token || "");
    }, [token, mutate]);

    if (isPending) {
        return (
            <div className="flex h-screen flex-col items-center justify-center">
                <span className="animate-pulse text-lg">Verifying...</span>
            </div>
        );
    }

    if (isError) {
        return (
            <div className="flex h-screen items-center justify-center">
                <div className="flex flex-col items-center gap-4">
                    <span className="text-5xl">⚠️</span>
                    <span className="font-mono text-lg">{error.message}</span>
                    <Button onClick={() => router.push("/auth/login")} className="cursor-pointer">
                        Go to Login
                    </Button>
                </div>
            </div>
        );
    }
}

function VerifyEmailFallback() {
    return (
        <div className="flex h-screen items-center justify-center">
            <Loader2 className="animate-spin" />
        </div>
    );
}

export default function VerifyEmailPage() {
    return (
        <Suspense fallback={<VerifyEmailFallback />}>
            <VerifyEmailContent />
        </Suspense>
    );
}
