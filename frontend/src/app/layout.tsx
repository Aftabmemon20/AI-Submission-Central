// FILE: frontend/src/app/layout.tsx

import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { ClerkProvider, SignInButton, SignedIn, SignedOut, UserButton } from '@clerk/nextjs';
import { Button } from "@/components/ui/button";
import Link from "next/link";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "AI Submissions Central",
  description: "The Future of Hackathon Judging",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <ClerkProvider>
      <html lang="en" className="dark">
        <body className={inter.className}>
          <header className="p-4 border-b bg-black text-white sticky top-0 z-50">
            <div className="container mx-auto flex justify-between items-center">
              <Link href="/" className="text-2xl font-bold tracking-tight">A.S.C.</Link>
              <div className="flex items-center gap-4">
                <SignedIn>
                  <UserButton afterSignOutUrl="/" />
                </SignedIn>
                <SignedOut>
                  <Button asChild className="bg-blue-600 hover:bg-blue-700 text-white">
                    <SignInButton mode="modal" />
                  </Button>
                </SignedOut>
              </div>
            </div>
          </header>
          <main className="bg-black text-white">{children}</main>
        </body>
      </html>
    </ClerkProvider>
  );
}