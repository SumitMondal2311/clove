"use client";

import { Loader2 } from "lucide-react";
import { notFound, useSearchParams } from "next/navigation";
import { Suspense, useState } from "react";

function EmailSentContent() {
    const searchParams = useSearchParams();
    const [type] = useState(() => searchParams.get("type"));

    if (type === "email-verification") {
        return (
            <div className="flex h-screen items-center justify-center">
                An verification link has been send to you email
            </div>
        );
    }

    if (type === "password-reset") {
        return (
            <div className="flex h-screen items-center justify-center">
                An reset link has been send to you email
            </div>
        );
    }

    return notFound();
}

function EmailSentFallback() {
    return (
        <div className="flex h-screen items-center justify-center">
            <Loader2 className="animate-spin" />
        </div>
    );
}

export default function EmailSentPage() {
    return (
        <Suspense fallback={<EmailSentFallback />}>
            <EmailSentContent />
        </Suspense>
    );
}
