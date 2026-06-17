import type { Metadata } from "next";
import { Noto_Sans } from "next/font/google";
import "./globals.css";
import "@fontsource/pretendard/400.css";
import "@fontsource/pretendard/500.css";
import "@fontsource/pretendard/600.css";
import "@fontsource/pretendard/700.css";
import StoreProvider from "./StoreProvider";
import { isLocale } from "@/lib/i18n";
import { ReactNode } from "react";
import { NextIntlClientProvider } from 'next-intl';
import { getMessages } from 'next-intl/server';
import AppLayoutRouter from '@/components/layout/AppLayoutRouter';
import ExtensionAttrSuppressor from '@/components/ExtensionAttrSuppressor';
import FontProvider from '@/components/layout/FontProvider';
import ContactSalesModal from '@/components/contact/ContactSalesModal';
import WebsiteAnalytics from '@/components/analytics/WebsiteAnalytics';
import { notFound } from "next/navigation";

const notoSans = Noto_Sans({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-noto-sans",
  display: "swap",
});

export const metadata: Metadata = {
  title: "아이피힌트",
  description: " 창작은 자유롭게, 침해는 단호하게",
  icons: {
    icon: "/icon.svg",
    shortcut: "/favicon.ico",
  },
    openGraph: {
    title: "아이피힌트",

    description:
      "창작은 자유롭게, 침해는 단호하게",

    url: "https://www.iphint.com",

    locale: "kr",

    type: "website",

    images: [
      {
        url: "https://www.iphint.com/preview-iphint.svg",
        width: 1200,
        height: 630,
        alt: "아이피힌트",
      },
    ],
    },
};

type Props = {
  children: ReactNode;
  params: Promise<{ locale: string }>;
};

export default async function RootLayout({
  children,
  params,
}: Props) {
  const { locale } = await params;

  if (!isLocale(locale)) {
    notFound();
  }

  const messages = await getMessages();

  return (
    <html lang={locale} suppressHydrationWarning className={notoSans.variable}>
      <body className="antialiased bg-white" suppressHydrationWarning>
        <ExtensionAttrSuppressor />
        <NextIntlClientProvider locale={locale} messages={messages}>
          <StoreProvider>
            <FontProvider />
            <WebsiteAnalytics />
            <AppLayoutRouter>{children}</AppLayoutRouter>
            <ContactSalesModal />
          </StoreProvider>
        </NextIntlClientProvider>
        
      </body>
    </html>
  );
}
