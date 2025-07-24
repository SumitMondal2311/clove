"use client";

import { signup } from "@/features/api";
import { Loader2 } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import React from "react";
import { toast } from "sonner";
import { Button, buttonVariants } from "../ui/button";
import { Input } from "../ui/input";

export function SignupForm() {
    const [loading, setLoading] = React.useState(false);
    const [email, setEmail] = React.useState("");
    const [password, setPassword] = React.useState("");
    const router = useRouter();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        const { ok, data } = await signup({
            email,
            password,
        });
        if (ok) {
            toast.success(data?.message);
            setEmail("");
            setPassword("");
            router.replace("/");
        } else {
            toast.error(data?.message);
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
                        Sign up
                    </>
                ) : (
                    "Sign up"
                )}
            </Button>
            <div className="flex items-center self-center text-sm">
                <p>Have an account?</p>
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
