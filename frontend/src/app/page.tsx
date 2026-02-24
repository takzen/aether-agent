"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function Home() {
    const router = useRouter();

    useEffect(() => {
        router.replace("/chat");
    }, [router]);

    return (
        <div className="flex items-center justify-center h-screen bg-[#020202] text-white">
            <div className="flex flex-col items-center gap-4 animate-pulse">
                <div className="w-8 h-8 border-2 border-purple-500/50 border-t-purple-500 rounded-full animate-spin" />
                <span className="text-sm text-neutral-500 font-mono tracking-wider">
                    INITIALIZING AETHER...
                </span>
            </div>
        </div>
    );
}
