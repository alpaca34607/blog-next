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
      const fallbackSiteName = siteSettings?.siteName || "Blogcraft";
      return {
        title: `找不到頁面 | ${fallbackSiteName}`,
        description: "",
        robots: { index: false, follow: false },
      };
    }

    const fallbackSiteName = siteSettings?.siteName || "Blogcraft";
    const title = page.metaTitle || page.title || fallbackSiteName;
    const description = page.metaDescription || "";

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
