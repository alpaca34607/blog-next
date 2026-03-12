import type { Metadata } from "next";
import ClientPageBySlug from "./ClientPageBySlug";
import type { BasePage, Product, Section } from "./ClientPageBySlug";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

// 從PRISMA選擇要帶給前端頁面的資料欄位
const pageSelect = {
  id: true,
  title: true,
  titleEn: true,
  slug: true,
  type: true,
  content: true,
  metaTitle: true,
  metaTitleEn: true,
  metaDescription: true,
  metaDescriptionEn: true,
  isPublished: true,
  logo: true,
  externalUrl: true,
  category: true,
  categoryEn: true,
  sortOrder: true,
  introImage: true,
  introImageEn: true,
  heroTitle: true,
  heroTitleEn: true,
  heroSubtitle: true,
  heroSubtitleEn: true,
  heroImages: true,
} as const;

const sectionSelect = {
  id: true,
  sectionType: true,
  title: true,
  titleEn: true,
  subtitle: true,
  subtitleEn: true,
  content: true,
  contentEn: true,
  sortOrder: true,
  settings: true,
} as const;

function getSearchParamValue(value?: string | string[]): string | undefined {
  if (Array.isArray(value)) {
    return value[0]?.trim() || undefined;
  }
  return value?.trim() || undefined;
}

function normalizePageForClient(page: any): BasePage | Product | undefined {
  if (!page || !page.isPublished) {
    return undefined;
  }

  return {
    ...page,
    type: page.type === "product" ? "product" : "page",
    titleEn: page.titleEn ?? undefined,
    content: page.content ?? undefined,
    metaTitle: page.metaTitle ?? undefined,
    metaTitleEn: page.metaTitleEn ?? undefined,
    metaDescription: page.metaDescription ?? undefined,
    metaDescriptionEn: page.metaDescriptionEn ?? undefined,
    logo: page.logo ?? undefined,
    externalUrl: page.externalUrl ?? undefined,
    category: page.category ?? undefined,
    sortOrder: page.sortOrder ?? undefined,
    heroTitle: page.heroTitle ?? undefined,
    heroTitleEn: page.heroTitleEn ?? undefined,
    heroSubtitle: page.heroSubtitle ?? undefined,
    heroSubtitleEn: page.heroSubtitleEn ?? undefined,
    heroImages: Array.isArray(page.heroImages)
      ? page.heroImages.filter((item: unknown): item is string => typeof item === "string")
      : undefined,
  };
}

function normalizeSectionsForClient(sections: any[]): Section[] {
  return sections.map((section) => ({
    ...section,
    title: section.title ?? undefined,
    titleEn: section.titleEn ?? undefined,
    subtitle: section.subtitle ?? undefined,
    subtitleEn: section.subtitleEn ?? undefined,
    content: section.content ?? undefined,
    contentEn: section.contentEn ?? undefined,
    settings:
      section.settings
      && typeof section.settings === "object"
      && !Array.isArray(section.settings)
        ? section.settings
        : undefined,
  }));
}

async function getPageData(slug: string, demoUuid?: string) {
  let page = null;

  if (demoUuid) {
    page = await prisma.page.findUnique({
      where: { slug_demoWorkspaceId: { slug, demoWorkspaceId: demoUuid } },
      select: pageSelect,
    });
  }

  if (!page) {
    page = await prisma.page.findUnique({
      where: { slug_demoWorkspaceId: { slug, demoWorkspaceId: "" } },
      select: pageSelect,
    });
  }

  if (!page || !page.isPublished) {
    return {
      page: undefined,
      sections: [],
    };
  }

  const sections = await prisma.section.findMany({
    where: { pageId: page.id },
    orderBy: { sortOrder: "asc" },
    select: sectionSelect,
  });

  return { page, sections };
}

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

export default async function Page({
  params,
  searchParams,
}: {
  params: Promise<{ locale: string; slug: string }>;
  searchParams: Promise<{ UUID?: string | string[]; uuid?: string | string[] }>;
}) {
  const { slug } = await params;
  const resolvedSearchParams = await searchParams;
  const demoUuid =
    getSearchParamValue(resolvedSearchParams.UUID)
    || getSearchParamValue(resolvedSearchParams.uuid);
  const { page, sections } = await getPageData(slug, demoUuid);
  const initialPage = normalizePageForClient(page);
  const initialSections = normalizeSectionsForClient(sections);

  return (
    <ClientPageBySlug
      initialSlug={slug}
      initialDemoUuid={demoUuid}
      initialPage={initialPage}
      initialSections={initialSections}
    />
  );
}
