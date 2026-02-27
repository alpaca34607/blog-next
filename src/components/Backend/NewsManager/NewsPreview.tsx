"use client";

import { useSearchParams } from "next/navigation";

import { useState, useEffect } from "react";

import { FiArrowLeft, FiEye } from "react-icons/fi";
import Link from "next/link";
import Image from "next/image";
import styles from "./NewsPreview.module.scss";
import { API_GetNewsAdmin } from "@/app/api/admin_api";

interface NewsArticle {
  id: string;
  title: string;
  titleEn: string;
  slug: string;
  category?: string | null;
  excerpt?: string | null;
  excerptEn?: string | null;
  content: string;
  contentEn: string;
  featuredImage?: string | null;
  publishDate?: string | null;
  isPublished: boolean;
  isFeatured: boolean;
}

const NewsPreview = () => {
  const searchParams = useSearchParams();
  const articleSlug = searchParams.get("slug") || "";

  const [news, setNews] = useState<NewsArticle[]>([]);
  const [isClient, setIsClient] = useState(false);
  const [loading, setLoading] = useState(true);

  // 在客戶端載入 API 資料（避免依賴 localStorage）
  useEffect(() => {
    setIsClient(true);

    const load = async () => {
      try {
        setLoading(true);
        const res = await API_GetNewsAdmin({ limit: 2000 });
        if (res?.success && Array.isArray(res.data)) {
          setNews(
            (res.data as any[]).map((n: any) => ({
              id: n.id,
              title: n.title,
              titleEn: n.titleEn,
              slug: n.slug,
              category: n.category ?? null,
              excerpt: n.excerpt ?? null,
              excerptEn: n.excerptEn ?? null,
              content: n.content,
              contentEn: n.contentEn,
              featuredImage: n.featuredImage ?? null,
              publishDate: n.publishDate ?? null,
              isPublished: !!n.isPublished,
              isFeatured: !!n.isFeatured,
            }))
          );
        } else {
          setNews([]);
        }
      } catch (e) {
        console.error("載入新聞資料時發生錯誤:", e);
        setNews([]);
      } finally {
        setLoading(false);
      }
    };

    load();
  }, []);

  // 後台更新事件：重新抓取 API
  useEffect(() => {
    if (!isClient) return;

    const reload = async () => {
      try {
        const res = await API_GetNewsAdmin({ limit: 2000 });
        if (res?.success && Array.isArray(res.data)) {
          setNews(
            (res.data as any[]).map((n: any) => ({
              id: n.id,
              title: n.title,
              titleEn: n.titleEn,
              slug: n.slug,
              category: n.category ?? null,
              excerpt: n.excerpt ?? null,
              excerptEn: n.excerptEn ?? null,
              content: n.content,
              contentEn: n.contentEn,
              featuredImage: n.featuredImage ?? null,
              publishDate: n.publishDate ?? null,
              isPublished: !!n.isPublished,
              isFeatured: !!n.isFeatured,
            }))
          );
        }
      } catch {
        // 忽略錯誤
      }
    };

    window.addEventListener("newsUpdated", reload);
    return () => window.removeEventListener("newsUpdated", reload);
  }, [isClient]);

  // 找到對應的新聞（預覽模式不檢查 isPublished）
  const article = news.find((a) => a.slug === articleSlug);

  // 找到相關文章（同分類，排除當前文章，只顯示已發布的）
  const relatedNews = article
    ? news
        .filter(
          (a) =>
            a.isPublished &&
            a.category === article.category &&
            a.id !== article.id
        )
        .sort(
          (a, b) =>
            new Date(b.publishDate || 0).getTime() -
            new Date(a.publishDate || 0).getTime()
        )
        .slice(0, 3)
    : [];

  const formatDate = (dateString: string) => {
    try {
      const date = new Date(dateString);

      return date.toLocaleDateString("zh-TW", {
        year: "numeric",
        month: "long",
        day: "numeric",
      });
    } catch {
      return dateString;
    }
  };

  useEffect(() => {
    if (article) {
      document.title = article.title || "新聞預覽";
    }
  }, [article]);

  if (!isClient || loading) {
    return (
      <div className={styles.previewContainer}>
        <div className={styles.emptyState}>載入中...</div>
      </div>
    );
  }

  if (!article) {
    return (
      <div className={styles.previewContainer}>
        <div className={styles.header}>
          <Link href="/admin/NewsManager" className={styles.backButton}>
            <FiArrowLeft size={20} /> <span>返回新聞管理</span>
          </Link>
        </div>
        <div className={styles.errorState}>
          <p>找不到指定的新聞</p>
          <Link href="/admin/NewsManager" className={styles.backLink}>
            返回新聞管理
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.previewContainer}>
      {/* Header */}
      <div className={styles.header}>
        <Link href="/admin/NewsManager" className={styles.backButton}>
          <FiArrowLeft size={20} /> <span>返回新聞管理</span>
        </Link>
        <div className={styles.headerActions}>
          <Link
            href={`/zh/news/${article.slug}`}
            target="_blank"
            className={styles.previewButton}
          >
            <FiEye size={16} />
            <span>前往前台頁面</span>
          </Link>
        </div>
      </div>
      {/* Preview Badge */}
      {!article.isPublished && (
        <div className={styles.previewBadge}>
          <span>預覽模式 - 此新聞尚未發布</span>
        </div>
      )}
      {/* Article */}
      <article className={styles.article}>
        {/* Article Header */}
        <header className={styles.articleHeader}>
          <div className={styles.meta}>
            <span className={styles.category}> {article.category}</span>
            <span className={styles.date}>
              {formatDate(article.publishDate || "")}
            </span>
          </div>
          <h1 className={styles.title}> {article.title}</h1>
          {article.excerpt && (
            <p className={styles.excerpt}> {article.excerpt}</p>
          )}
        </header>
        {/* Featured Image */}
        {article.featuredImage && (
          <div className={styles.featuredImage}>
            <Image
              src={article.featuredImage}
              alt={article.title}
              width={1200}
              height={600}
              className={styles.image}
            />
          </div>
        )}
        {/* Article Content */}
        <div
          className={styles.content}
          dangerouslySetInnerHTML={{
            __html: article.content,
          }}
        />
      </article>
      {/* Related News */}
      {relatedNews.length > 0 && (
        <section className={styles.relatedNews}>
          <h2 className={styles.relatedTitle}>相關文章</h2>
          <div className={styles.relatedGrid}>
            {relatedNews.map((news) => (
              <Link
                key={news.id}
                href={`/admin/NewsManager/preview?slug=${news.slug}

                `}
                className={styles.relatedCard}
              >
                {news.featuredImage && (
                  <div className={styles.relatedImage}>
                    <Image
                      src={news.featuredImage}
                      alt={news.title}
                      width={400}
                      height={250}
                      className={styles.image}
                    />
                  </div>
                )}
                <div className={styles.relatedContent}>
                  <span className={styles.relatedCategory}>
                    {news.category}
                  </span>
                  <h3 className={styles.relatedCardTitle}> {news.title}</h3>
                  {news.excerpt && (
                    <p className={styles.relatedExcerpt}> {news.excerpt}</p>
                  )}
                  <span className={styles.relatedDate}>
                    {formatDate(news.publishDate || "")}
                  </span>
                </div>
              </Link>
            ))}
          </div>
        </section>
      )}
    </div>
  );
};

export default NewsPreview;
