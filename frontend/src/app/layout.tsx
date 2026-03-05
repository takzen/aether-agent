import type { Metadata } from "next";
import { Inter, JetBrains_Mono } from "next/font/google";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: '--font-inter',
});

const jetbrainsMono = JetBrains_Mono({
  subsets: ["latin"],
  variable: '--font-mono',
});

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_FRONTEND_URL || 'https://aetheragent.pl'),
  title: "Aether | Premium Personal Intelligence",
  description: "Aether is a proactive, type-safe personal AI intelligence layer and autonomous agent architecture with long-term memory.",
  keywords: ["Autonomous Agent", "AI", "Personal Intelligence", "Second Brain", "LLM", "Hetzner", "Vercel", "RAG"],
  authors: [{ name: "Aether Team" }],
  robots: {
    index: true,
    follow: true,
  },
  openGraph: {
    title: "Aether | Premium Personal Intelligence",
    description: "The proactive, type-safe personal intelligence layer.",
    type: "website",
    locale: "en_US",
  },
  twitter: {
    card: "summary_large_image",
    title: "Aether | Premium Personal Intelligence",
    description: "The proactive, type-safe personal intelligence layer.",
  },
  icons: {
    icon: "/icon.svg",
  },
};

import { CommandProvider } from "@/context/CommandContext";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark" suppressHydrationWarning>
      <body className={`${inter.variable} ${jetbrainsMono.variable} font-sans antialiased selection:bg-primary/30 selection:text-primary`}>
        <CommandProvider>
          {children}
        </CommandProvider>
      </body>
    </html>
  );
}
