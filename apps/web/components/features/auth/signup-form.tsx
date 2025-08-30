"use client";

import { Button, buttonVariants } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useSignup } from "@/hooks/use-signup";
import { Loader2 } from "lucide-react";
import Link from "next/link";
import { FormEvent, useState } from "react";

export function SignupForm() {
    const [password, setPassword] = useState("");
    const [email, setEmail] = useState("");
    const { mutate, isPending } = useSignup();

    const handleSignup = async (e: FormEvent) => {
        e.preventDefault();
        mutate({
            password,
            email,
        });
    };

    return (
        <form onSubmit={handleSignup} className="flex flex-col gap-4">
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
                        Sign up
                    </>
                ) : (
                    "Sign up"
                )}
            </Button>
            <div className="flex items-center self-center text-sm">
                <p>Don't have an account?</p>
                <Link
                    href="/login"
                    className={buttonVariants({
                        variant: "link",
                    })}
                >
                    Log in
                </Link>
            </div>
        </form>
    );
}
