"use client";
import { useState, useRef, useEffect } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { servicesData, type Product } from "@/data/homePageData";
import { cn } from "@/utils/cn";
import { scrollTriggerAnimations } from "@/utils/gsapAnimations";
import styles from "./ServiceSection.module.scss";
import Image from "next/image";
import { FaPlay } from "react-icons/fa";
import { BsCursorFill } from "react-icons/bs";
import { API_GetProducts } from "@/app/api/frontend_api";

// 註冊 ScrollTrigger 插件
if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger);
}

interface ServiceSectionProps {
  onVideoOpen: (videoUrl: string) => void;
}

const ServiceSection = ({ onVideoOpen }: ServiceSectionProps) => {
  const [activeIndex, setActiveIndex] = useState<number | null>(null);
  const [servicesList, setServicesList] = useState<Product[]>([]);
  const leftRef = useRef<HTMLDivElement>(null);
  const rightRef = useRef<HTMLDivElement>(null);

  const normalizeImageSrc = (src?: string) => {
    if (typeof src !== "string") return null;
    const trimmed = src.trim();
    return trimmed.length > 0 ? trimmed : null;
  };

  // 載入產品資料
  useEffect(() => {
    if (typeof window === "undefined") return;

    const fetchProducts = async () => {
      try {
        const response = await API_GetProducts();
        if (response?.success) {
          const items: any[] = Array.isArray(response.data)
            ? response.data
            : [];
          const allProducts: Product[] = items.map((p: any) => ({
            id: p.id,
            title: p.title,
            slug: p.slug,
            metaTitle: p.metaTitle ?? undefined,
            metaDescription: p.metaDescription ?? undefined,
            category: p.category ?? undefined,
            logo: p.logo ?? undefined,
            externalUrl: p.externalUrl ?? undefined,
            videoUrl: p.videoUrl ?? undefined,
            introImage: p.introImage ?? undefined,
            navOrder: typeof p.sortOrder === "number" ? p.sortOrder : undefined,
            isPublished: !!p.isPublished,
            isFeatured: false,
          }));
          const publishedProducts = allProducts
            .filter((product) => product.isPublished && product.isFeatured)
            .slice(0, 3)
            .sort((a, b) => (a.navOrder || 0) - (b.navOrder || 0));
          setServicesList(publishedProducts);
        } else if (response) {
          console.error(
            "取得產品資料失敗:",
            response?.error?.message || "未知錯誤"
          );
        }
      } catch (error) {
        console.error("取得產品資料時發生錯誤:", error);
      }
    };

    // 監聽產品資料更新事件
    const handleProductsUpdated = () => {
      // 改為直接重新呼叫 API，避免依賴 localStorage
      fetchProducts().catch(() => {});
    };

    fetchProducts();
    window.addEventListener("productsUpdated", handleProductsUpdated);
    return () => {
      window.removeEventListener("productsUpdated", handleProductsUpdated);
    };
  }, []);

  useEffect(() => {
    const leftElement = leftRef.current;
    const rightElement = rightRef.current;

    if (!leftElement || !rightElement) return;

    // 使用 GSAP ScrollTrigger 實現淡入動畫（更早觸發，更快完成）
    scrollTriggerAnimations.fadeInFromLeftOnScroll(leftElement, {
      start: "top 95%",
      end: "top 60%",
      once: true,
    });

    scrollTriggerAnimations.fadeInFromRightOnScroll(rightElement, {
      start: "top 95%",
      end: "top 60%",
      once: true,
    });

    return () => {
      // ScrollTrigger 會在組件卸載時自動清理
    };
  }, []);

  const handleArticleClick = (index: number, e: React.MouseEvent) => {
    const target = e.target as HTMLElement;
    if (target.closest(`.${styles.playbtn}`)) {
      return;
    }

    if (activeIndex === index) {
      setActiveIndex(null);
    } else {
      setActiveIndex(index);
    }
  };

  const handlePlayClick = (e: React.MouseEvent, videoUrl: string) => {
    e.stopPropagation();
    onVideoOpen(videoUrl);
  };

  return (
    <>
      <div
        id="service-section-wrapper"
        className={styles.serviceSectionWrapper}
      >
        <section className={styles.serviceSection}>
          <div ref={leftRef} className={styles.left}>
            <h2 className={styles.title}>SERVICES</h2>
            <p className={styles.byline}>for Blog-style Brand Sites</p>
            <p className={styles.description}>
              以部落格式架構為核心，提供簡約模板與模組化區塊；從內容發佈、分類到版面維護，
              都能在後台輕鬆完成，讓網站更新變成日常。
            </p>
            <a href="#" className={styles.link}>
              查看我們的服務
              <div className={styles.linkIconWrapper}>
                <svg
                  className={styles.linkIcon}
                  width="24"
                  height="24"
                  viewBox="0 0 67 65"
                  stroke="currentColor"
                  strokeWidth="2"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    d="M43.804 49.0942H39.772V47.9422C39.772 40.2622 43.74 35.7822 50.076 33.9262V33.2222C46.684 33.6702 42.844 33.9262 38.3 33.9262H4.89197V29.7022H38.3C42.844 29.7022 46.684 29.9582 50.076 30.4062V29.7022C43.74 27.8462 39.772 23.3662 39.772 15.6862V14.5342H43.804V15.4302C43.804 24.0702 49.564 30.2782 60.444 30.2782H61.212V33.3502H60.444C49.564 33.3502 43.804 39.6222 43.804 48.2622V49.0942Z"
                    fill="currentColor"
                  />
                </svg>
              </div>
            </a>
          </div>
          <div
            ref={rightRef}
            className={styles.right}
            id="service-section__right"
          >
            {(servicesList.length > 0 ? servicesList : servicesData).map(
              (service, index) => (
                <div
                  key={service.id}
                  className={cn(
                    styles.article,
                    activeIndex === index && styles.active,
                    activeIndex !== null &&
                      activeIndex !== index &&
                      styles.hidden
                  )}
                  onClick={(e) => handleArticleClick(index, e)}
                >
                  <div className={styles.articleContent}>
                    <div className={styles.imgtext}>
                      <div className={styles.articleThumbWrapper}>
                        {(() => {
                          const thumbSrc =
                            normalizeImageSrc(service.thumbImage) ||
                            normalizeImageSrc(service.logo) ||
                            normalizeImageSrc(service.heroImages?.[0]);
                          if (!thumbSrc) return null;
                          return (
                            <Image
                              src={thumbSrc}
                              alt={service.title}
                              width={300}
                              height={200}
                              className={styles.articleThumb}
                            />
                          );
                        })()}
                      </div>
                      <div className={styles.infoarea}>
                        <h3 className={styles.articleTitle}>{service.title}</h3>
                        <p className={styles.articleDescription}>
                          {service.metaDescription ||
                            service.heroSubtitle ||
                            ""}
                        </p>
                      </div>
                    </div>
                    {service.videoUrl && (
                      <button
                        className={cn(styles.playbtn)}
                        onClick={(e) =>
                          handlePlayClick(e, service.videoUrl || "")
                        }
                      >
                        <FaPlay />
                      </button>
                    )}
                    {!service.videoUrl && (
                      <a
                        className={cn(styles.playbtn)}
                        href={service.externalUrl ? service.externalUrl : `/${service.slug}`}
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        <BsCursorFill />
                      </a>
                    )}
                  </div>
                  <div className={styles.serviceimgWrapper}>
                    <div className={styles.serviceimg}>
                      <a
                        href={service.externalUrl ? service.externalUrl : `/${service.slug}`}
                        className={styles.servicepageLink}
                      >
                        深入了解{service.title}
                      </a>
                      {(() => {
                        const introSrc =
                          normalizeImageSrc(service.introImage) ||
                          normalizeImageSrc(service.heroImages?.[0]) ||
                          normalizeImageSrc(service.thumbImage) ||
                          normalizeImageSrc(service.logo);
                        if (!introSrc) return null;
                        return (
                          <Image
                            src={introSrc}
                            alt={service.title}
                            width={800}
                            height={600}
                          />
                        );
                      })()}
                    </div>
                  </div>
                </div>
              )
            )}
          </div>
        </section>
      </div>
    </>
  );
};

export default ServiceSection;
