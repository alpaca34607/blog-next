import { ReduxProvider } from "@/store/provider";
import ScrollToTop from "@/components/Frontend/Components/ScrollToTop";
import "@/styles/globals.scss";
import type { Metadata } from "next";

// 根層級僅提供最基本的 fallback，語系相關的 SEO 由 [locale]/layout.tsx 處理
export const metadata: Metadata = {
  title: {
    default: "布創 BLOGCRAFT",
    template: "%s | 布創 BLOGCRAFT",
  },
  description: "專為客戶打造部落格式形象網頁，主打模板化快速上線、簡約版面、後台輕鬆管理與便利維護。",
};

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
