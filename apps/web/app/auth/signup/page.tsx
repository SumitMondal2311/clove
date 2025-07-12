import { SignupForm } from '@/components/signup-form';
import { Metadata } from 'next';

export const metadata: Metadata = {
    title: 'Sign up | Clove',
};

export default function () {
    return (
        <>
            <div>
                <h1 className="font-mono text-2xl">Create an account</h1>
                <p>Enter your credentials to create an account</p>
            </div>
            <SignupForm />
        </>
    );
}
