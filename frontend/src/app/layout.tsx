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
  title: "Aether | Personal AI Intelligence",
  description: "The proactive, type-safe personal intelligence layer.",
  icons: {
    icon: "/icon.svg",
  },
};

import { CommandProvider } from "@/context/CommandContext";
import { AuthWrapper } from "@/components/AuthWrapper";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark" suppressHydrationWarning>
      <body className={`${inter.variable} ${jetbrainsMono.variable} font-sans antialiased selection:bg-primary/30 selection:text-primary`}>
        <CommandProvider>
          <AuthWrapper>
            {children}
          </AuthWrapper>
        </CommandProvider>
      </body>
    </html>
  );
}
