import { LogoutButton } from "@/components/features/auth/logout-button";

export default function DashboardPage() {
    return (
        <div className="flex h-screen flex-col items-center justify-center">
            <span className="absolute left-8 top-8 font-mono text-2xl font-semibold">
                Dashboard
            </span>
            <LogoutButton />
            <span>Logout</span>
        </div>
    );
}
