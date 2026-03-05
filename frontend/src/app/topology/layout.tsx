import { ProtectedRoute } from "@/components/AuthWrapper";

export default function ProtectedLayout({ children }: { children: React.ReactNode }) {
    return <ProtectedRoute>{children}</ProtectedRoute>;
}
