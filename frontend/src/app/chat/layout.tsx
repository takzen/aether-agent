import { ProtectedRoute, AuthWrapper } from "@/components/AuthWrapper";

export default function ProtectedLayout({ children }: { children: React.ReactNode }) {
    return (
        <AuthWrapper>
            <ProtectedRoute>{children}</ProtectedRoute>
        </AuthWrapper>
    );
}
