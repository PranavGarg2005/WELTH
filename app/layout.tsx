import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import Header from "@/components/header";
import { ClerkProvider } from "@clerk/nextjs";
import { Toaster } from 'sonner'
const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "WELTH",
  description: "One stop finance platform",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ClerkProvider>
    <html lang="en">
      <body className={inter.className}>
        <Header/>
        <main className="min-h-screen">{children}</main>
        <Toaster richColors/>
        
        <footer className="bg-blue-50 py-12">
          <div className="container mx-auto px-4 text-center text-gray-600">
            <p>All rights are Reserved</p>
          </div>
        </footer>
      </body>
    </html>
    </ClerkProvider>
  );
}