import { AuthFormContainer } from "@/components/auth-form-container";
import { SignupForm } from "@/components/forms/signup-form";

export default function Page() {
    return (
        <AuthFormContainer>
            <>
                <div>
                    <h1 className="font-mono text-2xl">Create an account</h1>
                    <p>Enter your credentials to create an account</p>
                </div>
                <SignupForm />
            </>
        </AuthFormContainer>
    );
}
