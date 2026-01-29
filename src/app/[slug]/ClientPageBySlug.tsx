"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Layout from "@/components/Frontend/Layout";
import CTASection from "@/components/public/sections/CTASection";
import CardGridSection from "@/components/public/sections/CardGridSection";
import ContentBlockSection from "@/components/public/sections/ContentBlockSection";
import DownloadsSection from "@/components/public/sections/DownloadsSection";
import GallerySection from "@/components/public/sections/GallerySection";
import HeroSection from "@/components/public/sections/HeroSection";
import IconFeaturesSection from "@/components/public/sections/IconFeaturesSection";
import ImageTextSection from "@/components/public/sections/ImageTextSection";
import VideoTextSection from "@/components/public/sections/VideoTextSection";
import ProductSpecsSection from "@/components/public/sections/ProductSpecsSection";
import TableSection from "@/components/public/sections/TableSection";
import TimelineSection from "@/components/public/sections/TimelineSection";
import { API_GetPageBySlug } from "@/app/api/public_api";

interface BasePage {
  id: string;
  title: string;
  slug: string;
  type: "page" | "product";
  content?: string | null;
  metaTitle?: string | null;
  metaDescription?: string | null;
  heroTitle?: string | null;
  heroSubtitle?: string | null;
  heroImages?: string[] | null;
  isPublished: boolean;
}

interface Product extends BasePage {
  logo?: string;
  externalUrl?: string | null;
  category?: string | null;
  sortOrder?: number | null;
}

interface Section {
  id: string;
  sectionType: string;
  title?: string;
  subtitle?: string;
  content?: string;
  sortOrder: number;
  settings?: Record<string, any>;
  [key: string]: any;
}

function normalizeSections(input: any[]): Section[] {
  // 將後端可能回傳的 null 統一轉為 undefined，避免前端 props 型別不相容
  return input.map((s) => ({
    ...s,
    title: s?.title ?? undefined,
    subtitle: s?.subtitle ?? undefined,
    content: s?.content ?? undefined,
    settings: s?.settings ?? undefined,
  }));
}

const ClientPageBySlug = () => {
  // 在 client component 中使用 useParams 取得動態路由參數，避免直接存取 params Promise
  const params = useParams<{ slug: string }>();
  const slug = params?.slug;
  const [isClient, setIsClient] = useState(false);
  const [page, setPage] = useState<BasePage | Product | undefined>(undefined);
  const [sections, setSections] = useState<Section[]>([]);
  const [loading, setLoading] = useState(true);

  // 僅在客戶端啟用 localStorage 相關操作
  useEffect(() => {
    setIsClient(true);
  }, []);

  // 根據 slug 讀取頁面 / 產品與區塊資料（改為呼叫 API，避免依賴 localStorage）
  useEffect(() => {
    if (!isClient || !slug) return;

    let cancelled = false;
    const load = async () => {
      try {
        setLoading(true);
        const res = await API_GetPageBySlug(slug);
        if (!res?.success || !res.data?.page) {
          setPage(undefined);
          setSections([]);
          return;
        }

        const nextPage = res.data.page as BasePage | Product;
        const nextSections = Array.isArray(res.data.sections)
          ? normalizeSections(res.data.sections as any[])
          : [];

        if (!nextPage.isPublished) {
          setPage(undefined);
          setSections([]);
          return;
        }

        if (!cancelled) {
          setPage(nextPage);
          setSections(
            nextSections
              .filter((s) => s.settings?.isVisible !== false)
              .sort((a, b) => (a.sortOrder ?? 0) - (b.sortOrder ?? 0))
          );
        }
      } catch (e) {
        console.error("載入頁面資料時發生錯誤:", e);
        if (!cancelled) {
          setPage(undefined);
          setSections([]);
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    load();
    return () => {
      cancelled = true;
    };
  }, [isClient, slug]);

  // 後台更新時可透過自訂事件觸發前台重新抓取（避免依賴 localStorage）
  useEffect(() => {
    if (!isClient || !slug) return;

    const reload = () => {
      API_GetPageBySlug(slug)
        .then((res) => {
          if (res?.success && res.data?.page) {
            const nextPage = res.data.page as BasePage | Product;
            const nextSections = Array.isArray(res.data.sections)
              ? normalizeSections(res.data.sections as any[])
              : [];
            setPage(nextPage);
            setSections(
              nextSections
                .filter((s) => s.settings?.isVisible !== false)
                .sort((a, b) => (a.sortOrder ?? 0) - (b.sortOrder ?? 0))
            );
          }
        })
        .catch(() => {});
    };

    window.addEventListener("pagesUpdated", reload);
    window.addEventListener("productsUpdated", reload);
    window.addEventListener("sectionsUpdated", reload);

    return () => {
      window.removeEventListener("pagesUpdated", reload);
      window.removeEventListener("productsUpdated", reload);
      window.removeEventListener("sectionsUpdated", reload);
    };
  }, [isClient, slug]);

  const renderSection = (section: Section) => {
    switch (section.sectionType) {
      case "hero":
        return (
          <HeroSection
            key={section.id}
            section={section}
            // 只把 HeroSection 需要的欄位傳下去（避免型別不相容）
            page={
              page
                ? {
                    logo: "logo" in page ? (page as any).logo : undefined,
                    heroTitle: (page as any).heroTitle ?? undefined,
                    heroSubtitle: (page as any).heroSubtitle ?? undefined,
                    heroImages: (page as any).heroImages ?? undefined,
                  }
                : undefined
            }
          />
        );
      case "icon_features":
        return <IconFeaturesSection key={section.id} section={section} />;
      case "image_text":
        return <ImageTextSection key={section.id} section={section} />;
      case "video_text":
        return <VideoTextSection key={section.id} section={section} />;
      case "cta":
        return <CTASection key={section.id} section={section} />;
      case "card_grid":
        return <CardGridSection key={section.id} section={section} />;
      case "content_block":
        return <ContentBlockSection key={section.id} section={section} />;
      case "downloads":
        return <DownloadsSection key={section.id} section={section} />;
      case "gallery":
        return <GallerySection key={section.id} section={section} />;
      case "product_specs":
        return <ProductSpecsSection key={section.id} section={section} />;
      case "table":
        return <TableSection key={section.id} section={section} />;
      case "timeline":
        return <TimelineSection key={section.id} section={section} />;
      default:
        return null;
    }
  };

  return (
    <Layout>
      {!isClient ? (
        <div style={{ padding: "4rem 1.5rem", textAlign: "center" }}>
          內容載入中…
        </div>
      ) : loading ? (
        <div style={{ padding: "4rem 1.5rem", textAlign: "center" }}>
          內容載入中…
        </div>
      ) : !page ? (
        <div
          style={{
            height: "100vh",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            padding: "4rem 1.5rem",
            textAlign: "center",
          }}
        >
          此頁面不存在或尚未發布
        </div>
      ) : (
        <>
          {(() => {
            const pageHeroTitle = (page as any).heroTitle;
            const pageHeroSubtitle = (page as any).heroSubtitle;
            const heroImages = (page as any).heroImages as
              | string[]
              | null
              | undefined;

            const hasPageHeroValues = Boolean(
              pageHeroTitle ||
                pageHeroSubtitle ||
                (heroImages && heroImages.length)
            );

            // 若 sections 本身有 hero，也允許渲染（但 page 的 hero 欄位優先）
            const heroSectionFromApi = sections.find(
              (s) => s.sectionType === "hero"
            );
            const shouldRenderHero =
              hasPageHeroValues || Boolean(heroSectionFromApi);

            return (
              <>
                {shouldRenderHero && (
                  <HeroSection
                    carouselSlideClassName="pageHero"
                    section={{
                      // page 欄位優先（避免 section hero 為空字串/空值時誤判）
                      title: pageHeroTitle ?? heroSectionFromApi?.title ?? undefined,
                      subtitle:
                        pageHeroSubtitle ?? heroSectionFromApi?.subtitle ?? undefined,
                      content: heroSectionFromApi?.content ?? undefined,
                      settings: {
                        ...(heroSectionFromApi?.settings ?? {}),
                        heroImages:
                          (heroImages && heroImages.length ? heroImages : undefined) ??
                          heroSectionFromApi?.settings?.heroImages ??
                          undefined,
                      },
                    }}
                    // 只把 HeroSection 需要的欄位傳下去（避免型別不相容）
                    page={{
                      logo: "logo" in page ? (page as any).logo : undefined,
                      heroTitle: (page as any).heroTitle ?? undefined,
                      heroSubtitle: (page as any).heroSubtitle ?? undefined,
                      heroImages: (page as any).heroImages ?? undefined,
                    }}
                  />
                )}

                {sections.map((section) => renderSection(section))}
              </>
            );
          })()}
        </>
      )}
    </Layout>
  );
};

export default ClientPageBySlug;

