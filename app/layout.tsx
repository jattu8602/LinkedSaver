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
  title: "LinkedSaver - Download LinkedIn Videos & Images High Quality",
  description: "Free and fast LinkedIn media downloader. Save LinkedIn videos, images, and carousels in 1080p/4k quality directly to your device. No login required.",
  keywords: ["linkedin downloader", "linkedin video saver", "download linkedin images", "linkedin carousel downloader", "save linkedin video", "linkedsaver"],
  icons: {
    icon: '/icon.svg',
  },
  openGraph: {
    title: "LinkedSaver - Best LinkedIn Media Downloader",
    description: "Download high-quality videos and photos from any LinkedIn post instantly. Support for multiple items and carousels.",
    url: 'https://linkedsaver.vercel.app',
    siteName: 'LinkedSaver',
    images: [
      {
        url: '/icon.svg',
        width: 800,
        height: 600,
      }
    ],
    locale: 'en_US',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: "LinkedSaver - Download LinkedIn Media",
    description: "The easiest way to save LinkedIn videos and images.",
  },
  robots: {
    index: true,
    follow: true,
  },
  verification: {
    google: 'ZttVdYTQVDMo0fsb_qg56UXGoYb5ikfWGxb3ySWDHWY',
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
