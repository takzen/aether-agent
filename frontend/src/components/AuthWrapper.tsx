import React from "react";
import { ClerkProvider, SignIn, SignedIn, SignedOut } from "@clerk/nextjs";

export function AuthWrapper({ children }: { children: React.ReactNode }) {
    // Check if auth is enabled. Locally it will be undefined or false.
    // On Vercel, you need to set NEXT_PUBLIC_ENABLE_AUTH to "true".
    if (process.env.NEXT_PUBLIC_ENABLE_AUTH !== "true") {
        return <>{children}</>;
    }

    return <ClerkProvider>{children}</ClerkProvider>;
}

export function ProtectedRoute({ children }: { children: React.ReactNode }) {
    if (process.env.NEXT_PUBLIC_ENABLE_AUTH !== "true") {
        return <>{children}</>;
    }

    return (
        <>
            <SignedIn>{children}</SignedIn>
            <SignedOut>
                <div className="min-h-screen bg-[#020202] text-white flex flex-col items-center justify-center p-4 selection:bg-purple-500/30">
                    <div className="mb-8 text-center space-y-4">
                        <h1 className="text-3xl font-bold tracking-tight text-white mb-2">AETHER CLOUD</h1>
                        <p className="text-sm text-neutral-400 font-mono tracking-wider">SECURE CONNECTION REQUIRED</p>
                    </div>
                    {/* Dark theme overrides for Clerk SignIn component */}
                    <SignIn
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
            </SignedOut>
        </>
    );
}
