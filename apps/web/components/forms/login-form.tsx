"use client";

import { login } from "@/features/api";
import { Loader2 } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import React from "react";
import { Button, buttonVariants } from "../ui/button";
import { Input } from "../ui/input";

export function LoginForm() {
    const [loading, setLoading] = React.useState(false);
    const [email, setEmail] = React.useState("");
    const [password, setPassword] = React.useState("");
    const router = useRouter();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        const ok = await login({
            email,
            password,
        });
        if (ok) {
            setPassword("");
            setEmail("");
            router.replace("/");
        }
        setLoading(false);
    };

    return (
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <Input
                type="email"
                placeholder="Email"
                autoFocus
                onChange={(e) => setEmail(e.target.value)}
                value={email}
            />
            <Input
                type="password"
                placeholder="Password"
                onChange={(e) => setPassword(e.target.value)}
                value={password}
            />
            <Button
                type="submit"
                disabled={loading || !email || !password}
                className="flex cursor-pointer gap-2"
            >
                {loading ? (
                    <>
                        <Loader2 className="animate-spin" />
                        Log in
                    </>
                ) : (
                    "Log in"
                )}
            </Button>
            <div className="flex items-center self-center text-sm">
                <p>Don't have an account?</p>
                <Link
                    href="/signup"
                    className={buttonVariants({
                        variant: "link",
                    })}
                >
                    Sign up
                </Link>
            </div>
        </form>
    );
}
