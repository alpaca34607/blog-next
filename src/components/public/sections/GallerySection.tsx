"use client";
import { useState, useEffect } from "react";
import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation, Pagination, Autoplay } from "swiper/modules";
import { FiChevronLeft, FiChevronRight } from "react-icons/fi";
import { getSectionStyle } from "@/utils/sectionStyles";
import styles from "./GallerySection.module.scss";

// 導入 Swiper 樣式
import "swiper/css";
import "swiper/css/navigation";
import "swiper/css/pagination";

interface GallerySectionProps {
  section: {
    title?: string;
    subtitle?: string;
    settings?: {
      backgroundColor?: string;
      backgroundImage?: string;
      templateVariant?: string;
      images?: string[];
    };
  };
}

const GallerySection = ({ section }: GallerySectionProps) => {
  // 使用共用的背景樣式工具函數
  const { style: sectionStyle, className: backgroundImageClass } =
    getSectionStyle({
      backgroundColor: section.settings?.backgroundColor,
      backgroundImage: section.settings?.backgroundImage,
    });

  const variant = section.settings?.templateVariant || "carousel";

  // 支援多種資料來源：settings.images 或直接的 images 欄位
  const images = section.settings?.images || (section as any).images || [];

  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // 如果沒有圖片，顯示提示訊息而不是完全不顯示
  if (images.length === 0) {
    return (
      <section
        className={`${styles.gallerySection} ${
          backgroundImageClass ? styles.hasBgImage : ""
        }`}
        style={sectionStyle}
      >
        <div className={styles.container}>
          {section.title && (
            <div className={styles.header}>
              <h2 className={styles.title}>{section.title}</h2>
              {section.subtitle && (
                <p className={styles.subtitle}>{section.subtitle}</p>
              )}
            </div>
          )}
          <div className={styles.emptyState}>
            <p>尚無圖片，請在後台新增圖片</p>
          </div>
        </div>
      </section>
    );
  }

  if (!mounted) {
    return (
      <section
        className={`${styles.gallerySection} ${
          backgroundImageClass ? styles.hasBgImage : ""
        }`}
        style={sectionStyle}
      >
        <div className={styles.container}>
          <div className={styles.loading}>載入中...</div>
        </div>
      </section>
    );
  }

  return (
    <section
      className={`${styles.gallerySection} ${
        backgroundImageClass ? styles.hasBgImage : ""
      }`}
      style={sectionStyle}
    >
      <div className={styles.container}>
        {section.title && (
          <div className={styles.header}>
            <h2 className={styles.title}>{section.title}</h2>
            {section.subtitle && (
              <p className={styles.subtitle}>{section.subtitle}</p>
            )}
          </div>
        )}

        {/* 輪播樣式 */}
        {variant === "carousel" && (
          <div className={styles.carouselWrapper}>
            <Swiper
              modules={[Navigation, Pagination, Autoplay]}
              spaceBetween={0}
              slidesPerView={1}
              autoHeight
              loop={images.length > 1}
              autoplay={
                images.length > 1
                  ? {
                      delay: 5000,
                      disableOnInteraction: false,
                      pauseOnMouseEnter: true,
                    }
                  : false
              }
              navigation={{
                nextEl: `.${styles.swiperButtonNext}`,
                prevEl: `.${styles.swiperButtonPrev}`,
              }}
              pagination={{
                clickable: true,
                bulletClass: styles.swiperPaginationBullet,
                bulletActiveClass: styles.swiperPaginationBulletActive,
              }}
              className={styles.swiper}
            >
              {images.map((image: string, index: number) => (
                <SwiperSlide key={index} className={styles.swiperSlide}>
                  <div className={styles.imageWrapper}>
                    <img src={image} alt={`Gallery ${index + 1}`} />
                  </div>
                </SwiperSlide>
              ))}
            </Swiper>
            {images.length > 1 && (
              <>
                <button
                  className={`${styles.swiperButton} ${styles.swiperButtonPrev}`}
                  aria-label="上一張"
                >
                  <FiChevronLeft size={24} />
                </button>
                <button
                  className={`${styles.swiperButton} ${styles.swiperButtonNext}`}
                  aria-label="下一張"
                >
                  <FiChevronRight size={24} />
                </button>
              </>
            )}
          </div>
        )}

        {/* 單張樣式 */}
        {variant === "single" && (
          <div className={styles.singleWrapper}>
            <img src={images[0]} alt="Gallery" />
          </div>
        )}

        {/* 雙張樣式 */}
        {variant === "double" && (
          <div className={styles.doubleWrapper}>
            {images.slice(0, 2).map((image: string, index: number) => (
              <div key={index} className={styles.imageWrapper}>
                <img src={image} alt={`Gallery ${index + 1}`} />
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
};

export default GallerySection;
