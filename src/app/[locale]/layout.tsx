import type { Metadata } from "next";
import { NextIntlClientProvider, hasLocale } from "next-intl";
import { getMessages } from "next-intl/server";
import { notFound } from "next/navigation";
import { routing } from "@/routing";
import { AppLoadingProvider } from "@/contexts/AppLoadingContext";
import { prisma } from "@/lib/prisma";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const isEn = locale === "en";

  const settings = await prisma.siteSettings
    .findFirst({
      select: {
        siteName: true,
        siteNameEn: true,
        metaTitle: true,
        metaTitleEn: true,
        metaDescription: true,
        metaDescriptionEn: true,
      },
    })
    .catch(() => null);

  const siteName = (isEn ? settings?.siteNameEn : settings?.siteName)
    || settings?.siteName
    || "布創 BLOGCRAFT";

  const fallbackTitle = isEn
    ? `${siteName} | Blog Website Solution`
    : `${siteName} | 部落格式形象網頁方案`;
  const fallbackDescription = isEn
    ? "Custom blog-style websites built for clients — template-based fast launch, clean layout, easy backend management."
    : "專為客戶打造部落格式形象網頁，主打模板化快速上線、簡約版面、後台輕鬆管理與便利維護，讓內容更新像寫部落格一樣自然。";

  const rawTitle = isEn ? settings?.metaTitleEn : settings?.metaTitle;
  const rawDesc = isEn ? settings?.metaDescriptionEn : settings?.metaDescription;

  const metaTitle =
    (typeof rawTitle === "string" && rawTitle.trim()) || fallbackTitle;
  const metaDescription =
    (typeof rawDesc === "string" && rawDesc.trim()) || fallbackDescription;

  return {
    title: {
      // absolute 讓此層標題不套用根 layout 的 template，避免雙重後綴
      absolute: metaTitle,
      // template 仍對子頁面（slug pages）生效
      template: `%s | ${siteName}`,
    },
    description: metaDescription,
    openGraph: {
      title: metaTitle,
      description: metaDescription,
      type: "website",
      locale: isEn ? "en_US" : "zh_TW",
      siteName,
    },
  };
}

interface LocaleLayoutProps {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}

export default async function LocaleLayout({
  children,
  params,
}: LocaleLayoutProps) {
  const { locale } = await params;

  if (!hasLocale(routing.locales, locale)) {
    notFound();
  }

  const messages = await getMessages({ locale });

  return (
    // 必須明確傳入 locale，否則 useLocale() 在 Client Component 中無法取得正確語系
    <NextIntlClientProvider locale={locale} messages={messages}>
      <AppLoadingProvider>{children}</AppLoadingProvider>
    </NextIntlClientProvider>
  );
}
