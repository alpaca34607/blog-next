"use client";
import { getSectionStyle } from "@/utils/sectionStyles";
import styles from "./ContentBlockSection.module.scss";
import { isRichTextEmpty } from "@/utils/common";

interface ContentBlockSectionProps {
  section: {
    title?: string;
    subtitle?: string;
    content?: string;
    settings?: {
      backgroundColor?: string;
      backgroundImage?: string;
    };
  };
}

const ContentBlockSection = ({ section }: ContentBlockSectionProps) => {
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
        {section.title && (
          <div className={styles.header}>
            <h2 className={styles.title}>{section.title}</h2>
            {section.subtitle && (
              <p className={styles.subtitle}>{section.subtitle}</p>
            )}
          </div>
        )}

        {section.content && !isRichTextEmpty(section.content) && (
          <div
            className={styles.content}
            dangerouslySetInnerHTML={{ __html: section.content }}
          />
        )}
      </div>
    </section>
  );
};

export default ContentBlockSection;
