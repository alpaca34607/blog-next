"use client";

import Image from "next/image";
import { cn } from "@/utils/cn";
import styles from "./Footer.module.scss";
import {
  FaFacebookF,
  FaYoutube,
  FaPhone,
  FaMapMarkerAlt,
  FaEnvelope,
} from "react-icons/fa";
import { SiLine } from "react-icons/si";
import { useEffect, useState } from "react";
import { Link } from "@/navigation";
import {
  API_GetSiteSettings,
  API_GetNavigationItem,
  API_GetProducts,
  API_GetNews,
} from "@/app/api/public_api";

const Footer = () => {
  interface SiteSettings {
    siteName: string;
    siteNameEn?: string;
    logo?: string;
    footerLogo?: string;
    phone?: string;
    email?: string;
    address?: string;
    lineQrCode?: string;
    socialLinks?: {
      facebook?: string;
      line?: string;
      youtube?: string;
    };
    copyright?: string;
    additionalLinks?: { title: string; url: string }[];
  }
  interface NavigationItem {
    id: string;
    title: string;
    slug: string; // 轉成前台路由用的 slug（從 url 推導）
    parentId?: string | null;
    sortOrder: number;
    type: "internal" | "external";
    url?: string | null;
    isVisible: boolean;
    hasChildren?: boolean;
  }
  interface Product {
    id: string;
    title: string;
    slug: string;
    category?: string | null;
    isPublished: boolean;
  }
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
  const [siteSettings, setSiteSettings] = useState<SiteSettings | null>(null);
  const [NavigationItem, setNavigationItem] = useState<NavigationItem[]>([]);
  const [productList, setProductList] = useState<Product[]>([]);
  const [newsList, setNewsList] = useState<NewsArticle[]>([]);
  const [siteSettingsLoading, setSiteSettingsLoading] = useState(true);
  const [navigationLoading, setNavigationLoading] = useState(true);
  const [productsLoading, setProductsLoading] = useState(true);

  // 載入網站設定
  useEffect(() => {
    const fetchSiteSettings = async () => {
      try {
        const response = await API_GetSiteSettings();
        if (response?.success) {
          const data: any = response.data;
          setSiteSettings({
            siteName: data?.siteName || "",
            siteNameEn: data?.siteNameEn || "",
            logo: data?.logo || "",
            footerLogo: data?.footerLogo || "",
            phone: data?.phone || "",
            email: data?.email || "",
            address: data?.address || "",
            lineQrCode: data?.lineQrCode || "",
            socialLinks: data?.socialLinks || {},
            copyright: data?.copyright || "",
            additionalLinks: Array.isArray(data?.additionalLinks)
              ? data.additionalLinks.map((l: any) => ({
                  title: l?.title || "",
                  url: l?.url || "",
                }))
              : [],
          });
        } else {
          console.error(
            "取得網站設定失敗:",
            response?.error?.message || "未知錯誤"
          );
        }
      } catch (error) {
        // 處理意外錯誤
        console.error("載入網站設定時發生錯誤:", error);
      } finally {
        setSiteSettingsLoading(false);
      }
    };
    fetchSiteSettings();
  }, []);
  // 載入導覽資料
  useEffect(() => {
    // 從 API 獲取導覽資料
    const fetchNavigationItem = async () => {
      try {
        const response = await API_GetNavigationItem();
        if (response?.success) {
          const items: any[] = Array.isArray(response.data)
            ? response.data
            : [];
          const mapped: NavigationItem[] = items.map((item: any) => ({
            id: item.id,
            title: item.title,
            slug: item?.url ? String(item.url).replace(/^\//, "") : "",
            parentId: item.parentId ?? null,
            sortOrder: item.sortOrder ?? 0,
            type: item.type === "external" ? "external" : "internal",
            url: item.url ?? null,
            isVisible: item.isVisible !== false,
            hasChildren: Array.isArray(item.children)
              ? item.children.length > 0
              : false,
          }));
          setNavigationItem(mapped);
        } else {
          console.error(
            "取得導航列失敗:",
            response?.error?.message || "未知錯誤"
          );
        }
      } catch (error) {
        console.error("載入導航列時發生錯誤:", error);
      } finally {
        setNavigationLoading(false);
      }
    };

    // 監聽導覽資料更新事件
    const handleNavigationUpdated = () => {
      // 改為直接重新呼叫 API，避免依賴 localStorage
      fetchNavigationItem().catch(() => {});
    };

    fetchNavigationItem();
    window.addEventListener("navigationUpdated", handleNavigationUpdated);

    return () => {
      window.removeEventListener("navigationUpdated", handleNavigationUpdated);
    };
  }, []);

  // 載入產品資料
  useEffect(() => {
    // 從 API 獲取產品資料
    const fetchProducts = async () => {
      try {
        const response = await API_GetProducts();
        if (response?.success) {
          const items: any[] = Array.isArray(response.data)
            ? response.data
            : [];
          const mapped: Product[] = items.map((p: any) => ({
            id: p.id,
            title: p.title,
            slug: p.slug,
            category: p.category ?? null,
            isPublished: !!p.isPublished,
          }));
          setProductList(mapped.filter((p) => p.isPublished));
        } else {
          console.error(
            "取得產品列表失敗:",
            response?.error?.message || "未知錯誤"
          );
        }
      } catch (error) {
        console.error("載入產品列表時發生錯誤:", error);
      } finally {
        setProductsLoading(false);
      }
    };

    // 監聽產品資料更新事件
    const handleProductsUpdated = () => {
      // 改為直接重新呼叫 API，避免依賴 localStorage
      fetchProducts().catch(() => {});
    };

    fetchProducts();
    window.addEventListener("productsUpdated", handleProductsUpdated);

    return () => {
      window.removeEventListener("productsUpdated", handleProductsUpdated);
    };
  }, []);

  // 載入最新消息資料
  useEffect(() => {
    // 從 API 獲取新聞資料
    const fetchNews = async () => {
      try {
        const response = await API_GetNews();
        if (response?.success) {
          const items: any[] = Array.isArray(response.data)
            ? response.data
            : [];
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
          const publishedNews = mapped.filter((n) => n.isPublished).slice(0, 3);
          setNewsList(publishedNews);
        } else {
          console.error(
            "取得新聞列表失敗:",
            response?.error?.message || "未知錯誤"
          );
        }
      } catch (error) {
        console.error("載入新聞列表時發生錯誤:", error);
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

  // 過濾掉子選單（只顯示第一層項目）
  const parentItems = NavigationItem.filter((item) => !item.parentId).sort(
    (a, b) => a.sortOrder - b.sortOrder
  );

  return (
    <footer className={styles.siteFooter}>
      <div className={styles.footerContainer}>
        {/* Top Section */}
        <div className={styles.footerTop}>
          <div className={cn(styles.footerColumn, styles.footerColumnCompany)}>
            <div className={styles.footerLogo}>
              <Image
                src={siteSettings?.logo || "/images/logo.png"}
                alt="BLOGCRAFT Logo"
                width={200}
                height={60}
                className={styles.footerLogoImg}
              />
              <p className={styles.footerCompanyName}>
                {siteSettings?.siteNameEn || "Blogcraft Co., Ltd."}
              </p>
              <p className={styles.footerCompanyNameChinese}>
                {siteSettings?.siteName || "布創設計股份有限公司"}
              </p>
            </div>
            <div className={styles.footerDivider} />
            <div className={styles.footerRecruitSocial}>
              <span className={styles.footerRecruit}>社群連結</span>
              <div className={styles.footerSocialIcons}>
                <a
                  href={siteSettings?.socialLinks?.facebook || "#"}
                  className={styles.footerSocialIcon}
                  aria-label="Facebook"
                  target="_blank"
                >
                  <FaFacebookF />
                </a>
                <a
                  href={siteSettings?.socialLinks?.line || "#"}
                  className={styles.footerSocialIcon}
                  aria-label="LINE"
                  target="_blank"
                >
                  <SiLine />
                </a>
                <a
                  href={siteSettings?.socialLinks?.youtube || "#"}
                  className={styles.footerSocialIcon}
                  aria-label="YouTube"
                  target="_blank"
                >
                  <FaYoutube />
                </a>
              </div>
            </div>
            {siteSettings?.additionalLinks &&
              siteSettings.additionalLinks.length > 0 && (
                <div className={styles.footerAdditionalLinks}>
                  {siteSettings.additionalLinks.map((link) => (
                    <a key={link.title} href={link.url}>
                      {link.title}
                    </a>
                  ))}
                </div>
              )}
            {/* <div className={styles.footerAdditionalLinks}>
              <a>資通安全政策</a>
            </div> */}
          </div>

          {productList.length > 0 && (
            <div
              className={cn(styles.footerColumn, styles.footerColumnSolutions)}
            >
              <h3 className={styles.footerColumnTitle}>創新解決方案</h3>
              <ul className={styles.footerList}>
                {productList.map((product) => (
                  <li key={product.id}>
                    <Link href={`/${product.slug}`}>{product.title}</Link>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {parentItems.length > 0 && (
            <div className={cn(styles.footerColumn, styles.footerColumnAbout)}>
              <h3 className={styles.footerColumnTitle}>關於我們</h3>
              <ul className={styles.footerList}>
                {parentItems.map((item) =>
                  item.type === "external" && item.url ? (
                    <li key={item.id}>
                      <a href={item.url} target="_blank" rel="noopener noreferrer">
                        {item.title}
                      </a>
                    </li>
                  ) : (
                    <li key={item.id}>
                      <Link href={item.slug ? `/${item.slug}` : "/"}>
                        {item.title}
                      </Link>
                    </li>
                  )
                )}
              </ul>
            </div>
          )}

          {newsList.length > 0 && (
            <div className={cn(styles.footerColumn, styles.footerColumnNews)}>
              <h3 className={styles.footerColumnTitle}>最新消息</h3>
              <ul className={cn(styles.footerList, styles.footerListNews)}>
                {newsList.map((news) => (
                  <li key={news.id}>
                    <Link href={`/news/${news.slug}`}>{news.title}</Link>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>

        {/* Bottom Section */}
        <div className={styles.footerBottom}>
          <div className={styles.footerContact}>
            <div className={styles.footerContactItem}>
              <FaPhone className={styles.footerContactIcon} />
              <span>{siteSettings?.phone || "02-1234-5678"}</span>
            </div>
            <div className={styles.footerContactItem}>
              <FaMapMarkerAlt className={styles.footerContactIcon} />
              <div className={styles.footerAddresses}>
                <span>
                  {siteSettings?.address || "台北市中正區忠孝東路走9遍"}
                </span>
              </div>
            </div>
            <div className={styles.footerContactItem}>
              <FaEnvelope className={styles.footerContactIcon} />
              <span>{siteSettings?.email || "alpaca34607@gmail.com"}</span>
            </div>
          </div>
        </div>
        <div className={styles.footerCopyright}>
          <p>
            {siteSettings?.copyright ||
              "Copyright © 2025 Blogcraft Co., Ltd. All rights reserved."}
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
