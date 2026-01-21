import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { SolanaProvider } from "@/components/SolanaProvider";

import { ThemeProvider } from "@/components/ThemeProvider";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });

export const metadata: Metadata = {
  title: "OtusFX | Private FX Trading on Solana",
  description: "Trade confidentially with encrypted positions. EUR, GBP, JPY pairs with dynamic leverage. Privacy-first FX protocol on Solana.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${inter.variable} min-h-screen antialiased bg-background selection:bg-accent selection:text-white`}>
        <ThemeProvider attribute="class" defaultTheme="dark" enableSystem disableTransitionOnChange>
          <SolanaProvider>
            {children}
          </SolanaProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
