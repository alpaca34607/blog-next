"use client";
import { Link } from "@/navigation";
import { FiArrowRight } from "react-icons/fi";
import { getSectionStyle } from "@/utils/sectionStyles";
import styles from "./CTASection.module.scss";
import { accentOrange } from "@/styles/theme";
import { isRichTextEmpty } from "@/utils/common";
import { useLocale } from "next-intl";

interface CTASectionProps {
  section: {
    title?: string;
    titleEn?: string;
    subtitle?: string;
    subtitleEn?: string;
    settings?: {
      backgroundColor?: string;
      backgroundImage?: string;
      ctaContent?: string;
      ctaContentEn?: string;
      buttonText?: string;
      buttonTextEn?: string;
      buttonLink?: string;
      buttonColor?: string;
      buttonTextColor?: string;
      templateVariant?: string;
    };
  };
}

const CTASection = ({ section }: CTASectionProps) => {
  const locale = useLocale();
  const isEn = locale === "en";
  const title = (isEn ? section.titleEn : section.title) || section.title;
  const subtitle = (isEn ? section.subtitleEn : section.subtitle) || section.subtitle;
  const ctaContent =
    (isEn ? section.settings?.ctaContentEn : section.settings?.ctaContent) ||
    section.settings?.ctaContent;
  const rawButtonText =
    (isEn ? section.settings?.buttonTextEn : section.settings?.buttonText) ||
    section.settings?.buttonText ||
    "";
  const buttonText = rawButtonText.trim();
  const buttonLink = (section.settings?.buttonLink || "").trim();

  // 使用共用的背景樣式工具函數
  const { style: sectionStyle, className: backgroundImageClass } =
    getSectionStyle({
      backgroundColor: section.settings?.backgroundColor,
      backgroundImage: section.settings?.backgroundImage,
      defaultBgColor: accentOrange,
    });

  const buttonColor = section.settings?.buttonColor || "#faad3a";
  const buttonTextColor = section.settings?.buttonTextColor || "#ffffff";
  const variant = section.settings?.templateVariant || "centered";

  const alignmentClass =
    variant === "left-aligned"
      ? styles.leftAligned
      : variant === "right-aligned"
      ? styles.rightAligned
      : "";

  // 僅在有明確按鈕設定時才顯示按鈕（避免強制顯示）
  const hasButtonConfig = !!buttonText || !!buttonLink;
  const shouldShowButton = hasButtonConfig;

  return (
    <section
      className={`${styles.ctaSection} ${alignmentClass} ${
        backgroundImageClass ? styles.hasBgImage : ""
      }`}
      style={sectionStyle}
    >
      <div className={styles.container}>
        {title && <h2 className={styles.title}>{title}</h2>}
        {subtitle && <p className={styles.subtitle}> {subtitle}</p>}
        {ctaContent && !isRichTextEmpty(ctaContent) && (
          <div
            className={styles.content}
            dangerouslySetInnerHTML={{ __html: ctaContent }}
          />
        )}
        {shouldShowButton && (
          <div className={styles.buttonContainer}>
            <Link
              href={buttonLink}
              className={styles.button}
              style={{
                backgroundColor: buttonColor,
                color: buttonTextColor,
              }}
            >
              {buttonText}
              <FiArrowRight size={18} className={styles.arrowIcon} />
            </Link>
          </div>
        )}
      </div>
    </section>
  );
};

export default CTASection;
