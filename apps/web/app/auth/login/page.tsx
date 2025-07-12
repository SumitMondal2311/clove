import { LoginForm } from '@/components/login-form';
import { Metadata } from 'next';

export const metadata: Metadata = {
    title: 'Log in | Clove',
};

export default function () {
    return (
        <>
            <div>
                <h1 className="font-mono text-2xl">Welcome back!</h1>
                <p>Enter your credentials to access your account</p>
            </div>
            <LoginForm />
        </>
    );
}
