import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "ChiroNotes IA — AI-Assisted Chiropractic Documentation",
  description: "HIPAA-compliant AI SOAP note assistant for Iowa chiropractors. Voice-to-note in under 5 minutes.",
};

const DEMO_MODE = process.env.DEMO_MODE === 'true'

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const html = (
    <html lang="en" className={`${inter.variable} h-full antialiased`}>
      <body className="min-h-full bg-gray-50">{children}</body>
    </html>
  )

  if (DEMO_MODE) return html

  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const { ClerkProvider } = require('@clerk/nextjs')
  return <ClerkProvider>{html}</ClerkProvider>
}
