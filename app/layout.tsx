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
  metadataBase: new URL('https://linkedsaver.vercel.app'),
  title: {
    default: "LinkedSaver - #1 LinkedIn Video & Image Downloader (1080p/4K)",
    template: "%s | LinkedSaver"
  },
  description: "The best free LinkedIn Downloader. Download LinkedIn videos, images, photos, carousels, and gifs in high quality (1080p, 4k). Works on mobile & desktop. No login required.",
  keywords: [
    "linkedin downloader",
    "linkedin video downloader",
    "save linkedin video",
    "download linkedin video",
    "linkedin image downloader",
    "download linkedin photos",
    "linkedin carousel downloader",
    "linkedin post downloader",
    "save linkedin images",
    "linkedin media saver",
    "download linkedin gif",
    "linkedin video saver 1080p",
    "linkedin 4k video downloader",
    "free linkedin downloader",
    "linkedin downloader online",
    "linkedin private video downloader",
    "linkedsaver",
    "linkedin to mp4",
    "linkedin to jpg"
  ],
  authors: [{ name: "LinkedSaver" }],
  creator: "LinkedSaver",
  publisher: "LinkedSaver",
  icons: {
    icon: '/icon.svg',
    shortcut: '/icon.svg',
    apple: '/icon.svg',
  },
  openGraph: {
    title: "LinkedSaver - Best Free LinkedIn Media Downloader",
    description: "Download high-quality videos and photos from any LinkedIn post instantly. Support for multiple images, videos, and carousels. Fast, Free, No Login.",
    url: 'https://linkedsaver.vercel.app',
    siteName: 'LinkedSaver',
    images: [
      {
        url: '/icon.svg',
        width: 800,
        height: 600,
        alt: 'LinkedSaver Logo',
      }
    ],
    locale: 'en_US',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: "LinkedSaver - Download LinkedIn Videos & Images",
    description: "The easiest way to save LinkedIn videos and images in HD. Free and unlimited.",
    images: ['/icon.svg'], // Ideally successful social cards use a larger 1200x630 png, but reusing icon for now
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
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
