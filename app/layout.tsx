import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
// 1. Import the new component
import ServerWakeUp from "@/components/ServerWakeUp";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Aegis SecureLLM",
  description: "Enterprise Prompt Injection Firewall",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={inter.className}>
        {/* 2. Wrap the children in the WakeUp component! */}
        <ServerWakeUp>
          {children}
        </ServerWakeUp>
      </body>
    </html>
  );
}