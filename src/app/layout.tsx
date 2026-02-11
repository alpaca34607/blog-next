import { ReduxProvider } from "@/store/provider";
import ScrollToTop from "@/components/Frontend/Components/ScrollToTop";
import "@/styles/globals.scss";
import type { Metadata } from "next";
import { prisma } from "@/lib/prisma";

export async function generateMetadata(): Promise<Metadata> {
  // 全站預設 SEO：優先使用 SiteSettings 的 metaTitle/metaDescription；若未填寫則使用既有文案作為 fallback
  const settings = await prisma.siteSettings
    .findFirst({
      select: {
        siteName: true,
        metaTitle: true,
        metaDescription: true,
      },
    })
    .catch(() => null);

  const siteName = settings?.siteName || "布創 BLOGCRAFT";
  const fallbackTitle = `${siteName} | 部落格式形象網頁方案`;
  const fallbackDescription =
    "專為客戶打造部落格式形象網頁，主打模板化快速上線、簡約版面、後台輕鬆管理與便利維護，讓內容更新像寫部落格一樣自然。";

  const metaTitle =
    (typeof settings?.metaTitle === "string" && settings.metaTitle.trim()) ||
    fallbackTitle;
  const metaDescription =
    (typeof settings?.metaDescription === "string" &&
      settings.metaDescription.trim()) ||
    fallbackDescription;

  return {
    title: {
      default: metaTitle,
      template: `%s | ${siteName}`,
    },
    description: metaDescription,
    keywords: ["形象網站", "部落格網站", "網站模板", "內容管理", "後台管理", "簡約設計"],
    openGraph: {
      title: metaTitle,
      description: metaDescription,
      type: "website",
      locale: "zh_TW",
      siteName,
    },
  };
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="zh-TW">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link
          rel="preconnect"
          href="https://fonts.gstatic.com"
          crossOrigin="anonymous"
        />
        <link
          href="https://fonts.googleapis.com/css2?family=Cinzel:wght@400;700&family=Inter:wght@300;400;600&family=Noto+Sans+TC:wght@300;500;700&family=Orbitron:wght@400;500;600;700;800;900&family=Titillium+Web:ital,wght@0,200;0,300;0,400;0,600;0,700;0,900;1,200;1,300;1,400;1,600;1,700&family=Keania+One&family=Monoton&family=Montserrat:wght@300;400;500;600;700&family=Playfair+Display:wght@400;700&family=Audiowide&family=Bruno+Ace&family=Bungee+Outline&display=swap"
          rel="stylesheet"
        />
        <link
          rel="stylesheet"
          href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/7.0.1/css/all.min.css"
          crossOrigin="anonymous"
          referrerPolicy="no-referrer"
        />
      </head>
      <body>
        <ReduxProvider>
          <ScrollToTop />
          {children}
        </ReduxProvider>
      </body>
    </html>
  );
}
