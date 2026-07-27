import type { Metadata } from "next";
import localFont from "next/font/local";
import "./globals.css";

const geistSans = localFont({
  src: "./fonts/GeistVF.woff",
  variable: "--font-geist-sans",
  weight: "100 900",
});

export const metadata: Metadata = {
  title: "LogiLink | B2B Supply Chain Admin Dashboard",
  description: "Advanced B2B logistics tracking, inventory management, and retailer supply chain orchestration portal.",
};

import { ClerkProvider } from "@clerk/nextjs";
import { DashboardProvider } from "@/context/DashboardContext";
import DashboardLayout from "@/components/DashboardLayout";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${geistSans.className} antialiased bg-[#0b0f19]`}
      >
        <ClerkProvider>
          <DashboardProvider>
            <DashboardLayout>{children}</DashboardLayout>
          </DashboardProvider>
        </ClerkProvider>
      </body>
    </html>
  );
}
