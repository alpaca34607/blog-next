"use client";

import { use, useEffect, useState } from "react";
import { useRouter } from "@/navigation";
import { Link } from "@/navigation";
import Image from "next/image";
import Layout from "@/components/Frontend/Layout";
import { FiArrowLeft, FiCalendar, FiTag } from "react-icons/fi";
import styles from "./page.module.scss";
import { API_GetNewsWithParams } from "@/app/api/public_api";
import { useTranslations } from "next-intl";

interface NewsArticle {
  id: string;
  title: string;
  slug: string;
  category?: string | null;
  excerpt?: string | null;
  content: string;
  featuredImage?: string | null;
  publishDate?: string | null;
  isPublished: boolean;
  isFeatured: boolean;
}

interface NewsPageProps {
  params: Promise<{
    locale: string;
    slug: string;
  }>;
}

export default function NewsPage({ params }: NewsPageProps) {
  const { slug } = use(params);
  const router = useRouter();
  const t = useTranslations("news");
  const [article, setArticle] = useState<NewsArticle | null>(null);
  const [relatedNews, setRelatedNews] = useState<NewsArticle[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;

    const load = async () => {
      try {
        setLoading(true);

        const res = await API_GetNewsWithParams({ slug });
        if (!res?.success) {
          router.push("/news");
          return;
        }

        const items: any[] = Array.isArray(res.data) ? res.data : [];
        const mapped: NewsArticle[] = items.map((n: any) => ({
          id: n.id,
          title: n.title,
          slug: n.slug,
          category: n.category ?? null,
          excerpt: n.excerpt ?? null,
          content: n.content,
          featuredImage: n.featuredImage ?? null,
          publishDate: n.publishDate ?? null,
          isPublished: !!n.isPublished,
          isFeatured: !!n.isFeatured,
        }));

        const current = mapped[0];
        if (!current || !current.isPublished) {
          router.push("/news");
          return;
        }

        if (cancelled) return;
        setArticle(current);

        if (!current.category) {
          setRelatedNews([]);
          return;
        }
        const relatedRes = await API_GetNewsWithParams({
          category: current.category,
        });
        if (!relatedRes?.success) {
          setRelatedNews([]);
          return;
        }
        const relatedItems: any[] = Array.isArray(relatedRes.data)
          ? relatedRes.data
          : [];
        const relatedMapped: NewsArticle[] = relatedItems.map((n: any) => ({
          id: n.id,
          title: n.title,
          slug: n.slug,
          category: n.category ?? null,
          excerpt: n.excerpt ?? null,
          content: n.content,
          featuredImage: n.featuredImage ?? null,
          publishDate: n.publishDate ?? null,
          isPublished: !!n.isPublished,
          isFeatured: !!n.isFeatured,
        }));

        const related = relatedMapped
          .filter((a) => a.isPublished && a.id !== current.id)
          .sort(
            (a, b) =>
              new Date(b.publishDate || 0).getTime() -
              new Date(a.publishDate || 0).getTime()
          )
          .slice(0, 3);

        if (!cancelled) setRelatedNews(related);
      } catch (error) {
        console.error("載入新聞時發生錯誤:", error);
        router.push("/news");
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    load();
    return () => {
      cancelled = true;
    };
  }, [slug, router]);

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

  if (loading) {
    return (
      <Layout>
        <div className={styles.loading}>{t("loading")}</div>
      </Layout>
    );
  }

  if (!article) {
    return null;
  }

  return (
    <Layout>
      <div className={styles.newsPage}>
        {/* 麵包屑 */}
        <div className={styles.breadcrumb}>
          <Link href="/" className={styles.breadcrumbLink}>
            {t("breadcrumbHome")}
          </Link>
          <span className={styles.breadcrumbSeparator}>/</span>
          <Link href="/news" className={styles.breadcrumbLink}>
            {t("breadcrumbNews")}
          </Link>
          <span className={styles.breadcrumbSeparator}>/</span>
          <span className={styles.breadcrumbCurrent}>{article.title}</span>
        </div>

        {/* 文章區塊 */}
        <article className={styles.article}>
          {/* 返回 */}
          <Link href="/news" className={styles.backButton}>
            <FiArrowLeft size={20} />
            <span>{t("backToList")}</span>
          </Link>

          {/* 文章標題區 */}
          <header className={styles.articleHeader}>
            <div className={styles.meta}>
              <span className={styles.category}>
                <FiTag size={16} />
                {article.category}
              </span>
              <span className={styles.date}>
                <FiCalendar size={16} />
                {formatDate(article.publishDate || "")}
              </span>
            </div>
            <h1 className={styles.title}>{article.title}</h1>
          </header>

          {/* 文章配圖 */}
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

          {/* 文章內容 */}
          <div
            className={styles.content}
            dangerouslySetInnerHTML={{ __html: article.content }}
          />
        </article>

        {/* 關聯新聞 */}
        {relatedNews.length > 0 && (
          <section className={styles.relatedNews}>
            <h2 className={styles.relatedTitle}>{t("relatedArticles")}</h2>
            <div className={styles.relatedGrid}>
              {relatedNews.map((news) => (
                <Link
                  key={news.id}
                  href={`/news/${news.slug}`}
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
                    <h3 className={styles.relatedCardTitle}>{news.title}</h3>
                    {news.excerpt && (
                      <p className={styles.relatedExcerpt}>{news.excerpt}</p>
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
    </Layout>
  );
}
