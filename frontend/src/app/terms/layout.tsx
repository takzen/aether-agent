import type { Metadata } from "next";

export const metadata: Metadata = {
    title: "Terms of Service | Aether",
    description: "Aether Agent operational terms and responsibilities.",
    robots: {
        index: false,
        follow: false,
    },
};

export default function TermsLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return <>{children}</>;
}
