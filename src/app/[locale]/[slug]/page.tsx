import type { Metadata } from "next";
import ClientPageBySlug from "./ClientPageBySlug";
import { prisma } from "@/lib/prisma";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>;
}): Promise<Metadata> {
  const { locale, slug } = await params;

  try {
    const [page, siteSettings] = await Promise.all([
      prisma.page.findFirst({
        where: {
          slug,
          // 僅取正式資料的頁面作為 SEO metadata
          demoWorkspaceId: "",
        },
        select: {
          title: true,
          metaTitle: true,
          metaTitleEn: true,
          metaDescription: true,
          metaDescriptionEn: true,
          isPublished: true,
        },
      }),
      prisma.siteSettings.findFirst({
        select: {
          siteName: true,
          siteNameEn: true,
        },
      }),
    ]);

    const isEn = locale === "en";
    const fallbackSiteName = (isEn ? siteSettings?.siteNameEn : siteSettings?.siteName)
      || siteSettings?.siteName
      || "Blogcraft";

    if (!page || !page.isPublished) {
      return {
        title: isEn ? `Page Not Found | ${fallbackSiteName}` : `找不到頁面 | ${fallbackSiteName}`,
        description: "",
        robots: { index: false, follow: false },
      };
    }

    // 依語系優先讀取對應欄位，再 fallback 至中文欄位
    const title = (isEn ? page.metaTitleEn : page.metaTitle)
      || page.metaTitle
      || page.title
      || fallbackSiteName;
    const description = (isEn ? page.metaDescriptionEn : page.metaDescription)
      || page.metaDescription
      || "";

    return {
      title,
      description,
      openGraph: {
        title,
        description,
        type: "website",
        locale: locale === "en" ? "en_US" : "zh_TW",
        siteName: fallbackSiteName,
        url: `/${locale}/${slug}`,
      },
      alternates: {
        canonical: `/${locale}/${slug}`,
      },
    };
  } catch {
    return {
      title: "Blogcraft",
      description: "",
    };
  }
}

export default function Page() {
  return <ClientPageBySlug />;
}
