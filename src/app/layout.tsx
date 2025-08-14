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
  title: "ویپانا بزرگترین مرکز خرید ایران",
  description: "ویپانا بزرگترین مرکز خرید ایران",
  icons: {
    icon: [
      {
        url: '/vipana.png',
        type: 'image/png',
        sizes: '32x32',
      },
      {
        url: '/vipana.png',
        type: 'image/png',
        sizes: '16x16',
      },
    ],
    apple: [
      {
        url: '/vipana.png',
        type: 'image/png',
        sizes: '180x180',
      },
    ],
    shortcut: '/vipana.png',
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="fa" dir="rtl">
      <head>
        <link href="https://fonts.googleapis.com/css2?family=Vazirmatn:wght@400;700&display=swap" rel="stylesheet" />
        <link rel="icon" type="image/png" href="/vipana.png" />
        <link rel="apple-touch-icon" sizes="180x180" href="/vipana.png" />
        <link rel="shortcut icon" type="image/png" href="/vipana.png" />
        <meta name="msapplication-TileImage" content="/vipana.png" />
      </head>
      <body className="font-sans bg-gray-50 min-h-screen">{children}</body>
    </html>
  );
}
