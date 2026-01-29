"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import {
  FiFileText,
  FiFile,
  FiUsers,
  FiArrowRight,
  FiSettings,
  FiRefreshCw,
} from "react-icons/fi";
import Image from "next/image";
import { API_GetDashboardStats } from "@/app/api/admin_api";
import styles from "./Dashboard.module.scss";
import adminStyles from "@/styles/AdminPagePublic.module.scss";

// 對應 NewsManager 中的新聞資料結構（僅抓取 Dashboard 需要的欄位）
interface NewsArticle {
  id: string;
  title: string;
  category: string;
  publishDate: string;
  featuredImage: string;
  isPublished?: boolean;
}

// 對應 PageManager 中的頁面/產品結構（僅需用來計算數量）
interface BaseItem {
  id: string;
}

// Dashboard 顯示用的統計卡片
interface StatItem {
  label: string;
  value: string;
  icon: React.ComponentType<{ size?: number }>;
}

// Dashboard 顯示用的最新消息項目
interface DashboardNewsItem {
  id: string;
  title: string;
  category: string;
  date: string;
  thumbnail: string;
}

// 預設頁面資料（與 PageManager 預設資料保持一致）
const DEFAULT_PAGES: BaseItem[] = [
  { id: "1" },
  { id: "2" },
  { id: "3" },
  { id: "4" },
];

// 預設新聞資料（與 NewsManager 預設資料保持一致，僅取必要欄位）
const DEFAULT_NEWS: NewsArticle[] = [
  {
    id: "1",
    title: "智慧時代的核心力量：AI 伺服器應用與未來局",
    category: "媒體報導",
    publishDate: "2025-11-13",
    featuredImage: "/images/news/0814.png",
    isPublished: true,
  },
];

const Dashboard = () => {
  // 統計數據狀態：頁面數量 / 新聞文章 / 產品管理
  const [stats, setStats] = useState<StatItem[]>([
    { label: "頁面數量", value: "0", icon: FiFileText },
    { label: "新聞文章", value: "0", icon: FiFile },
    { label: "產品管理", value: "0", icon: FiUsers },
  ]);

  // 最新消息列表（從 API 取得）
  const [latestNews, setLatestNews] = useState<DashboardNewsItem[]>([]);

  // 載入狀態
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // 是否已在瀏覽器端（避免 SSR 時存取 window/localStorage）
  const [isClient, setIsClient] = useState(false);

  // 從 API 讀取並更新 Dashboard 所需資料
  const loadDashboardData = async () => {
    try {
      setIsLoading(true);
      setError(null);

      const response = await API_GetDashboardStats();

      if (response?.success) {
        const data = response.data;

        // 更新統計卡片數字
        setStats([
          {
            label: "頁面數量",
            value: String(data.overview.totalPages),
            icon: FiFileText,
          },
          {
            label: "新聞文章",
            value: String(data.overview.totalNews),
            icon: FiFile,
          },
          {
            label: "產品管理",
            value: String(data.overview.totalProducts),
            icon: FiUsers,
          },
        ]);

        // 設置最新消息
        setLatestNews(data.latestNews || []);
      } else {
        setError(response?.error?.message || "獲取統計數據失敗");
        // 設置預設值
        setStats([
          { label: "頁面數量", value: "0", icon: FiFileText },
          { label: "新聞文章", value: "0", icon: FiFile },
          { label: "產品管理", value: "0", icon: FiUsers },
        ]);
        setLatestNews([]);
      }
    } catch (err) {
      console.error("載入儀表板數據時發生錯誤:", err);
      setError("載入數據時發生錯誤");
      // 設置預設值
      setStats([
        { label: "頁面數量", value: "0", icon: FiFileText },
        { label: "新聞文章", value: "0", icon: FiFile },
        { label: "產品管理", value: "0", icon: FiUsers },
      ]);
      setLatestNews([]);
    } finally {
      setIsLoading(false);
    }
  };

  // 首次在客戶端執行時載入資料
  useEffect(() => {
    setIsClient(true);
    loadDashboardData();
  }, []);

  const quickActions = [
    { label: "新增頁面", icon: FiFileText, href: "/admin/PageManager" },
    { label: "發布新聞", icon: FiFile, href: "/admin/NewsManager" },
    { label: "產品管理", icon: FiUsers, href: "/admin/ProductsManager" },
    { label: "網站設定", icon: FiSettings, href: "/admin/SiteSettingsManager" },
  ];

  return (
    <div className={styles.dashboard}>
      {/* Header */}
      <div className={adminStyles.headerLg}>
        <div className={adminStyles.headerContent}>
          <div>
            <h1 className={adminStyles.title}>Dashboard</h1>
            <p className={adminStyles.subtitle}>歡迎來到網站管理後台</p>
          </div>
          <div className={adminStyles.buttonGroup}>
            <button
              onClick={loadDashboardData}
              disabled={isLoading}
              className={adminStyles.refreshButton}
              title="重新載入數據"
            >
              <FiRefreshCw
                size={16}
                className={isLoading ? styles.spinning : ""}
              />
            </button>
          </div>
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <div className={styles.errorMessage}>
          <p>{error}</p>
          <button onClick={loadDashboardData} className={styles.retryButton}>
            重試
          </button>
        </div>
      )}

      {/* Loading State */}
      {isLoading && (
        <div className={styles.loading}>
          <FiRefreshCw size={24} className={styles.spinning} />
          <p>載入中...</p>
        </div>
      )}

      {/* Stats Cards */}
      {!isLoading && (
        <div className={styles.statsGrid}>
          {stats.map((stat, index) => {
            const Icon = stat.icon;
            return (
              <div key={index} className={styles.statCard}>
                <div className={styles.statContent}>
                  <div className={styles.statInfo}>
                    <p className={styles.statValue}>{stat.value}</p>
                    <p className={styles.statLabel}>{stat.label}</p>
                  </div>
                  <div className={styles.statIcon}>
                    <Icon size={32} />
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Main Content Grid */}
      {!isLoading && (
        <div className={styles.contentGrid}>
          {/* Latest News Section */}
          <div className={styles.newsSection}>
            <div className={styles.sectionHeader}>
              <h2 className={styles.sectionTitle}>最新消息</h2>
              <Link href="/admin/NewsManager" className={styles.viewAllLink}>
                查看全部 <FiArrowRight size={16} />
              </Link>
            </div>
            <div className={styles.newsList}>
              {latestNews.length > 0 ? (
                latestNews.map((news) => (
                  <div key={news.id} className={styles.newsItem}>
                    <div className={styles.newsThumbnail}>
                      <Image
                        src={news.thumbnail}
                        alt={news.title}
                        width={80}
                        height={80}
                        className={styles.newsImage}
                      />
                    </div>
                    <div className={styles.newsContent}>
                      <h3 className={styles.newsTitle}>{news.title}</h3>
                      <div className={styles.newsMeta}>
                        <span className={styles.newsCategory}>
                          {news.category}
                        </span>
                        <span className={styles.newsDate}>{news.date}</span>
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className={styles.noNews}>
                  <p>目前沒有最新消息</p>
                </div>
              )}
            </div>
          </div>

          {/* Quick Actions Section */}
          <div className={styles.quickActionsSection}>
            <h2 className={styles.sectionTitle}>快速操作</h2>
            <div className={styles.quickActionsGrid}>
              {quickActions.map((action, index) => {
                const Icon = action.icon;
                return (
                  <Link
                    key={index}
                    href={action.href}
                    className={styles.quickActionCard}
                  >
                    <Icon size={24} />
                    <span className={styles.quickActionLabel}>
                      {action.label}
                    </span>
                  </Link>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard;
