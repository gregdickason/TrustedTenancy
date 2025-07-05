import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "TrustedTenancy - Australian Property Management",
  description: "AI-powered property management platform for Australian rental properties",
  keywords: "property management, rental properties, landlord, tenant, Australia, real estate",
  authors: [{ name: "TrustedTenancy" }],
  creator: "TrustedTenancy",
  icons: {
    icon: [
      { url: "/favicon-16x16.png", sizes: "16x16", type: "image/png" },
      { url: "/favicon-32x32.png", sizes: "32x32", type: "image/png" },
    ],
    apple: "/images/logos/TrustedTenancy_64X64.png",
  },
  openGraph: {
    title: "TrustedTenancy - Australian Property Management",
    description: "AI-powered property management platform for Australian rental properties",
    url: "https://trustedtenancy.com.au",
    siteName: "TrustedTenancy",
    images: [
      {
        url: "/images/logos/TrustedTenancy_800h.png",
        width: 800,
        height: 400,
      },
    ],
    locale: "en_AU",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "TrustedTenancy - Australian Property Management",
    description: "AI-powered property management platform for Australian rental properties",
    images: ["/images/logos/TrustedTenancy_800h.png"],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        {children}
      </body>
    </html>
  );
}
