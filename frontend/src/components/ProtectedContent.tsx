"use client";

import React from "react";
import { SignIn, SignedIn, SignedOut } from "@clerk/nextjs";

export default function ProtectedContent({ children }: { children: React.ReactNode }) {
    return (
        <>
            <SignedIn>{children}</SignedIn>
            <SignedOut>
                <div className="min-h-screen bg-[#020202] text-white flex flex-col items-center justify-center p-4 selection:bg-purple-500/30">
                    <div className="mb-8 text-center space-y-4">
                        <h1 className="text-3xl font-bold tracking-tight text-white mb-2">AETHER CLOUD</h1>
                        <p className="text-sm text-neutral-400 font-mono tracking-wider">SECURE CONNECTION REQUIRED</p>
                    </div>
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
