import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { LanguageProvider } from "@/contexts/LanguageContext";
import AnalyticsProvider from "@/components/AnalyticsProvider";
import AuthContext, { AuthProvider } from "@/contexts/AuthContext";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Indian Consular Services | Consulate General of India, Johannesburg",
  description:
    "Official consular services for Indian nationals and foreign citizens seeking Indian services. Passport, Visa, OCI, and Document Attestation services in Johannesburg, South Africa.",
  keywords:
    "Indian consular services, passport, visa, OCI, document attestation, Johannesburg, South Africa, Indian embassy",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <AnalyticsProvider>
          <LanguageProvider>
            <AuthProvider>{children}</AuthProvider>
          </LanguageProvider>
        </AnalyticsProvider>
      </body>
    </html>
  );
}
