"use client";
import { useState, useEffect } from "react";
import { getSectionStyle } from "@/utils/sectionStyles";
import styles from "./HeroSection.module.scss";
import { isRichTextEmpty } from "@/utils/common";

interface HeroSectionProps {
  className?: string;
  carouselSlideClassName?: string;
  /** 小螢幕輪播圖片改用 contain（避免裁切） */
  contain?: boolean;
  section: {
    title?: string;
    subtitle?: string;
    content?: string;
    settings?: {
      backgroundColor?: string;
      backgroundImage?: string;
      image?: string;
      heroImage?: string;
      heroImages?: string[];
    };
  };
  page?: {
    logo?: string;
    heroTitle?: string | null;
    heroSubtitle?: string | null;
    heroImages?: string[] | null;
  };
}

const HeroSection = ({
  section,
  page,
  className,
  carouselSlideClassName,
  contain,
}: HeroSectionProps) => {
  const title = section.title ?? page?.heroTitle ?? undefined;
  const subtitle = section.subtitle ?? page?.heroSubtitle ?? undefined;

  // 檢查是否有輪播圖片
  const carouselImages =
    section.settings?.heroImages && section.settings.heroImages.length > 0
      ? section.settings.heroImages
      : page?.heroImages && page.heroImages.length > 0
      ? page.heroImages
      : null;

  // 如果沒有輪播圖片，使用原本的單張圖片邏輯
  const bgImage = carouselImages
    ? null
    : section.settings?.backgroundImage ||
      section.settings?.image ||
      section.settings?.heroImage;

  // 輪播相關狀態
  const [currentIndex, setCurrentIndex] = useState(0);

  // 自動輪播效果
  useEffect(() => {
    if (!carouselImages || carouselImages.length <= 1) return;

    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % carouselImages.length);
    }, 5000); // 每 5 秒切換

    return () => clearInterval(interval);
  }, [carouselImages]);

  // 使用共用的背景樣式工具函數（僅在非輪播模式下使用）
  const { style: sectionStyle, className: backgroundImageClass } =
    getSectionStyle({
      backgroundColor: section.settings?.backgroundColor,
      backgroundImage: bgImage || undefined,
      defaultBgColor: "#f5f5f5",
    });

  return (
    <section
      className={`${styles.heroSection} ${className || ""} ${
        carouselImages
          ? styles.hasCarousel
          : backgroundImageClass
          ? styles.hasBgImage
          : ""
      } ${contain ? styles.containInBanner : ""}`}
      style={
        carouselImages
          ? { backgroundColor: section.settings?.backgroundColor || "#f5f5f5" }
          : sectionStyle || undefined
      }
    >
      {/* 輪播圖片 */}
      {carouselImages && (
        <div className={styles.carouselContainer}>
          {carouselImages.map((img, index) => (
            <div
              key={index}
              className={`${styles.carouselSlide} ${
                index === currentIndex ? styles.active : ""
              } ${carouselSlideClassName || ""}`}
              style={{ backgroundImage: `url(${img})` }}
            />
          ))}
          {/* 輪播指示器 */}
          {carouselImages.length > 1 && (
            <div className={styles.carouselIndicators}>
              {carouselImages.map((_, index) => (
                <button
                  key={index}
                  className={`${styles.indicator} ${
                    index === currentIndex ? styles.active : ""
                  }`}
                  onClick={() => setCurrentIndex(index)}
                  aria-label={`切換到圖片 ${index + 1}`}
                />
              ))}
            </div>
          )}
        </div>
      )}

      {/* 單張背景圖片的遮罩 */}
      {bgImage && <div className={styles.overlay} />}

      <div className={styles.content}>
        {/* {page?.logo && (
          <img src={page.logo} alt="logo" className={styles.logo} />
        )} */}
        {subtitle && <p className={styles.subtitle}>{subtitle}</p>}
        {title && <h1 className={styles.title}>{title}</h1>}
        {section.content && !isRichTextEmpty(section.content) && (
          <p className={styles.description}>{section.content}</p>
        )}
      </div>
    </section>
  );
};

export default HeroSection;
