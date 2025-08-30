import { LoginForm } from "@/components/features/auth/login-form";
import { AuthWrapper } from "@/components/features/auth/auth-wrapper";
import { Metadata } from "next";

export const metadata: Metadata = {
    title: "Log in | clove/auth",
};

export default function LoginPage() {
    return (
        <AuthWrapper>
            <div>
                <h1 className="font-mono text-2xl">Welcome back!</h1>
                <p>Enter your credentials to access your account</p>
            </div>
            <LoginForm />
        </AuthWrapper>
    );
}
