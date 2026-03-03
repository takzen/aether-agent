import { clerkMiddleware } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export default function middleware(request: NextRequest, event: any) {
    // Jeśli autoryzacja jest WYŁĄCZONA na poziomie Vercel lub lokalnie, omijamy middleware
    if (process.env.NEXT_PUBLIC_ENABLE_AUTH !== "true") {
        return NextResponse.next();
    }

    // Włączamy Clerka. Ze względu na budowę paczki @clerk/nextjs, musimy opakować go we wrapper
    const clerk = clerkMiddleware();
    return clerk(request, event);
}

export const config = {
    matcher: [
        // Skip Next.js internals and all static files, unless found in search params
        '/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)',
        // Always run for API routes
        '/(api|trpc)(.*)',
    ],
};
