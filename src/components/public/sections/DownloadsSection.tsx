"use client";
import { useState, useMemo } from "react";
import { FiDownload, FiFileText, FiCalendar } from "react-icons/fi";
import { getSectionStyle } from "@/utils/sectionStyles";
import TabBar, { TabItem } from "@/components/public/TabBar";
import styles from "./DownloadsSection.module.scss";
import { useLocale } from "next-intl";

interface DownloadsSectionProps {
  section: {
    title?: string;
    titleEn?: string;
    subtitle?: string;
    subtitleEn?: string;
    settings?: {
      backgroundColor?: string;
      backgroundImage?: string;
      downloads?: DownloadItem[];
    };
  };
}

interface DownloadItem {
  id?: string;
  title: string;
  titleEn?: string;
  category?: string;
  categoryEn?: string;
  publishDate?: string;
  fileSize?: string;
  fileUrl?: string;
  fileName?: string;
  fileType?: string;
}

const DownloadsSection = ({ section }: DownloadsSectionProps) => {
  const locale = useLocale();
  const isEn = locale === "en";
  const title = (isEn ? section.titleEn : section.title) || section.title;
  const subtitle = (isEn ? section.subtitleEn : section.subtitle) || section.subtitle;
  // 使用共用的背景樣式工具函數
  const { style: sectionStyle, className: backgroundImageClass } =
    getSectionStyle({
      backgroundColor: section.settings?.backgroundColor,
      backgroundImage: section.settings?.backgroundImage,
      defaultBgColor: "#f9fafb",
    });

  // 從設定中獲取下載項目，如果沒有則使用空陣列
  const downloads: DownloadItem[] = section.settings?.downloads || [];

  // 提取所有唯一的 category
  const categories = useMemo(() => {
    const uniqueCategories = new Set<string>();
    downloads.forEach((download) => {
      if (download.category) {
        uniqueCategories.add(download.category);
      }
    });
    return Array.from(uniqueCategories).sort();
  }, [downloads]);

  // 當前選中的 category，null 表示顯示全部
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

  // 依「中文分類」找出對應的英文標籤
  const getEnLabel = (zhCategory: string): string => {
    if (!isEn) return zhCategory;
    const matched = downloads.find((item) => item.category === zhCategory);
    return matched?.categoryEn || zhCategory;
  };
  // 建立 Tab 項目
  const tabItems: TabItem[] = useMemo(() => {
    const tabs: TabItem[] = [
      { id: "all", label: isEn ? "All" : "全部", value: null },
    ];
    categories.forEach((category) => {
      tabs.push({ id: category, label: getEnLabel(category), value: category });
    });
    return tabs;
  }, [categories, isEn, downloads]);

  // 根據選中的 category 篩選下載項目
  const filteredDownloads = useMemo(() => {
    if (!selectedCategory) {
      return downloads;
    }
    return downloads.filter(
      (download) => download.category === selectedCategory
    );
  }, [downloads, selectedCategory]);

  const formatDate = (dateString?: string) => {
    if (!dateString) return "";
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString("zh-TW", {
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
      });
    } catch {
      return dateString;
    }
  };

  return (
    <section
      className={`${styles.downloadsSection} ${
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

        {downloads.length > 0 && categories.length > 0 && (
          <TabBar
            tabs={tabItems}
            activeValue={selectedCategory}
            onTabChange={(value) => setSelectedCategory(value as string | null)}
          />
        )}

        {downloads.length > 0 ? (
          <>
            <div className={styles.downloadsList}>
              {filteredDownloads.map((download, index) => (
                <div
                  key={download.id || `download-${index}`}
                  className={styles.downloadItem}
                >
                  <div className={styles.downloadInfo}>
                    <div className={styles.iconWrapper}>
                      <FiFileText size={24} className={styles.icon} />
                    </div>
                    <div className={styles.downloadDetails}>
                      <h4 className={styles.downloadTitle}>{isEn ? download.titleEn || download.title : download.title}</h4>
                      <div className={styles.downloadMeta}>
                        {download.category && (
                          <span className={styles.metaItem}>
                            {isEn ? download.categoryEn || download.category : download.category}
                          </span>
                        )}
                        {download.publishDate && (
                          <span className={styles.metaItem}>
                            <FiCalendar size={14} />
                            {formatDate(download.publishDate)}
                          </span>
                        )}
                        {download.fileSize && (
                          <span className={styles.metaItem}>
                            {download.fileSize}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                  {download.fileUrl && (
                    <a
                      href={download.fileUrl}
                      target={
                        download.fileUrl.startsWith("data:")
                          ? "_self"
                          : "_blank"
                      }
                      rel="noopener noreferrer"
                      download={download.fileName || download.title}
                      className={styles.downloadButton}
                      onClick={(e) => {
                        // 如果是 base64 檔案，創建下載連結
                        if (download.fileUrl?.startsWith("data:")) {
                          e.preventDefault();
                          const link = document.createElement("a");
                          link.href = download.fileUrl;
                          link.download =
                            download.fileName || download.title || "download";
                          document.body.appendChild(link);
                          link.click();
                          document.body.removeChild(link);
                        }
                      }}
                    >
                      <FiDownload size={16} />
                      <span>{isEn ? "Download" : "下載"}</span>
                    </a>
                  )}
                </div>
              ))}
            </div>
            {filteredDownloads.length === 0 && selectedCategory && (
              <div className={styles.emptyState}>
                <p>此分類尚無下載項目</p>
              </div>
            )}
          </>
        ) : (
          <div className={styles.emptyState}>
            <p>尚無下載項目，請在後台新增下載資料</p>
          </div>
        )}
      </div>
    </section>
  );
};

export default DownloadsSection;
