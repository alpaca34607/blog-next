"use client";
import { Link } from "@/navigation";
import { FiArrowRight } from "react-icons/fi";
import { getSectionStyle } from "@/utils/sectionStyles";
import { isRichTextEmpty } from "@/utils/common";
import styles from "./ImageTextSection.module.scss";
import { useLocale } from "next-intl";

interface ImageTextSectionProps {
  section: {
    title?: string;
    titleEn?: string;
    subtitle?: string;
    subtitleEn?: string;
    content?: string;
    contentEn?: string;
    settings?: {
      backgroundColor?: string;
      backgroundImage?: string;
      templateVariant?: string;
      image?: string;
      buttonText?: string;
      buttonTextEn?: string;
      buttonLink?: string;
    };
    image?: string; // 支援直接的 image 欄位
  };
}

const ImageTextSection = ({ section }: ImageTextSectionProps) => {
  const locale = useLocale();
  const isEn = locale === "en";
  const title = (isEn ? section.titleEn : section.title) || section.title;
  const subtitle = (isEn ? section.subtitleEn : section.subtitle) || section.subtitle;
  const content = (isEn ? section.contentEn : section.content) || section.content;
  const buttonText = (isEn ? section.settings?.buttonTextEn : section.settings?.buttonText) || section.settings?.buttonText;
  // 使用共用的背景樣式工具函數
  const { style: sectionStyle, className: backgroundImageClass } =
    getSectionStyle({
      backgroundColor: section.settings?.backgroundColor,
      backgroundImage: section.settings?.backgroundImage,
    });

  const variant = section.settings?.templateVariant || "left-image";
  const image = section.settings?.image || section.image;
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
          {title && <h2 className={styles.title}>{title}</h2>}
            {subtitle && (
              <p className={styles.subtitle}>{subtitle}</p>
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
          
            {content && !isRichTextEmpty(content) && (
              <div
                className={styles.content}
                dangerouslySetInnerHTML={{ __html: content || "" }}
              />
            )}
            {buttonText && (
              <Link href={buttonLink} className={styles.button}>
                {buttonText}
                <FiArrowRight size={18} className={styles.buttonIcon} />
              </Link>
            )}
          </div>
        </div>
      </div>
    </section>
  );
};

export default ImageTextSection;
