"use client";
import { useRef, useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import { newsData, type NewsArticle } from "@/data/homePageData";
import { Link } from "@/navigation";
import styles from "./NewsSection.module.scss";
import Image from "next/image";
import { API_GetNews } from "@/app/api/frontend_api";

const NewsSection = () => {
  const t = useTranslations("homePage");
  const [newsList, setNewsList] = useState<NewsArticle[]>([]);
  const sectionRef = useRef<HTMLElement>(null);

  const normalizeImageSrc = (src?: string) => {
    if (typeof src !== "string") return null;
    const trimmed = src.trim();
    return trimmed.length > 0 ? trimmed : null;
  };

  // 監聽畫面是否進入
  useEffect(() => {
    const sectionElement = sectionRef.current;
    if (!sectionElement) return;

    const observerOptions = {
      threshold: 0.15,
      rootMargin: "0px 0px -50px 0px",
    };

    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add(styles.animateIn);
        }
      });
    }, observerOptions);

    observer.observe(sectionElement);

    return () => {
      observer.disconnect();
    };
  }, []);

  // 載入最新消息資料
  useEffect(() => {
    if (typeof window === "undefined") return;

    // 從API獲取新聞資料
    const fetchNews = async () => {
      try {
        const response = await API_GetNews();
        if (response?.success) {
          const items: any[] = Array.isArray(response.data)
            ? response.data
            : [];
          const allNews: NewsArticle[] = items.map((n: any) => ({
            id: n.id,
            title: n.title,
            slug: n.slug,
            category: n.category ?? "",
            excerpt: n.excerpt ?? "",
            content: n.content ?? "",
            featuredImage: n.featuredImage ?? "",
            publishDate: n.publishDate ? String(n.publishDate) : "",
            isPublished: !!n.isPublished,
            isFeatured: !!n.isFeatured,
          }));
          const publishedNews = allNews
            .filter((news) => news.isPublished)
            .slice(0, 3);
          setNewsList(publishedNews);
        } else if (response) {
          console.error(
            "取得最新消息失敗:",
            response?.error?.message || "未知錯誤"
          );
        }
      } catch (error) {
        console.error("載入新聞列表發生錯誤:", error);
      }
    };

    // 監聽新聞資料更新事件
    const handleNewsUpdated = () => {
      // 改為直接重新呼叫 API，避免依賴 localStorage
      fetchNews().catch(() => {});
    };
    fetchNews();
    window.addEventListener("newsUpdated", handleNewsUpdated);
    return () => {
      window.removeEventListener("newsUpdated", handleNewsUpdated);
    };
  }, []);

  return (
    <div id="news-section-wrapper" className={styles.newsSectionWrapper}>
      <div className={styles.newsBadge} />
      <section ref={sectionRef} className={styles.newsSection}>
        <div className={styles.title}>
          <h2>{t("newsTitle")}</h2>
          <p>{t("newsSubtitle")}</p>
        </div>
        <div className={styles.list} id="news-section__list">
          {(newsList.length > 0 ? newsList : newsData).map((item) => (
            <div key={item.id} className={styles.cardWrapper}>
              <div className={styles.card}>
                {(() => {
                  const imgSrc = normalizeImageSrc(item.featuredImage);
                  if (!imgSrc) return null;
                  return (
                    <Image
                      src={imgSrc}
                      alt={item.title}
                      width={400}
                      height={300}
                    />
                  );
                })()}
                <div className={styles.cardContent}>
                  <h3>{item.title}</h3>
                  <span>{(item.publishDate || "").slice(0, 10)}</span>
                  <p>{item.excerpt}</p>
                </div>
                <Link href={`/news/${item.slug}`} className={styles.cardLink}>
                  {t("newsViewMore")}
                </Link>
              </div>
            </div>
          ))}
        </div>
        <div className={styles.morebtnWrapper}>
          <Link href="/news" className={styles.morebtn}>
            <svg
              className={styles.btnBgSvg}
              viewBox="0 0 343 56"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
              preserveAspectRatio="none"
            >
              <path
                d="M74.0574 38.4068L1.89676 38.5711L25.0227 0.5L338.5 0.501982V17.9437L299.441 53.8703L89.3722 53.7995L74.0574 38.4068Z"
                fill="currentColor"
              />
              <path
                d="M71.707 44.6873L79.7607 52.741L77.6396 54.8621L70.4648 47.6873H0.5V44.6873H71.707Z"
                fill="currentColor"
              />
              <path
                d="M308.521 54.8009L306.478 52.6036L340.022 21.4044L342.065 23.6017L308.521 54.8009Z"
                fill="currentColor"
              />
              <path
                d="M74.0574 38.4068L1.89676 38.5711L25.0227 0.5L338.5 0.501982V17.9437L299.441 53.8703L89.3722 53.7995L74.0574 38.4068Z"
                stroke="currentColor"
              />
              <path
                d="M71.707 44.6873L79.7607 52.741L77.6396 54.8621L70.4648 47.6873H0.5V44.6873H71.707Z"
                stroke="currentColor"
              />
              <path
                d="M308.521 54.8009L306.478 52.6036L340.022 21.4044L342.065 23.6017L308.521 54.8009Z"
                stroke="currentColor"
              />
            </svg>
            <span>{t("newsMoreContent")}</span>
            <svg
              className={styles.btnArrow}
              width="24"
              height="24"
              viewBox="0 0 67 65"
              stroke="currentColor"
              strokeWidth="2"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M43.804 49.0942H39.772V47.9422C39.772 40.2622 43.74 35.7822 50.076 33.9262V33.2222C46.684 33.6702 42.844 33.9262 38.3 33.9262H4.89197V29.7022H38.3C42.844 29.7022 46.684 29.9582 50.076 30.4062V29.7022C43.74 27.8462 39.772 23.3662 39.772 15.6862V14.5342H43.804V15.4302C43.804 24.0702 49.564 30.2782 60.444 30.2782H61.212V33.3502H60.444C49.564 33.3502 43.804 39.6222 43.804 48.2622V49.0942Z"
                fill="currentColor"
              />
            </svg>
          </Link>
        </div>
      </section>
    </div>
  );
};

export default NewsSection;
