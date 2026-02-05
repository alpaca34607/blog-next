"use client";
import Link from "next/link";
import { FiArrowRight } from "react-icons/fi";
import { getSectionStyle } from "@/utils/sectionStyles";
import styles from "./CTASection.module.scss";
import { accentOrange } from "@/styles/theme";

interface CTASectionProps {
  section: {
    title?: string;
    subtitle?: string;
    content?: string;
    settings?: {
      backgroundColor?: string;
      backgroundImage?: string;
      ctaContent?: string;
      buttonText?: string;
      buttonLink?: string;
      buttonColor?: string;
      buttonTextColor?: string;
    };
  };
}

const CTASection = ({ section }: CTASectionProps) => {
  // 使用共用的背景樣式工具函數
  const { style: sectionStyle, className: backgroundImageClass } =
    getSectionStyle({
      backgroundColor: section.settings?.backgroundColor,
      backgroundImage: section.settings?.backgroundImage,
      defaultBgColor: accentOrange,
    });

  const buttonText = section.settings?.buttonText || "前往瞭解";
  const buttonLink = section.settings?.buttonLink || "#";
  const buttonColor = section.settings?.buttonColor || "#273840";
  const buttonTextColor = section.settings?.buttonTextColor || "#ffffff";

  // CTA 區塊應該總是顯示按鈕（只要有標題或副標題）
  // 或者如果有 content 或 settings 中有按鈕設定，則顯示按鈕
  const shouldShowButton =
    section.title ||
    section.subtitle ||
    section.content ||
    section.settings?.buttonText ||
    section.settings?.buttonLink;

  return (
    <section
      className={`${styles.ctaSection} ${
        backgroundImageClass ? styles.hasBgImage : ""
      }`}
      style={sectionStyle}
    >
      <div className={styles.container}>
        {section.title && <h2 className={styles.title}> {section.title}</h2>}
        {section.subtitle && (
          <p className={styles.subtitle}> {section.subtitle}</p>
        )}
        {section.settings?.ctaContent && (
          <div
            className={styles.ctaContent}
            dangerouslySetInnerHTML={{ __html: section.settings.ctaContent }}
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
