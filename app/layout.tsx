import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import Sidebar from "@/components/Sidebar";

// 1. Add the CSS variable mapping here:
const inter = Inter({ 
  subsets: ["latin"],
  variable: "--font-inter", 
});

export const metadata: Metadata = {
  title: "Aegis - Enterprise Security",
  description: "SecureLLM Chat Interface",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      {/* 2. Apply BOTH the variable and the font-sans class here */}
      <body className={`${inter.variable} font-sans antialiased`}>
        {/* 3. Removed 'font-sans' from here so it doesn't conflict */}
        <div className="flex h-screen bg-background overflow-hidden text-foreground">
          
          <Sidebar />

          <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
            {children}
          </div>

        </div>
      </body>
    </html>
  );
}