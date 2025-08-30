import { SignupForm } from "@/components/features/auth/signup-form";
import { AuthWrapper } from "@/components/features/auth/auth-wrapper";
import { Metadata } from "next";

export const metadata: Metadata = {
    title: "Sign up | clove/auth",
};

export default function SignupPage() {
    return (
        <AuthWrapper>
            <div>
                <h1 className="font-mono text-2xl">Create an account</h1>
                <p>Enter your credentials to create an account</p>
            </div>
            <SignupForm />
        </AuthWrapper>
    );
}
