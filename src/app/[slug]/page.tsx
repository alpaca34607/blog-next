import type { Metadata } from "next";
import ClientPageBySlug from "./ClientPageBySlug";
import { prisma } from "@/lib/prisma";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;

  try {
    const [page, siteSettings] = await Promise.all([
      prisma.page.findUnique({
        where: { slug },
        select: {
          title: true,
          metaTitle: true,
          metaDescription: true,
          isPublished: true,
        },
      }),
      prisma.siteSettings.findFirst({
        select: {
          siteName: true,
        },
      }),
    ]);

    if (!page || !page.isPublished) {
      const fallbackSiteName = siteSettings?.siteName || "Watchsense";
      return {
        title: `找不到頁面 | ${fallbackSiteName}`,
        description: "",
        robots: { index: false, follow: false },
      };
    }

    const fallbackSiteName = siteSettings?.siteName || "Watchsense";
    const title = page.metaTitle || page.title || fallbackSiteName;
    const description = page.metaDescription || "";

    return {
      title,
      description,
      openGraph: {
        title,
        description,
        type: "website",
        locale: "zh_TW",
        siteName: fallbackSiteName,
        url: `/${slug}`,
      },
      alternates: {
        canonical: `/${slug}`,
      },
    };
  } catch {
    // 保守 fallback：避免 metadata 生成影響整頁 render
    return {
      title: "Watchsense",
      description: "",
    };
  }
}

export default function Page() {
  return <ClientPageBySlug />;
}
