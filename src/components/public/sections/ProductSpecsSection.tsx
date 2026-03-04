"use client";
import { useState, useEffect } from "react";
import { FiChevronLeft, FiChevronRight } from "react-icons/fi";
import { getSectionStyle } from "@/utils/sectionStyles";
import styles from "./ProductSpecsSection.module.scss";
import { useLocale } from "next-intl";

interface ProductSpecsSectionProps {
  section: {
    title?: string;
    titleEn?: string;
    subtitle?: string;
    subtitleEn?: string;
    settings?: {
      backgroundColor?: string;
      backgroundImage?: string;
      templateVariant?: string;
      images?: string[];
      specs?: SpecItem[];
    };
    images?: string[]; // 支援直接的 images 欄位
  };
}

interface SpecItem {
  name: string;
  nameEn: string;
  value: string;
  valueEn: string;
}

const ProductSpecsSection = ({ section }: ProductSpecsSectionProps) => {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const locale = useLocale();
  const isEn = locale === "en";
  const title = (isEn ? section.titleEn : section.title) || section.title;
  const subtitle = (isEn ? section.subtitleEn : section.subtitle) || section.subtitle;
  // 使用共用的背景樣式工具函數
  const { style: sectionStyle, className: backgroundImageClass } =
    getSectionStyle({
      backgroundColor: section.settings?.backgroundColor,
      backgroundImage: section.settings?.backgroundImage,
    });

  // 支援多種資料來源：settings.images 或直接的 images 欄位
  const images = section.settings?.images || section.images || [];
  const specs = section.settings?.specs || [];

  // 確保 currentImageIndex 不會超出範圍
  useEffect(() => {
    if (images.length > 0 && currentImageIndex >= images.length) {
      setCurrentImageIndex(0);
    }
  }, [images.length, currentImageIndex]);

  const nextImage = () => {
    if (images.length > 0) {
      setCurrentImageIndex((prev) => (prev + 1) % images.length);
    }
  };

  const prevImage = () => {
    if (images.length > 0) {
      setCurrentImageIndex(
        (prev) => (prev - 1 + images.length) % images.length
      );
    }
  };

  return (
    <section
      className={`${styles.productSpecsSection} ${
        backgroundImageClass ? styles.hasBgImage : ""
      }`}
      style={sectionStyle}
    >
      <div className={styles.container}>
        {title && (
          <div className={styles.header}>
            <h2 className={styles.title}>{title}</h2>
            {subtitle && (
              <p className={styles.subtitle}>{subtitle}</p>
            )}
          </div>
        )}

        <div className={styles.contentGrid}>
          {/* 圖片輪播 */}
          {images.length > 0 ? (
            <div className={styles.imageCarousel}>
              <div className={styles.imageWrapper}>
                <img
                  src={images[currentImageIndex]}
                  alt={`${isEn ? "Product Image" : "產品圖片"} ${currentImageIndex + 1}`}
                  className={styles.image}
                />
              </div>
              {images.length > 1 && (
                <>
                  <button
                    onClick={prevImage}
                    className={styles.navButton}
                    aria-label={isEn ? "Previous Image" : "上一張"}
                  >
                    <FiChevronLeft size={24} />
                  </button>
                  <button
                    onClick={nextImage}
                    className={`${styles.navButton} ${styles.navButtonRight}`}
                    aria-label={isEn ? "Next Image" : "下一張"}
                  >
                    <FiChevronRight size={24} />
                  </button>
                  <div className={styles.dots}>
                    {images.map((_, index) => (
                      <button
                        key={index}
                        onClick={() => setCurrentImageIndex(index)}
                        className={`${styles.dot} ${
                          index === currentImageIndex ? styles.dotActive : ""
                        }`}
                        aria-label={`${isEn ? "Switch to Image" : "切換到圖片"} ${index + 1}`}
                      />
                    ))}
                  </div>
                </>
              )}
            </div>
          ) : (
            <div className={styles.imageCarousel}>
              <div className={styles.emptyImageState}>
                <p>{isEn ? "No Product Images Uploaded" : "尚未上傳產品圖片"}</p>
              </div>
            </div>
          )}

          {/* 規格表 */}
          <div className={styles.specsWrapper}>
            {specs.length > 0 ? (
              <div className={styles.specsList}>
                {specs.map((spec, index) => (
                  <div key={index} className={styles.specItem}>
                    <div className={styles.specName}>{(isEn ? spec.nameEn : spec.name) || spec.name}</div>
                    <div className={styles.specValue}>{(isEn ? spec.valueEn : spec.value) || spec.value}</div>
                  </div>
                ))}
              </div>
            ) : (
              <div className={styles.emptyState}>
                <p>尚未設定規格</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
};

export default ProductSpecsSection;
