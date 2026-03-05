"use client";
import { useContext, useEffect, useState } from "react";
import { useLocale } from "next-intl";
import { getSectionStyle } from "@/utils/sectionStyles";
import styles from "./TimelineSection.module.scss";
import {
  API_GetTimelineByIdPublic,
  API_GetTimelineItemsPublic,
} from "@/app/api/public_api";
import { AppLoadingContext } from "@/contexts/AppLoadingContext";

interface Timeline {
  id: string;
  name: string;
  description?: string;
}

interface TimelineItem {
  id: string;
  timelineId: string;
  year: string;
  yearEn?: string;
  title: string;
  titleEn?: string;
  content?: string;
  contentEn?: string;
  image?: string;
  sortOrder: number;
}

interface TimelineSectionProps {
  section: {
    id?: string;
    title?: string;
    titleEn?: string;
    subtitle?: string;
    subtitleEn?: string;
    settings?: {
      backgroundColor?: string;
      backgroundImage?: string;
      timelineId?: string;
    };
  };
}

const TimelineSection = ({ section }: TimelineSectionProps) => {
  const [timeline, setTimeline] = useState<Timeline | null>(null);
  const [items, setItems] = useState<TimelineItem[]>([]);
  const [isClient, setIsClient] = useState(false);
  const appLoading = useContext(AppLoadingContext);
  const startTask = appLoading?.startTask ?? (() => {});
  const endTask = appLoading?.endTask ?? (() => {});
  const locale = useLocale();
  const isEn = locale === "en";
  const title = isEn ? section.titleEn || section.title : section.title;
  const subtitle = isEn ? section.subtitleEn || section.subtitle : section.subtitle;

  // 使用共用的背景樣式工具函數
  const { style: sectionStyle, className: backgroundImageClass } =
    getSectionStyle({
      backgroundColor: section.settings?.backgroundColor,
      backgroundImage: section.settings?.backgroundImage,
    });

  useEffect(() => {
    setIsClient(true);
    const timelineId = section.settings?.timelineId;
    if (!timelineId) return;

    const load = async () => {
      startTask();
      try {
        const [timelineRes, itemsRes] = await Promise.all([
          API_GetTimelineByIdPublic(timelineId),
          API_GetTimelineItemsPublic(timelineId),
        ]);

        if (timelineRes?.success && timelineRes.data) {
          setTimeline({
            id: (timelineRes.data as any).id,
            name: (timelineRes.data as any).name,
            description: (timelineRes.data as any).description || undefined,
          });
        } else {
          setTimeline(null);
        }

        if (itemsRes?.success && Array.isArray(itemsRes.data)) {
          const mapped: TimelineItem[] = (itemsRes.data as any[]).map(
            (it: any) => ({
              id: it.id,
              timelineId,
              year: it.year || "",
              yearEn: it.yearEn || undefined,
              title: it.title || "",
              titleEn: it.titleEn || undefined,
              content: it.content || undefined,
              contentEn: it.contentEn || undefined,
              image: it.image || undefined,
              sortOrder: it.sortOrder ?? 0,
            })
          );
          setItems(mapped.sort((a, b) => a.sortOrder - b.sortOrder));
        } else {
          setItems([]);
        }
      } catch (e) {
        console.error("載入時間軸資料時發生錯誤:", e);
        setTimeline(null);
        setItems([]);
      } finally {
        endTask();
      }
    };

    load();
  }, [section.settings?.timelineId]);

  useEffect(() => {
    if (!isClient) return;
    const timelineId = section.settings?.timelineId;
    if (!timelineId) return;

    const reload = () => {
      Promise.all([
        API_GetTimelineByIdPublic(timelineId),
        API_GetTimelineItemsPublic(timelineId),
      ])
        .then(([timelineRes, itemsRes]) => {
          if (timelineRes?.success && timelineRes.data) {
            setTimeline({
              id: (timelineRes.data as any).id,
              name: (timelineRes.data as any).name,
              description: (timelineRes.data as any).description || undefined,
            });
          }

          if (itemsRes?.success && Array.isArray(itemsRes.data)) {
            const mapped: TimelineItem[] = (itemsRes.data as any[]).map(
              (it: any) => ({
                id: it.id,
                timelineId,
                year: it.year || "",
                yearEn: it.yearEn || undefined,
                title: it.title || "",
                titleEn: it.titleEn || undefined,
                content: it.content || undefined,
                contentEn: it.contentEn || undefined,
                image: it.image || undefined,
                sortOrder: it.sortOrder ?? 0,
              })
            );
            setItems(mapped.sort((a, b) => a.sortOrder - b.sortOrder));
          }
        })
        .catch(() => {});
    };

    const handleTimelinesUpdate = () => reload();
    const handleItemsUpdate = () => reload();

    window.addEventListener("timelinesUpdated", handleTimelinesUpdate);
    window.addEventListener(
      `timelineItemsUpdated_${timelineId}`,
      handleItemsUpdate
    );

    return () => {
      window.removeEventListener("timelinesUpdated", handleTimelinesUpdate);
      window.removeEventListener(
        `timelineItemsUpdated_${timelineId}`,
        handleItemsUpdate
      );
    };
  }, [isClient, section.settings?.timelineId]);

  if (!isClient || !section.settings?.timelineId || !timeline) {
    return null;
  }

  return (
    <section
      className={`${styles.timelineSection} ${
        backgroundImageClass ? styles.hasBgImage : ""
      }`}
      style={sectionStyle}
    >
      <div className={styles.container}>
        {(section.title || section.subtitle) && (
          <div className={styles.header}>
            {title && <h2 className={styles.title}>{title}</h2>}
            {subtitle && (
              <p className={styles.subtitle}>{subtitle}</p>
            )}
          </div>
        )}

        <div className={styles.timelineWrapper}>
          <div className={styles.timelineLine} />

          {items.length === 0 ? (
            <div className={styles.emptyState}>此時間軸尚無項目</div>
          ) : (
            <div className={styles.items}>
              {items.map((item, index) => {
                const isEven = index % 2 === 0;

                return (
                  <div
                    key={item.id}
                    className={`${styles.row} ${!isEven ? styles.reverse : ""}`}
                  >
                    <div
                      className={`${styles.contentHalf} ${
                        isEven ? styles.contentRight : styles.contentLeft
                      }`}
                    >
                      <div className={styles.contentInner}>
                        
                          {item.image && (
                            <div className={styles.contentImage}>
                            <img
                              src={item.image}
                              alt={item.title}
                              width={100}
                              height={100}
                            />
                            </div>
                          )}
                        <div className={styles.contentText}>
                          {(isEn ? item.yearEn || item.year : item.year) && (
                            <span className={styles.year}>
                              {isEn ? item.yearEn || item.year : item.year}
                            </span>
                          )}
                          <h3 className={styles.itemTitle}>
                            {isEn ? item.titleEn || item.title : item.title}
                          </h3>
                          {(isEn ? item.contentEn || item.content : item.content) && (
                            <p className={styles.description}>
                              {isEn ? item.contentEn || item.content : item.content}
                            </p>
                          )}
                        </div>
                      </div>
                    </div>

                    <div className={styles.dotWrapper}>
                      <div className={styles.dot} />
                    </div>
                    <div className={styles.spacer} />
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </section>
  );
};

export default TimelineSection;
