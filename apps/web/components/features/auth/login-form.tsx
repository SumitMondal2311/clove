"use client";

import { Button, buttonVariants } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useLogin } from "@/hooks/use-login";

import { Loader2 } from "lucide-react";
import Link from "next/link";
import { FormEvent, useState } from "react";

export function LoginForm() {
    const [password, setPassword] = useState("");
    const [email, setEmail] = useState("");
    const { mutate, isPending } = useLogin();

    const handleLogin = async (e: FormEvent) => {
        e.preventDefault();
        mutate({
            password,
            email,
        });
    };

    return (
        <form onSubmit={handleLogin} className="flex flex-col gap-4">
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
                disabled={isPending || !email || !password}
                className="flex cursor-pointer gap-2"
            >
                {isPending ? (
                    <>
                        <Loader2 className="animate-spin" />
                        Log in
                    </>
                ) : (
                    "Log in"
                )}
            </Button>
            <div className="flex items-center self-center text-sm">
                <p>Already have an account?</p>
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
