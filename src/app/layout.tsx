import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { ClerkProvider } from '@clerk/nextjs'

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "ChiroNotes IA — AI-Assisted Chiropractic Documentation",
  description: "HIPAA-compliant AI SOAP note assistant for Iowa chiropractors. Voice-to-note in under 5 minutes.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <ClerkProvider>
      <html lang="en" className={`${inter.variable} h-full antialiased`}>
        <body className="min-h-full bg-gray-50">{children}</body>
      </html>
    </ClerkProvider>
  )
}
