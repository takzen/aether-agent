"use client";

import React, { lazy, Suspense } from "react";

// Lazy-load Clerk so it doesn't block landing page rendering
const LazyClerkProvider = lazy(() =>
    import("@clerk/nextjs").then((mod) => ({ default: mod.ClerkProvider }))
);

export function AuthWrapper({ children }: { children: React.ReactNode }) {
    if (process.env.NEXT_PUBLIC_ENABLE_AUTH !== "true") {
        return <>{children}</>;
    }

    return (
        <Suspense fallback={<>{children}</>}>
            <LazyClerkProvider>{children}</LazyClerkProvider>
        </Suspense>
    );
}

export function ProtectedRoute({ children }: { children: React.ReactNode }) {
    if (process.env.NEXT_PUBLIC_ENABLE_AUTH !== "true") {
        return <>{children}</>;
    }

    // Dynamic import for protected route components
    const ClerkComponents = React.lazy(() =>
        import("@clerk/nextjs").then((mod) => ({
            default: ({ children: c }: { children: React.ReactNode }) => (
                <>
                    <mod.SignedIn>{c}</mod.SignedIn>
                    <mod.SignedOut>
                        <div className="min-h-screen bg-[#020202] text-white flex flex-col items-center justify-center p-4 selection:bg-purple-500/30">
                            <div className="mb-8 text-center space-y-4">
                                <h1 className="text-3xl font-bold tracking-tight text-white mb-2">AETHER CLOUD</h1>
                                <p className="text-sm text-neutral-400 font-mono tracking-wider">SECURE CONNECTION REQUIRED</p>
                            </div>
                            <mod.SignIn
                                routing="hash"
                                appearance={{
                                    elements: {
                                        card: "bg-neutral-900 border border-white/10 shadow-2xl rounded-xl",
                                        headerTitle: "text-white",
                                        headerSubtitle: "text-neutral-400",
                                        socialButtonsBlockButton: "bg-black/50 border border-white/5 hover:bg-white/5 text-white",
                                        formButtonPrimary: "bg-white text-black hover:bg-neutral-200",
                                        formFieldLabel: "text-neutral-300",
                                        formFieldInput: "bg-black/50 border-white/10 text-white",
                                        footer: "hidden",
                                        footerAction: "hidden",
                                        footerActionText: "hidden",
                                        footerActionLink: "hidden",
                                    }
                                }}
                            />
                        </div>
                    </mod.SignedOut>
                </>
            ),
        }))
    );

    return (
        <Suspense fallback={
            <div className="min-h-screen bg-[#020202] flex items-center justify-center">
                <div className="w-6 h-6 border-2 border-purple-500/20 border-t-purple-500 rounded-full animate-spin" />
            </div>
        }>
            <ClerkComponents>{children}</ClerkComponents>
        </Suspense>
    );
}
