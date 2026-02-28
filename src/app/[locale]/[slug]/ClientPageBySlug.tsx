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
import { useTranslations } from "next-intl";
import { useDemoUuid } from "@/hooks/useDemoUuid";

interface BasePage {
  id: string;
  title: string;
  titleEn?: string | null;
  slug: string;
  type: "page" | "product";
  content?: string | null;
  metaTitle?: string | null;
  metaDescription?: string | null;
  heroTitle?: string | null;
  heroTitleEn?: string | null;
  heroSubtitle?: string | null;
  heroSubtitleEn?: string | null;
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
  return input.map((s) => ({
    ...s,
    title: s?.title ?? undefined,
    titleEn: s?.titleEn ?? undefined,
    subtitle: s?.subtitle ?? undefined,
    subtitleEn: s?.subtitleEn ?? undefined,
    content: s?.content ?? undefined,
    settings: s?.settings ?? undefined,
  }));
}

const ClientPageBySlug = () => {
  const params = useParams<{ locale: string; slug: string }>();
  const slug = params?.slug;
  const demoUuid = useDemoUuid();
  const t = useTranslations("common");
  const [isClient, setIsClient] = useState(false);
  const [page, setPage] = useState<BasePage | Product | undefined>(undefined);
  const [sections, setSections] = useState<Section[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setIsClient(true);
  }, []);

  useEffect(() => {
    if (!isClient || !slug) return;

    let cancelled = false;
    const load = async () => {
      try {
        setLoading(true);
        const res = await API_GetPageBySlug(slug, demoUuid);
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
  }, [isClient, slug, demoUuid]);

  useEffect(() => {
    if (!isClient || !slug) return;

    const reload = () => {
      API_GetPageBySlug(slug, demoUuid)
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
  }, [isClient, slug, demoUuid]);

  const renderSection = (section: Section) => {
    switch (section.sectionType) {
      case "hero":
        return (
          <HeroSection
            key={section.id}
            section={section}
            page={
              page
                ? {
                    logo: "logo" in page ? (page as Product).logo : undefined,
                    heroTitle: page.heroTitle ?? undefined,
                    heroTitleEn: page.heroTitleEn ?? undefined,
                    heroSubtitle: page.heroSubtitle ?? undefined,
                    heroSubtitleEn: page.heroSubtitleEn ?? undefined,
                    heroImages: page.heroImages ?? undefined,
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
          {t("loading")}
        </div>
      ) : loading ? (
        <div style={{ padding: "4rem 1.5rem", textAlign: "center" }}>
          {t("loading")}
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
          {t("notFound")}
        </div>
      ) : (
        <>
          {(() => {
            const pageHeroTitle = page.heroTitle;
            const pageHeroSubtitle = page.heroSubtitle;
            const heroImages = page.heroImages;

            const hasPageHeroValues = Boolean(
              pageHeroTitle ||
                pageHeroSubtitle ||
                (heroImages && heroImages.length)
            );

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
                      title: pageHeroTitle ?? heroSectionFromApi?.title ?? undefined,
                      titleEn: page.heroTitleEn ?? heroSectionFromApi?.titleEn ?? undefined,
                      subtitle:
                        pageHeroSubtitle ?? heroSectionFromApi?.subtitle ?? undefined,
                      subtitleEn: page.heroSubtitleEn ?? heroSectionFromApi?.subtitleEn ?? undefined,
                      content: heroSectionFromApi?.content ?? undefined,
                      settings: {
                        ...(heroSectionFromApi?.settings ?? {}),
                        heroImages:
                          (heroImages && heroImages.length ? heroImages : undefined) ??
                          heroSectionFromApi?.settings?.heroImages ??
                          undefined,
                      },
                    }}
                    page={{
                      logo: "logo" in page ? (page as Product).logo : undefined,
                      heroTitle: page.heroTitle ?? undefined,
                      heroTitleEn: page.heroTitleEn ?? undefined,
                      heroSubtitle: page.heroSubtitle ?? undefined,
                      heroSubtitleEn: page.heroSubtitleEn ?? undefined,
                      heroImages: page.heroImages ?? undefined,
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
