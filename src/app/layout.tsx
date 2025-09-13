import type { Metadata } from "next";
import { Vazirmatn } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "@/contexts/AuthContext";

const vazir = Vazirmatn({
  variable: "--font-vazir",
  subsets: ["arabic", "latin"],
  weight: ["100", "200", "300", "400", "500", "600", "700", "800", "900"],
});

export const metadata: Metadata = {
  title: "ویپانا ارایه دهنده سرویس های هوش مصنوعی",
  description: "ویپانا، پلتفرم پیشرو در ارائه خدمات هوش مصنوعی با راهکارهای نوین برای بهینه‌سازی کسب‌وکارها. هوش مصنوعی قدرتمند،  برای رشد و افزایش بهره‌وری شما",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="fa" dir="rtl" suppressHydrationWarning>
      <body
        className={`${vazir.variable} font-vazir antialiased`}
      >
        <AuthProvider>
          {children}
        </AuthProvider>
      </body>
    </html>
  );
}
