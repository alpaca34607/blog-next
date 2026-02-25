"use client";

import { useSearchParams } from "next/navigation";

import { useState, useEffect } from "react";

import { FiArrowLeft, FiEye } from "react-icons/fi";
import { FaDesktop } from "react-icons/fa";

import { ImMobile } from "react-icons/im";
import Link from "next/link";
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
import styles from "./PagePreview.module.scss";

import {
  API_GetPagesAdmin,
  API_GetPageSectionsAdmin,
} from "@/app/api/admin_api";

interface Page {
  id: string;
  title: string;
  slug: string;
  type?: "page" | "product";
  content?: string | null;
  metaTitle?: string | null;
  metaDescription?: string | null;
  isPublished: boolean;
  logo?: string | null;
  heroTitle?: string | null;
  heroSubtitle?: string | null;
  heroImages?: string[] | null;
}

interface Product extends Page {
  logo?: string;
  externalUrl?: string | null;
  category?: string | null;
}

interface Section {
  id: string;
  sectionType: string;
  title?: string | null;
  subtitle?: string | null;
  content?: string | null;
  sortOrder: number;
  settings?: Record<string, any> | null;
}

const PagePreview = () => {
  const searchParams = useSearchParams();
  const pageSlug = searchParams.get("slug") || "";

  const [pages, setPages] = useState<Page[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [isClient, setIsClient] = useState(false);
  const [loading, setLoading] = useState(true);
  const [isMobileView, setIsMobileView] = useState(false);

  useEffect(() => {
    setIsClient(true);

    const load = async () => {
      try {
        setLoading(true);

        const res = await API_GetPagesAdmin({
          limit: 2000,
        });

        if (res?.success && Array.isArray(res.data)) {
          const items: any[] = res.data as any[];
          setPages(items.filter((p) => p.type === "page"));
          setProducts(items.filter((p) => p.type === "product"));
        } else {
          setPages([]);
          setProducts([]);
        }
      } catch (e) {
        console.error("載入頁面/產品列表時發生錯誤:", e);
        setPages([]);
        setProducts([]);
      } finally {
        setLoading(false);
      }
    };

    load();
  }, []);

  // 後台更新事件：重新抓取 API
  useEffect(() => {
    if (!isClient) return;

    const reload = async () => {
      try {
        const res = await API_GetPagesAdmin({
          limit: 2000,
        });

        if (res?.success && Array.isArray(res.data)) {
          const items: any[] = res.data as any[];
          setPages(items.filter((p) => p.type === "page"));
          setProducts(items.filter((p) => p.type === "product"));
        }
      } catch {
        // 忽略錯誤
      }
    };

    window.addEventListener("pagesUpdated", reload);
    window.addEventListener("productsUpdated", reload);

    return () => {
      window.removeEventListener("pagesUpdated", reload);
      window.removeEventListener("productsUpdated", reload);
    };
  }, [isClient]);

  // 先從頁面找，再從產品找
  const page =
    pages.find((p) => p.slug === pageSlug) ||
    products.find((p) => p.slug === pageSlug);
  const isProduct = !!products.find((p) => p.slug === pageSlug);

  const [sections, setSections] = useState<Section[]>([]);

  // 當頁面或 slug 改變時，重新載入區塊資料（API）
  useEffect(() => {
    if (!page?.id) {
      setSections([]);
      return;
    }

    const loadSections = async () => {
      try {
        const res = await API_GetPageSectionsAdmin(page.id);

        if (res?.success && Array.isArray(res.data)) {
          setSections(res.data as any);
        } else {
          setSections([]);
        }
      } catch (e) {
        console.error("載入區塊資料時發生錯誤:", e);
        setSections([]);
      }
    };

    loadSections();
  }, [pageSlug, page?.id]);

  // 監聽自訂事件：重新抓取 API
  useEffect(() => {
    if (!page) return;

    const reload = async () => {
      try {
        const res = await API_GetPageSectionsAdmin(page.id);

        if (res?.success && Array.isArray(res.data)) {
          setSections(res.data as any);
        }
      } catch {
        // 忽略錯誤
      }
    };

    window.addEventListener("sectionsUpdated", reload);
    return () => window.removeEventListener("sectionsUpdated", reload);
  }, [page?.id]);

  const pageSections = sections
    .filter((s) => s.settings?.isVisible !== false)
    .sort((a, b) => (a.sortOrder ?? 0) - (b.sortOrder ?? 0));

  useEffect(() => {
    if (page) {
      document.title = page.metaTitle || page.title || "頁面預覽";
    }
  }, [page]);

  if (!page) {
    return (
      <div className={styles.previewContainer}>
        <div className={styles.header}>
          <Link
            href={isProduct ? "/admin/ProductsManager" : "/admin/PageManager"}
            className={styles.backButton}
          >
            <FiArrowLeft size={20} />
            <span> {isProduct ? "返回產品管理" : "返回頁面管理"}</span>
          </Link>
        </div>
        <div className={styles.errorState}>
          <p>找不到指定的頁面</p>
          <Link
            href={isProduct ? "/admin/ProductsManager" : "/admin/PageManager"}
            className={styles.backLink}
          >
            {isProduct ? "返回產品管理" : "返回頁面管理"}
          </Link>
        </div>
      </div>
    );
  }

  // 注意：page 尚未載入完成前（首次 render）可能為 undefined
  // 這裡的推導必須放在 page 存在之後，避免讀取 undefined.heroImages
  const pageHeroTitle = (page as any).heroTitle;
  const pageHeroSubtitle = (page as any).heroSubtitle;
  const heroImages = (page as any).heroImages;
  const hasPageHeroValues = Boolean(
    pageHeroTitle || pageHeroSubtitle || (heroImages && heroImages.length)
  );
  // 若 sections 本身有 hero，也允許渲染（但 page 的 hero 欄位優先）
  const heroSectionFromApi = pageSections.find((s) => s.sectionType === "hero");
  const shouldRenderHero = hasPageHeroValues || Boolean(heroSectionFromApi);

  const renderSection = (section: Section) => {
    const sectionForView = {
      title: section.title ?? undefined,
      subtitle: section.subtitle ?? undefined,
      content: section.content ?? undefined,
      settings: (section.settings ?? undefined) as any,
    };

    switch (section.sectionType) {
      case "hero":
        return (
          <HeroSection
            key={section.id}
            section={sectionForView}
            page={{
              logo: page.logo ?? undefined,
              heroTitle: (page as any).heroTitle ?? undefined,
              heroSubtitle: (page as any).heroSubtitle ?? undefined,
              heroImages: (page as any).heroImages ?? undefined,
            }}
          />
        );
      case "icon_features":
        return (
          <IconFeaturesSection key={section.id} section={sectionForView} />
        );
      case "image_text":
        return <ImageTextSection key={section.id} section={sectionForView} />;
      case "video_text":
        return <VideoTextSection key={section.id} section={sectionForView} />;
      case "cta":
        return <CTASection key={section.id} section={sectionForView} />;
      case "card_grid":
        return <CardGridSection key={section.id} section={sectionForView} />;
      case "content_block":
        return (
          <ContentBlockSection key={section.id} section={sectionForView} />
        );
      case "downloads":
        return <DownloadsSection key={section.id} section={sectionForView} />;
      case "gallery":
        return <GallerySection key={section.id} section={sectionForView} />;
      case "product_specs":
        return (
          <ProductSpecsSection key={section.id} section={sectionForView} />
        );
      case "table":
        return <TableSection key={section.id} section={sectionForView} />;
      case "timeline":
        return <TimelineSection key={section.id} section={sectionForView} />;
      default: // 其他類型的佔位符
        return (
          <div key={section.id} className={styles.sectionPlaceholder}>
            <div className={styles.sectionHeader}>
              <span className={styles.sectionType}>{section.sectionType}</span>
              {section.title && (
                <span className={styles.sectionTitle}> {section.title}</span>
              )}
            </div>
            <div className={styles.sectionContent}>
              <p>此區塊類型： {section.sectionType}</p>
              <p className={styles.sectionNote}>
                區塊內容渲染功能待實作，請參考提供的 section 組件進行整合
              </p>
            </div>
          </div>
        );
    }
  };

  if (!isClient || loading) {
    return (
      <div className={styles.previewContainer}>
        <div className={styles.emptyState}>載入中...</div>
      </div>
    );
  }

  if (!page) {
    return (
      <div className={styles.previewContainer}>
        <div className={styles.emptyState}>
          <p>找不到頁面</p>
          <Link
            href={isProduct ? "/admin/ProductsManager" : "/admin/PageManager"}
            className={styles.backButton}
          >
            <FiArrowLeft size={20} />
            <span> {isProduct ? "返回產品管理" : "返回頁面管理"}</span>
          </Link>
        </div>
      </div>
    );
  }

  const handleToggleMobileView = () => {
    setIsMobileView(!isMobileView);
  };

  return (
    <div className={styles.previewContainer}>
      {/* Header */}
      <div className={styles.header}>
        <Link
          href={`/admin/PageManager/${page.id}/blocks`}
          className={styles.backButton}
        >
          <FiArrowLeft size={20} />
          <span> {isProduct ? "返回產品管理" : "返回頁面管理"}</span>
        </Link>
        <div className={styles.headerActions}>
          <button
            className={`${styles.previewButton}
      ${isMobileView ? styles.previewButtonActive : ""} `}
            onClick={handleToggleMobileView}
            title={isMobileView ? "切換為桌面預覽" : "切換為手機預覽"}
          >
            <span>
              {" "}
              {isMobileView ? <FaDesktop size={16} /> : <ImMobile size={16} />}
            </span>
          </button>
          <Link
            href={`/zh/${page.slug}`}
            target="_blank"
            className={styles.previewButton}
          >
            <FiEye size={16} /> <span>前往前台頁面</span>
          </Link>
        </div>
      </div>
      {/* Page Info */}
      <div className={styles.pageInfo}>
        <h1 className={styles.pageTitle}> {page.title}- 頁面預覽</h1>
        <p className={styles.pageSubtitle}>拖放排序區塊，點擊編輯內容</p>
      </div>
      {/* Sections */}
      <div
        className={`${styles.sectionsContainer}
      ${isMobileView ? styles.sectionsContainerMobile : ""}

      `}
      >
        {shouldRenderHero && (
          <HeroSection
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
            page={{
              logo: page.logo ?? undefined,
              heroTitle: (page as any).heroTitle ?? undefined,
              heroSubtitle: (page as any).heroSubtitle ?? undefined,
              heroImages: (page as any).heroImages ?? undefined,
            }}
          />
        )}
        {pageSections.map((section) => renderSection(section))}
        {pageSections.length === 0 && (
          <div className={styles.emptyState}>
            <p>此頁面尚無區塊內容</p>
            <Link
              href={`/admin/PageManager/${page.id}

          /blocks`}
              className={styles.addBlockLink}
            >
              新增區塊
            </Link>
          </div>
        )}
      </div>
    </div>
  );
};

export default PagePreview;
