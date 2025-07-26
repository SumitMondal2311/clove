import { AuthFormContainer } from "@/components/auth-form-container";
import { LoginForm } from "@/components/forms/login-form";

export default function Page() {
    return (
        <AuthFormContainer>
            <>
                <div>
                    <h1 className="font-mono text-2xl">Welcome back!</h1>
                    <p>Enter your credentials to access your account</p>
                </div>
                <LoginForm />
            </>
        </AuthFormContainer>
    );
}
