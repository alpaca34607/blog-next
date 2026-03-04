"use client";
import { getSectionStyle } from "@/utils/sectionStyles";
import styles from "./ContentBlockSection.module.scss";
import { isRichTextEmpty } from "@/utils/common";
import { useLocale } from "next-intl";

interface ContentBlockSectionProps {
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
    };
  };
}

const ContentBlockSection = ({ section }: ContentBlockSectionProps) => {
  const locale = useLocale();
  const isEn = locale === "en";
  const title = (isEn ? section.titleEn : section.title) || section.title;
  const subtitle = (isEn ? section.subtitleEn : section.subtitle) || section.subtitle;
  const content = (isEn ? section.contentEn : section.content) || section.content;
  // 使用共用的背景樣式工具函數
  const { style: sectionStyle, className: backgroundImageClass } =
    getSectionStyle({
      backgroundColor: section.settings?.backgroundColor,
      backgroundImage: section.settings?.backgroundImage,
    });

  return (
    <section
      className={`${styles.contentBlockSection} ${
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

        {content && !isRichTextEmpty(content) && (
          <div
            className={styles.content}
            dangerouslySetInnerHTML={{ __html: content }}
          />
        )}
      </div>
    </section>
  );
};

export default ContentBlockSection;
