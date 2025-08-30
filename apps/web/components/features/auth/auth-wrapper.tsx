import { GoogleAuthButton } from "@/components/features/auth/google-auth-button";
import { Separator } from "@/components/ui/separator";
import Link from "next/link";
import React from "react";

const links = [
    { label: "Support", href: "#" },
    { label: "Terms", href: "#" },
    { label: "Privacy", href: "#" },
];

export const AuthWrapper = ({ children }: { children: React.ReactNode }) => {
    return (
        <div className="flex h-screen items-center px-8 md:px-0">
            <div className="md:w-100 mx-auto flex h-max w-96 flex-col gap-8 md:rounded-md md:border md:p-8 md:shadow-md">
                {children}
                <Separator />
                <GoogleAuthButton />
                <div className="flex items-center justify-center gap-4 text-sm">
                    {links.map((link, idx) => (
                        <div key={idx} className="flex gap-4">
                            <Link href={link.href} className="transition-all hover:opacity-60">
                                {link.label}
                            </Link>
                            {idx === links.length - 1 ? null : (
                                <span className="pointer-events-none">|</span>
                            )}
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};
