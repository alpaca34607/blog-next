"use client";
import { useEffect, useState } from "react";
import { getSectionStyle } from "@/utils/sectionStyles";
import styles from "./TimelineSection.module.scss";
import {
  API_GetTimelineByIdPublic,
  API_GetTimelineItemsPublic,
} from "@/app/api/public_api";

interface Timeline {
  id: string;
  name: string;
  description?: string;
}

interface TimelineItem {
  id: string;
  timelineId: string;
  year: string;
  title: string;
  description?: string;
  image?: string;
  sortOrder: number;
}

interface TimelineSectionProps {
  section: {
    id?: string;
    title?: string;
    subtitle?: string;
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
            title: it.title,
            description: it.content || undefined,
            image: it.image || undefined,
            sortOrder: it.sortOrder ?? 0,
          })
        );
        setItems(mapped.sort((a, b) => a.sortOrder - b.sortOrder));
      } else {
        setItems([]);
      }
    };

    load().catch((e) => {
      console.error("載入時間軸資料時發生錯誤:", e);
      setTimeline(null);
      setItems([]);
    });
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
                title: it.title,
                description: it.content || undefined,
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
            {section.title && <h2 className={styles.title}>{section.title}</h2>}
            {section.subtitle && (
              <p className={styles.subtitle}>{section.subtitle}</p>
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
                          {item.year && (
                            <span className={styles.year}>{item.year}</span>
                          )}
                          <h3 className={styles.itemTitle}>{item.title}</h3>
                          {item.description && (
                            <p className={styles.description}>
                              {item.description}
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
