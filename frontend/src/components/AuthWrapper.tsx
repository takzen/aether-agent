"use client";

import React from "react";
import dynamic from "next/dynamic";
import { usePathname } from "next/navigation";

// Marketing pages that DON'T need Clerk at all
const MARKETING_PATHS = ['/', '/about', '/news', '/guide', '/what-is-aether', '/privacy', '/terms'];

// Dynamically import ClerkProvider — no SSR, no build errors
const DynamicClerkProvider = dynamic(
    () => import("@clerk/nextjs").then((mod) => {
        const Wrapper = ({ children }: { children: React.ReactNode }) => (
            <mod.ClerkProvider>{children}</mod.ClerkProvider>
        );
        Wrapper.displayName = "DynamicClerkProvider";
        return Wrapper;
    }),
    { ssr: false }
);

export function AuthWrapper({ children }: { children: React.ReactNode }) {
    const pathname = usePathname();

    // Auth disabled entirely — skip everything
    if (process.env.NEXT_PUBLIC_ENABLE_AUTH !== "true") {
        return <>{children}</>;
    }

    // Marketing pages — skip Clerk completely, zero JS overhead
    const isMarketing = MARKETING_PATHS.some(p => pathname === p);
    if (isMarketing) {
        return <>{children}</>;
    }

    // App pages — load Clerk
    return <DynamicClerkProvider>{children}</DynamicClerkProvider>;
}

// Lazy ProtectedRoute
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
