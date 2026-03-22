import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

// 1. Import BOTH components
import ServerWakeUp from "@/components/ServerWakeUp";
import Sidebar from "@/components/Sidebar";

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
        {/* The WakeUp component wraps everything */}
        <ServerWakeUp>
          
          {/* Your actual App Layout is restored here */}
          <div className="flex h-screen w-full bg-background overflow-hidden">
            
            {/* The Sidebar is back! */}
            <Sidebar />
            
            {/* The main chat window */}
            <main className="flex-1 flex flex-col h-full overflow-hidden">
              {children}
            </main>
            
          </div>

        </ServerWakeUp>
      </body>
    </html>
  );
}