"use client";
import { FiArrowRight } from "react-icons/fi";
import { getSectionStyle } from "@/utils/sectionStyles";
import styles from "./ImageTextSection.module.scss";

interface ImageTextSectionProps {
  section: {
    title?: string;
    subtitle?: string;
    content?: string;
    settings?: {
      backgroundColor?: string;
      backgroundImage?: string;
      templateVariant?: string;
      image?: string;
      buttonText?: string;
      buttonLink?: string;
    };
    image?: string; // 支援直接的 image 欄位
  };
}

const ImageTextSection = ({ section }: ImageTextSectionProps) => {
  // 使用共用的背景樣式工具函數
  const { style: sectionStyle, className: backgroundImageClass } =
    getSectionStyle({
      backgroundColor: section.settings?.backgroundColor,
      backgroundImage: section.settings?.backgroundImage,
    });

  const variant = section.settings?.templateVariant || "left-image";
  const image = section.settings?.image || section.image;
  const buttonText = section.settings?.buttonText;
  const buttonLink = section.settings?.buttonLink || "#";

  const isVertical = variant === "vertical";
  const isRightImage = variant === "right-image";

  // 決定容器 class
  const getContainerClass = () => {
    if (isVertical) {
      return styles.containerVertical;
    } else if (isRightImage) {
      return styles.containerRightImage;
    } else {
      return styles.containerLeftImage;
    }
  };

  return (
    <section
      className={`${styles.imageTextSection} ${
        backgroundImageClass ? styles.hasBgImage : ""
      }`}
      style={sectionStyle}
    >
      <div className={styles.wrapper}>
        <div className={styles.header}>
          {section.title && <h2 className={styles.title}>{section.title}</h2>}
            {section.subtitle && (
              <p className={styles.subtitle}>{section.subtitle}</p>
            )}
        </div>
        <div className={`${styles.contentContainer} ${getContainerClass()}`}>
          {/* 圖片 */}
          {image && (
            <div className={styles.imageWrapper}>
              <img
                src={image}
                alt={section.title || ""}
                className={styles.image}
              />
            </div>
          )}

          {/* 內容 */}
          <div
            className={`${styles.textWrapper} ${
              image ? styles.hasImage : styles.noImage
            }`}
          >
          
            {section.content && (
              <div
                className={styles.content}
                dangerouslySetInnerHTML={{ __html: section.content }}
              />
            )}
            {buttonText && (
              <a href={buttonLink} className={styles.buttonLink}>
                <button className={styles.button}>
                  {buttonText}
                  <FiArrowRight size={18} className={styles.buttonIcon} />
                </button>
              </a>
            )}
          </div>
        </div>
      </div>
    </section>
  );
};

export default ImageTextSection;
