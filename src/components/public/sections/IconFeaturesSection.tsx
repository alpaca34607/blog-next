"use client";
import {
  FiShield,
  FiZap,
  FiUsers,
  FiAward,
  FiCheckCircle,
  FiStar,
} from "react-icons/fi";
import { getSectionStyle } from "@/utils/sectionStyles";
import styles from "./IconFeaturesSection.module.scss";
import { useLocale } from "next-intl";

interface IconFeaturesSectionProps {
  section: {
    title?: string;
    titleEn?: string;
    subtitle?: string;
    subtitleEn?: string;
    settings?: {
      backgroundColor?: string;
      backgroundImage?: string;
      templateVariant?: string;
      features?: FeatureItem[];
    };
  };
}

interface FeatureItem {
  icon?: string;
  iconImage?: string;
  title: string;
  titleEn?: string;
  description?: string;
  descriptionEn?: string;
}

// 圖標映射
const ICON_MAP: Record<
  string,
  React.ComponentType<{ size?: number; className?: string }>
> = {
  shield: FiShield,
  zap: FiZap,
  users: FiUsers,
  award: FiAward,
  check: FiCheckCircle,
  star: FiStar,
};

const IconFeaturesSection = ({ section }: IconFeaturesSectionProps) => {
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

  const variant = section.settings?.templateVariant || "grid-3";
  const hasCustomFeatures =
    section.settings?.features && section.settings.features.length > 0;
  const features = hasCustomFeatures ? section.settings?.features || [] : [];
  // Feature項目語言轉換


  // 根據版型決定 grid class
  const getGridClass = () => {
    switch (variant) {
      case "grid-2":
        return styles.grid2;
      case "grid-3":
        return styles.grid3;
      case "grid-4":
        return styles.grid4;
      case "grid-5":
        return styles.grid5;
      case "list":
        return styles.list;
      default:
        return styles.grid3;
    }
  };

  return (
    <section
      className={`${styles.iconFeaturesSection} ${
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

        {features.length > 0 ? (
          <div
            className={`${styles.featuresGrid} ${getGridClass()}`}
            data-variant={variant}
          >
            {features.map((feature, index) => {
              const IconComponent = feature.icon
                ? ICON_MAP[feature.icon] || FiShield
                : FiShield;

              return (
                <div key={index} className={styles.featureItem}>
                  {feature.iconImage ? (
                    <div className={styles.iconImageWrapper}>
                      <img
                        src={feature.iconImage}
                        alt={isEn ? feature.titleEn : feature.title}
                        className={styles.iconImage}
                      />
                    </div>
                  ) : (
                    <div className={styles.iconWrapper}>
                      <IconComponent className={styles.icon} />
                    </div>
                  )}
                  <h3 className={styles.featureTitle}>{(isEn ? feature.titleEn : feature.title) || feature.title}</h3>
                  {feature.description && (
                    <p className={styles.featureDescription}>
                      {(isEn ? feature.descriptionEn : feature.description) || feature.description}
                    </p>
                  )}
                </div>
              );
            })}
          </div>
        ) : (
          <div className={styles.emptyState}>
          </div>
        )}
      </div>
    </section>
  );
};

export default IconFeaturesSection;
