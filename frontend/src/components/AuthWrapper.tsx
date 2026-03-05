"use client";

import React from "react";
import dynamic from "next/dynamic";

// Dynamically import ClerkProvider with SSR disabled
// This prevents Clerk JS from loading during build and speeds up landing page
const DynamicClerkProvider = dynamic(
    () => import("@clerk/nextjs").then((mod) => {
        // Wrap in a named component for next/dynamic compatibility
        const Wrapper = ({ children }: { children: React.ReactNode }) => (
            <mod.ClerkProvider>{children}</mod.ClerkProvider>
        );
        Wrapper.displayName = "DynamicClerkProvider";
        return Wrapper;
    }),
    { ssr: false }
);

export function AuthWrapper({ children }: { children: React.ReactNode }) {
    if (process.env.NEXT_PUBLIC_ENABLE_AUTH !== "true") {
        return <>{children}</>;
    }

    return <DynamicClerkProvider>{children}</DynamicClerkProvider>;
}

// Lazy ProtectedRoute — only loads Clerk components on client
const DynamicProtectedContent = dynamic(
    () => import("./ProtectedContent"),
    {
        ssr: false,
        loading: () => (
            <div className="min-h-screen bg-[#020202] flex items-center justify-center">
                <div className="w-6 h-6 border-2 border-purple-500/20 border-t-purple-500 rounded-full animate-spin" />
            </div>
        ),
    }
);

export function ProtectedRoute({ children }: { children: React.ReactNode }) {
    if (process.env.NEXT_PUBLIC_ENABLE_AUTH !== "true") {
        return <>{children}</>;
    }

    return <DynamicProtectedContent>{children}</DynamicProtectedContent>;
}
