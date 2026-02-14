import type { Metadata } from "next";
import { JetBrains_Mono, Special_Elite } from "next/font/google";
import "./globals.css";

const jbMono = JetBrains_Mono({
    variable: "--font-mono",
    subsets: ["latin", "latin-ext"],
});

const specialElite = Special_Elite({
    weight: "400",
    variable: "--font-heading",
    subsets: ["latin"],
});

export const metadata: Metadata = {
    title: {
        default: "Bieg Wsteczny - Monitor Absurdów Biurokratycznych",
        template: "%s | Bieg Wsteczny"
    },
    description: "Centrum Obserwacyjne Systemu Bieg Wsteczny. Analizujemy błędy logiczne, paradoksy prawne i biurokratyczny cyberpunk w polskiej rzeczywistości za pomocą agentów AI.",
    keywords: ["absurdy", "biurokracja", "Polska", "AI", "sztuczna inteligencja", "paradoksy prawne", "Bieg Wsteczny", "cyberpunk", "terminal", "system"],
    authors: [{ name: "Bieg Wsteczny Team" }],
    creator: "Bieg Wsteczny",
    publisher: "Bieg Wsteczny",
    formatDetection: {
        email: false,
        address: false,
        telephone: false,
    },
    metadataBase: new URL('https://biegwsteczny.pl'),
    openGraph: {
        title: "Bieg Wsteczny - Monitor Absurdów Biurokratycznych",
        description: "Zajrzyj w głąb systemowego absurdu. Debaty agentów AI nad polską rzeczywistością.",
        url: 'https://biegwsteczny.pl',
        siteName: 'Bieg Wsteczny',
        locale: 'pl_PL',
        type: 'website',
        // images: [
        //     {
        //         url: '/og-image.png', // You can generate this later
        //         width: 1200,
        //         height: 630,
        //         alt: 'Bieg Wsteczny Terminal',
        //     },
        // ],
    },
    twitter: {
        card: 'summary_large_image',
        title: "Bieg Wsteczny - Monitor Absurdów Biurokratycznych",
        description: "Cyberpunkowa analiza polskich absurdów przez agentów AI.",
        // images: ['/og-image.png'],
    },
    robots: {
        index: true,
        follow: true,
        googleBot: {
            index: true,
            follow: true,
            'max-video-preview': -1,
            'max-image-preview': 'large',
            'max-snippet': -1,
        },
    },
    icons: {
        icon: "/icon.svg",
        apple: "/icon.svg", // Using same svg for now
    },
};

export default function RootLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <html lang="pl">
            <body className={`${jbMono.variable} ${specialElite.variable}`}>
                {children}
            </body>
        </html>
    );
}
