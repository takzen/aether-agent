import type { Metadata } from "next";

export const metadata: Metadata = {
    title: "Privacy Policy | Aether",
    description: "Aether Agent privacy policy and data storage information.",
    robots: {
        index: false,
        follow: false,
    },
};

export default function PrivacyLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return <>{children}</>;
}
