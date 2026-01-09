import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });

export const metadata: Metadata = {
  title: "SynFX | The FX Layer for Base",
  description: "Trade EUR, PLN, and GBP with 25x leverage on Base L2.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body className={`${inter.variable} min-h-screen antialiased bg-background selection:bg-accent selection:text-white`}>
        {children}
      </body>
    </html>
  );
}
