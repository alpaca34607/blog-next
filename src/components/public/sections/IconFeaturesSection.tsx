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

interface IconFeaturesSectionProps {
  section: {
    title?: string;
    subtitle?: string;
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
  description?: string;
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

// 預設功能項目
const DEFAULT_FEATURES: FeatureItem[] = [
  {
    icon: "shield",
    title: "安全可靠",
    description: "企業級資安防護，保障您的數據安全",
  },
  {
    icon: "zap",
    title: "高效能",
    description: "極速處理，提升工作效率",
  },
  {
    icon: "users",
    title: "專業團隊",
    description: "經驗豐富的技術支援團隊",
  },
  {
    icon: "award",
    title: "獲獎肯定",
    description: "多項國內外技術獎項",
  },
];

const IconFeaturesSection = ({ section }: IconFeaturesSectionProps) => {
  // 使用共用的背景樣式工具函數
  const { style: sectionStyle, className: backgroundImageClass } =
    getSectionStyle({
      backgroundColor: section.settings?.backgroundColor,
      backgroundImage: section.settings?.backgroundImage,
    });

  const variant = section.settings?.templateVariant || "grid-3";
  const hasCustomFeatures =
    section.settings?.features && section.settings.features.length > 0;
  const features = hasCustomFeatures
    ? section.settings?.features || DEFAULT_FEATURES
    : DEFAULT_FEATURES;

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
        {section.title && (
          <div className={styles.header}>
            <h2 className={styles.title}>{section.title}</h2>
            {section.subtitle && (
              <p className={styles.subtitle}>{section.subtitle}</p>
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
                        alt={feature.title}
                        className={styles.iconImage}
                      />
                    </div>
                  ) : (
                    <div className={styles.iconWrapper}>
                      <IconComponent className={styles.icon} />
                    </div>
                  )}
                  <h3 className={styles.featureTitle}>{feature.title}</h3>
                  {feature.description && (
                    <p className={styles.featureDescription}>
                      {feature.description}
                    </p>
                  )}
                </div>
              );
            })}
          </div>
        ) : (
          <div className={styles.emptyState}>
            <p>尚無功能項目，請在後台新增功能項目</p>
          </div>
        )}
      </div>
    </section>
  );
};

export default IconFeaturesSection;
