"use client";

import { useState, useEffect } from "react";
import Link from "next/link";

import {
  FiEdit,
  FiTrash2,
  FiEye,
  FiEyeOff,
  FiPlus,
  FiStar,
  FiCalendar,
  FiRefreshCw,
} from "react-icons/fi";

import { MdOpenInNew } from "react-icons/md";
import ReactPaginate from "react-paginate";
import NewsModal from "./NewsModal";
import PageSettingsModal from "./PageSettingsModal";
import {
  API_GetNewsAdmin,
  API_GetNewsById,
  API_CreateNews,
  API_UpdateNews,
  API_DeleteNews,
} from "@/app/api/admin_api";
import { useDemoMode } from "@/hooks/useDemoMode";
import styles from "./NewsManager.module.scss";
import adminStyles from "@/styles/AdminPagePublic.module.scss";

type ZodIssueLike = {
  path?: Array<string | number>;
  message?: string;
};

import type { NewsRecord, NewsFormData } from "@/types/news";

type NewsArticle = NewsRecord;

const CATEGORIES = ["技術文章", "媒體報導", "活動訊息"];
const ITEMS_PER_PAGE = 9; // 每頁顯示 9 筆資料
/** 預設以文章發布時間由新到舊排序 */
const DEFAULT_SORT = { sortBy: "publishDate" as const, sortOrder: "desc" as const };

const NewsManager = () => {
  const [modalOpen, setModalOpen] = useState(false);
  const [editingNews, setEditingNews] = useState<NewsArticle | null>(null);
  const [activeCategory, setActiveCategory] = useState("all");
  const [currentPage, setCurrentPage] = useState(0);

  // 從 API 載入新聞資料
  const loadNews = async (params?: {
    page?: number;
    limit?: number;
    search?: string;
    sortBy?: string;
    sortOrder?: "asc" | "desc";
    filter?: Record<string, any>;
  }) => {
    try {
      setIsLoading(true);
      setError(null);

      const response = await API_GetNewsAdmin({ ...DEFAULT_SORT, ...params });

      if (response?.success) {
        setNews(response.data || []);
        setTotalPages(response.pagination?.totalPages || 0);
      } else {
        setError(response?.error?.message || "載入新聞失敗");
        setNews([]);
        setTotalPages(0);
      }
    } catch (err) {
      console.error("載入新聞時發生錯誤:", err);
      setError("載入新聞時發生錯誤");
      setNews([]);
      setTotalPages(0);
    } finally {
      setIsLoading(false);
    }
  };

  const [news, setNews] = useState<NewsArticle[]>([]);
  const [isClient, setIsClient] = useState(false);
  const [pageSettingsModalOpen, setPageSettingsModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [totalPages, setTotalPages] = useState(0);

  // 在客戶端載入 API 資料
  useEffect(() => {
    setIsClient(true);
    loadNews({ page: currentPage + 1, limit: ITEMS_PER_PAGE, ...DEFAULT_SORT });
  }, []);

  // 過濾新聞（前端過濾，因為 API 已經返回分頁數據）
  const filteredNews =
    activeCategory === "all"
      ? news
      : news.filter((n) => n.category === activeCategory);

  // 使用 API 返回的分頁信息
  const pageCount = totalPages;
  const currentNews = filteredNews; // API 已經返回當前頁面的數據

  // 當分類改變時，重置到第一頁並重新載入
  useEffect(() => {
    setCurrentPage(0);
    loadNews({
      page: 1,
      limit: ITEMS_PER_PAGE,
      filter:
        activeCategory !== "all" ? { category: activeCategory } : undefined,
      ...DEFAULT_SORT,
    });
  }, [activeCategory]);

  // 處理分頁變更
  const handlePageChange = async ({ selected }: { selected: number }) => {
    setCurrentPage(selected);

    // 載入新頁面的數據
    await loadNews({ page: selected + 1, limit: ITEMS_PER_PAGE, ...DEFAULT_SORT });

    // 滾動到頂部
    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };

  const handleOpenAddNewsModal = (article: NewsArticle | null = null) => {
    setEditingNews(article);
    setModalOpen(true);
  };

  const handleCloseModal = () => {
    setModalOpen(false);
    setEditingNews(null);
  };

  const normalizePublishDateToIso = (dateValue?: string) => {
    if (!dateValue) return undefined;
    // 若已經是 ISO datetime，直接使用
    if (dateValue.includes("T")) return dateValue;
    const d = new Date(dateValue);
    if (Number.isNaN(d.getTime())) return dateValue; // 讓後端回傳更明確的錯誤
    return d.toISOString();
  };

  const isRichTextEmpty = (html?: string) => {
    if (!html) return true;
    const text = html
      .replace(/<style[\s\S]*?<\/style>/gi, "")
      .replace(/<script[\s\S]*?<\/script>/gi, "")
      .replace(/<[^>]*>/g, " ")
      .replace(/&nbsp;/g, " ")
      .trim();
    return text.length === 0;
  };

  const formatValidationError = (response: any) => {
    const details = response?.error?.details;
    if (!Array.isArray(details))
      return response?.error?.message || "資料格式驗證錯誤";

    const lines = (details as ZodIssueLike[])
      .map((issue) => {
        const field =
          Array.isArray(issue.path) && issue.path.length > 0
            ? issue.path.join(".")
            : "未知欄位";
        const message = issue.message || "資料格式不正確";
        return `- ${field}: ${message}`;
      })
      .filter(Boolean);

    if (lines.length === 0)
      return response?.error?.message || "資料格式驗證錯誤";
    return `資料格式驗證錯誤：\n${lines.join("\n")}`;
  };

  const handleSubmit = async (formData: any) => {
    try {
      setIsLoading(true);
      setError(null);

      if (isRichTextEmpty(formData.content)) {
        setError("資料格式驗證錯誤：\n- content: 內容不能為空");
        return;
      }

      const apiData = {
        title: formData.title,
        titleEn: formData.titleEn,
        slug: formData.slug,
        excerpt: formData.excerpt,
        excerptEn: formData.excerptEn,
        content: formData.content,
        contentEn: formData.contentEn,
        category: formData.category,
        categoryEn: formData.categoryEn,
        isPublished: formData.isPublished,
        isFeatured: formData.isFeatured,
        featuredImage: formData.featuredImage,
        publishDate: normalizePublishDateToIso(formData.publishDate),
      };

      if (editingNews) {
        // 更新新聞
        const response = await API_UpdateNews(editingNews.id, apiData);

        if (response?.success) {
          // 重新載入新聞列表
          await loadNews({ page: currentPage + 1, limit: ITEMS_PER_PAGE, ...DEFAULT_SORT });
        } else {
          setError(formatValidationError(response) || "更新新聞失敗");
        }
      } else {
        // 新增新聞
        const response = await API_CreateNews(apiData);

        if (response?.success) {
          // 重新載入新聞列表
          await loadNews({ page: currentPage + 1, limit: ITEMS_PER_PAGE, ...DEFAULT_SORT });
        } else {
          setError(formatValidationError(response) || "創建新聞失敗");
        }
      }

      handleCloseModal();
    } catch (err) {
      console.error("提交新聞時發生錯誤:", err);
      setError("提交新聞時發生錯誤");
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("確定要刪除此新聞？")) return;

    try {
      setIsLoading(true);
      setError(null);

      const response = await API_DeleteNews(id);

      if (response?.success) {
        // 重新載入新聞列表
        await loadNews({ page: currentPage + 1, limit: ITEMS_PER_PAGE, ...DEFAULT_SORT });
      } else {
        setError(response?.error?.message || "刪除新聞失敗");
      }
    } catch (err) {
      console.error("刪除新聞時發生錯誤:", err);
      setError("刪除新聞時發生錯誤");
    } finally {
      setIsLoading(false);
    }
  };

  const togglePublish = async (article: NewsArticle) => {
    try {
      setIsLoading(true);
      setError(null);

      const response = await API_UpdateNews(article.id, {
        isPublished: !article.isPublished,
      });

      if (response?.success) {
        // 重新載入新聞列表
        await loadNews({ page: currentPage + 1, limit: ITEMS_PER_PAGE, ...DEFAULT_SORT });
      } else {
        setError(response?.error?.message || "更新發布狀態失敗");
      }
    } catch (err) {
      console.error("切換發布狀態時發生錯誤:", err);
      setError("切換發布狀態時發生錯誤");
    } finally {
      setIsLoading(false);
    }
  };

  // DEMO 模式下，正式資料（demoWorkspaceId === ""）為唯讀
  const { isDemoMode, isItemReadOnly } = useDemoMode();

  const toggleFeatured = async (article: NewsArticle) => {
    try {
      setIsLoading(true);
      setError(null);

      const response = await API_UpdateNews(article.id, {
        isFeatured: !article.isFeatured,
      });

      if (response?.success) {
        // 重新載入新聞列表
        await loadNews({ page: currentPage + 1, limit: ITEMS_PER_PAGE, ...DEFAULT_SORT });
      } else {
        setError(response?.error?.message || "更新精選狀態失敗");
      }
    } catch (err) {
      console.error("切換精選狀態時發生錯誤:", err);
      setError("切換精選狀態時發生錯誤");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className={styles.newsManager}>
      {/* Header */}
      <div className={adminStyles.header}>
        <div className={adminStyles.headerContent}>
          <div>
            <h1 className={adminStyles.title}>最新消息管理</h1>
            <p className={adminStyles.subtitle}>發布與管理新聞文章</p>
          </div>
          <div className={adminStyles.buttonGroup}>
            <button
              className={adminStyles.refreshButton}
              onClick={() =>
                loadNews({ page: currentPage + 1, limit: ITEMS_PER_PAGE, ...DEFAULT_SORT })
              }
              disabled={isLoading}
              title="重新載入新聞"
            >
              <FiRefreshCw
                size={16}
                className={isLoading ? styles.spinning : ""}
              />
            </button>
            <button
              className={`${adminStyles.addButton} ${adminStyles.addButtonLg}`}
              onClick={() => setPageSettingsModalOpen(true)}
            >
              <span>新聞列表頁面設置</span>
            </button>
            <button
              className={`${adminStyles.addButton} ${adminStyles.addButtonLg}`}
              onClick={() => handleOpenAddNewsModal(null)}
            >
              <FiPlus size={20} /> <span>新增新聞</span>
            </button>
          </div>
        </div>
      </div>
      <div className={adminStyles.container}>
        {/* news list設置 */}
        <div className={adminStyles.container}>
          {/* Category Tabs */}
          <div className={adminStyles.tabs}>
            <button
              className={`${adminStyles.tab}

      ${activeCategory === "all" ? adminStyles.tabActive : ""}

      `}
              onClick={() => setActiveCategory("all")}
            >
              全部
            </button>
            {CATEGORIES.map((cat) => (
              <button
                key={cat}
                className={`${adminStyles.tab}

            ${activeCategory === cat ? adminStyles.tabActive : ""}

            `}
                onClick={() => setActiveCategory(cat)}
              >
                {cat}
              </button>
            ))}
          </div>
          {/* Error Message */}
          {error && (
            <div className={styles.errorMessage}>
              <p style={{ whiteSpace: "pre-line" }}>{error}</p>
              <button
                onClick={() =>
                  loadNews({ page: currentPage + 1, limit: ITEMS_PER_PAGE, ...DEFAULT_SORT })
                }
                className={styles.retryButton}
              >
                重試
              </button>
            </div>
          )}

          {/* News Grid */}
          {isLoading ? (
            <div className={styles.loading}>
              <FiRefreshCw size={24} className={styles.spinning} />
              <p>載入中...</p>
            </div>
          ) : !isClient ? (
            <div className={styles.emptyState}>載入中...</div>
          ) : filteredNews.length === 0 ? (
            <div className={styles.emptyState}>尚無新聞，點擊上方按鈕新增</div>
          ) : (
            <>
              <div className={styles.newsGrid}>
                {currentNews.map((article) => (
                  <div
                    key={article.id}
                    className={`${styles.newsCard} ${
                      isItemReadOnly(article) ? styles.newsCardReadOnly : ""
                    }`}
                  >
                    {/* Featured Image */}
                    <div className={styles.imageContainer}>
                      {article.featuredImage ? (
                        <div
                          className={styles.featuredImage}
                          style={{
                            backgroundImage: `url(${article.featuredImage})`,
                          }}
                        />
                      ) : (
                        <div className={styles.imagePlaceholder}>
                          <span>📰</span>
                        </div>
                      )}
                    </div>
                    {/* Card Content */}
                    <div className={styles.cardContent}>
                      <div className={styles.badges}>
                        {isItemReadOnly(article) && (
                          <span className={styles.readOnlyBadge} title="正式網站資料，僅供檢視">
                            系統資料
                          </span>
                        )}
                        <span className={styles.categoryBadge}>
                          {article.category}
                        </span>
                        {article.isFeatured && (
                          <FiStar
                            className={styles.starIcon}
                            size={14}
                            onClick={
                              isItemReadOnly(article)
                                ? undefined
                                : () => toggleFeatured(article)
                            }
                            title={isItemReadOnly(article) ? "正式資料" : "精選"}
                          />
                        )}
                        <span
                          className={`${styles.statusBadge} ${
                            article.isPublished
                              ? styles.statusPublished
                              : styles.statusDraft
                          }`}
                        >
                          {article.isPublished ? "已發布" : "草稿"}
                        </span>
                      </div>
                      <h3 className={styles.newsTitle}> {article.title}</h3>
                      {article.excerpt && (
                        <p className={styles.excerpt}> {article.excerpt}</p>
                      )}
                      {/* Footer */}
                      <div className={styles.cardFooter}>
                        <div className={styles.date}>
                          <FiCalendar size={14} />
                          <span>
                            {article.publishDate
                              ? new Date(
                                  article.publishDate
                                ).toLocaleDateString("zh-TW")
                              : ""}
                          </span>
                        </div>
                        <div className={styles.actions}>
                          {!isItemReadOnly(article) && (
                            <>
                              <button
                                className={styles.actionButton}
                                onClick={() => handleOpenAddNewsModal(article)}
                                title="編輯"
                              >
                                <FiEdit size={14} />
                              </button>
                              <button
                                className={styles.actionButton}
                                onClick={() => togglePublish(article)}
                                title={article.isPublished ? "取消發布" : "發布"}
                              >
                                {article.isPublished ? (
                                  <FiEye size={14} />
                                ) : (
                                  <FiEyeOff size={14} />
                                )}
                              </button>
                            </>
                          )}
                          <Link
                            href={`/admin/NewsManager/preview?slug=${article.slug}`}
                            className={styles.actionButton}
                            title="預覽新聞頁面"
                          >
                            <MdOpenInNew size={14} />
                          </Link>
                          {!isItemReadOnly(article) && (
                            <button
                              className={`${styles.actionButton} ${styles.deleteButton}`}
                              onClick={() => handleDelete(article.id)}
                              title="刪除"
                            >
                              <FiTrash2 size={14} />
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              {/* Pagination */}
              {pageCount > 1 && (
                <div className={styles.paginationWrapper}>
                  <ReactPaginate
                    previousLabel="上一頁"
                    nextLabel="下一頁"
                    breakLabel="..."
                    pageCount={pageCount}
                    marginPagesDisplayed={1}
                    pageRangeDisplayed={3}
                    onPageChange={handlePageChange}
                    forcePage={currentPage}
                    containerClassName={styles.pagination}
                    pageClassName={styles.pageItem}
                    pageLinkClassName={styles.pageLink}
                    previousClassName={styles.pageItem}
                    previousLinkClassName={styles.pageLink}
                    nextClassName={styles.pageItem}
                    nextLinkClassName={styles.pageLink}
                    breakClassName={styles.pageItem}
                    breakLinkClassName={styles.pageLink}
                    activeClassName={styles.active}
                    disabledClassName={styles.disabled}
                  />
                </div>
              )}
            </>
          )}
          {/* Modals */}
          <NewsModal
            open={modalOpen}
            onClose={handleCloseModal}
            onSubmit={handleSubmit}
            editingNews={editingNews as any}
          />
          <PageSettingsModal
            open={pageSettingsModalOpen}
            onClose={() => setPageSettingsModalOpen(false)}
          />
        </div>
      </div>
    </div>
  );
};

export default NewsManager;
