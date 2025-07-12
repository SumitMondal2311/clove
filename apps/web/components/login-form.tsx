'use client';

import { Button, buttonVariants } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Loader2 } from 'lucide-react';
import Link from 'next/link';
import React from 'react';

export function LoginForm() {
    const [loading, setLoading] = React.useState(false);
    const [email, setEmail] = React.useState('');
    const [password, setPassword] = React.useState('');

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setTimeout(() => {
            setLoading(false);
        }, 2000);
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
                    'Log in'
                )}
            </Button>
            <div className="flex items-center self-center text-sm">
                <p>Already have an account?</p>
                <Link
                    href="/auth/signup"
                    className={buttonVariants({
                        variant: 'link',
                    })}
                >
                    Sign up
                </Link>
            </div>
        </form>
    );
}
