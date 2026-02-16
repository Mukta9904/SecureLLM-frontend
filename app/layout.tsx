import type { Metadata } from "next";
import { Inter } from "next/font/google"; // Using Inter for that "Vercel" look
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

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
      <body className={inter.className}>{children}</body>
    </html>
  );
}