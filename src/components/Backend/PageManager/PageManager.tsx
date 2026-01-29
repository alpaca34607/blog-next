"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import {
  FiEdit,
  FiTrash2,
  FiEye,
  FiEyeOff,
  FiPlus,
  FiLayout,
  FiImage,
  FiExternalLink,
  FiRefreshCw,
} from "react-icons/fi";
import PageModal from "./PageModal";
import styles from "./PageManager.module.scss";
import adminStyles from "@/styles/AdminPagePublic.module.scss";
import { MdOpenInNew } from "react-icons/md";
import {
  API_GetPagesAdmin,
  API_GetPageById,
  API_CreatePage,
  API_UpdatePage,
  API_DeletePage,
} from "@/app/api/admin_api";

interface BasePage {
  id: string;
  title: string;
  slug: string;
  type?: "page" | "product";
  content?: string;
  metaTitle?: string;
  metaDescription?: string;
  // Hero 欄位（頁首輪播/主圖）
  heroImages?: string[] | null;
  isPublished: boolean;
  logo?: string;
  externalUrl?: string;
  category?: string;
  sortOrder?: number;
  createdAt?: string;
  updatedAt?: string;
  _count?: {
    sections: number;
  };
}

interface Page extends BasePage {}

interface Product extends BasePage {
  videoUrl?: string;
  introImage?: string;
  isFeatured?: boolean;
}

type PageType = "page" | "product";

interface PageManagerProps {
  type?: PageType;
  title?: string;
  subtitle?: string;
  addButtonLabel?: string;
}

const PageManager = ({
  type = "page",
  title,
  subtitle,
  addButtonLabel,
}: PageManagerProps = {}) => {
  const [modalOpen, setModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<Page | Product | null>(null);

  // 從 API 載入項目資料
  const loadItems = async () => {
    try {
      setIsLoading(true);
      setError(null);

      const response = await API_GetPagesAdmin({
        filter: type === "product" ? { type: "product" } : { type: "page" },
      });

      if (response?.success) {
        setItems(response.data || []);
      } else {
        setError(response?.error?.message || "載入頁面失敗");
        setItems([]);
      }
    } catch (err) {
      console.error("載入頁面時發生錯誤:", err);
      setError("載入頁面時發生錯誤");
      setItems([]);
    } finally {
      setIsLoading(false);
    }
  };

  const [items, setItems] = useState<(Page | Product)[]>([]);
  const [isClient, setIsClient] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // 在客戶端載入 API 資料
  useEffect(() => {
    setIsClient(true);
    loadItems();
  }, [type]);

  const handleOpenModal = (item: Page | Product | null = null) => {
    setEditingItem(item);
    setModalOpen(true);
  };

  const handleCloseModal = () => {
    setModalOpen(false);
    setEditingItem(null);
  };

  const handleSubmit = async (formData: Partial<Page | Product>) => {
    try {
      setIsLoading(true);
      setError(null);

      const resolvedIsPublished = (formData as any).isPublished ?? false;

      // Hero 欄位：避免送出空白字串/空項，讓後端可乾淨地儲存（可選欄位）
      const heroTitle =
        typeof (formData as any).heroTitle === "string" &&
        (formData as any).heroTitle.trim().length > 0
          ? (formData as any).heroTitle.trim()
          : undefined;
      const heroSubtitle =
        typeof (formData as any).heroSubtitle === "string" &&
        (formData as any).heroSubtitle.trim().length > 0
          ? (formData as any).heroSubtitle.trim()
          : undefined;
      const heroImages = Array.isArray((formData as any).heroImages)
        ? ((formData as any).heroImages as string[]).filter(
            (img) => typeof img === "string" && img.trim().length > 0
          )
        : undefined;

      const apiData = {
        title: formData.title || "",
        slug: formData.slug || "",
        type: type,
        metaTitle: formData.metaTitle,
        metaDescription: formData.metaDescription,
        content: formData.content,
        heroTitle,
        heroSubtitle,
        heroImages,
        logo: (formData as Product).logo,
        // 產品新增欄位：後端尚未落地前，先照規格送出以確保前端 payload 正確
        videoUrl: (formData as Product).videoUrl,
        introImage: (formData as Product).introImage,
        isFeatured: (formData as Product).isFeatured,
        externalUrl: (formData as Product).externalUrl,
        category: (formData as Product).category,
        sortOrder: (formData as Product).sortOrder || 0,
        isPublished: resolvedIsPublished,
      };

      if (editingItem) {
        // 更新項目
        const response = await API_UpdatePage(editingItem.id, apiData);

        if (response?.success) {
          // 重新載入項目列表
          await loadItems();
          if (type === "product" && typeof window !== "undefined") {
            window.dispatchEvent(new Event("productsUpdated"));
          }
        } else {
          setError(response?.error?.message || "更新頁面失敗");
        }
      } else {
        // 新增項目
        const response = await API_CreatePage(apiData);

        if (response?.success) {
          // 重新載入項目列表
          await loadItems();
          if (type === "product" && typeof window !== "undefined") {
            window.dispatchEvent(new Event("productsUpdated"));
          }
        } else {
          setError(response?.error?.message || "創建頁面失敗");
        }
      }

      handleCloseModal();
    } catch (err) {
      console.error("提交頁面時發生錯誤:", err);
      setError("提交頁面時發生錯誤");
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    const confirmMessage =
      type === "product"
        ? "確定要刪除此產品頁面？相關區塊也會一併刪除。"
        : "確定要刪除此頁面？相關區塊也會一併刪除。";
    if (!confirm(confirmMessage)) return;

    try {
      setIsLoading(true);
      setError(null);

      const response = await API_DeletePage(id);

      if (response?.success) {
        // 重新載入項目列表
        await loadItems();
        if (type === "product" && typeof window !== "undefined") {
          window.dispatchEvent(new Event("productsUpdated"));
        }
      } else {
        setError(response?.error?.message || "刪除頁面失敗");
      }
    } catch (err) {
      console.error("刪除頁面時發生錯誤:", err);
      setError("刪除頁面時發生錯誤");
    } finally {
      setIsLoading(false);
    }
  };

  const togglePublish = async (item: Page | Product) => {
    try {
      setIsLoading(true);
      setError(null);

      const response = await API_UpdatePage(item.id, {
        isPublished: !item.isPublished,
      });

      if (response?.success) {
        // 重新載入頁面列表
        await loadItems();
        if (type === "product" && typeof window !== "undefined") {
          window.dispatchEvent(new Event("productsUpdated"));
        }
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

  const displayTitle = title || (type === "product" ? "產品管理" : "頁面管理");
  const displaySubtitle =
    subtitle ||
    (type === "product" ? "建立與管理產品頁面" : "建立與管理網站頁面");
  const displayAddButtonLabel =
    addButtonLabel || (type === "product" ? "新增產品" : "新增頁面");

  return (
    <div className={styles.pageManager}>
      {/* Header */}
      <div className={adminStyles.header}>
        <div className={adminStyles.headerContent}>
          <div>
            <h1 className={adminStyles.title}>{displayTitle}</h1>
            <p className={adminStyles.subtitle}>{displaySubtitle}</p>
          </div>
          <div className={adminStyles.buttonGroup}>
            <button
              className={adminStyles.refreshButton}
              onClick={() => loadItems()}
              disabled={isLoading}
              title="重新載入"
            >
              <FiRefreshCw
                size={16}
                className={isLoading ? styles.spinning : ""}
              />
            </button>
            <button
              className={adminStyles.addButton}
              onClick={() => handleOpenModal(null)}
            >
              <FiPlus size={20} />
              <span>{displayAddButtonLabel}</span>
            </button>
          </div>
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <div className={styles.errorMessage}>
          <p>{error}</p>
          <button onClick={() => loadItems()} className={styles.retryButton}>
            重試
          </button>
        </div>
      )}

      {/* Items Grid */}
      {isLoading ? (
        <div className={styles.loading}>
          <FiRefreshCw size={24} className={styles.spinning} />
          <p>載入中...</p>
        </div>
      ) : !isClient ? (
        <div className={styles.emptyState}>載入中...</div>
      ) : items.length === 0 ? (
        <div className={styles.emptyState}>
          {type === "product"
            ? "尚無產品頁面，點擊上方按鈕新增"
            : "尚無頁面，點擊上方按鈕新增"}
        </div>
      ) : (
        <div className={styles.pagesGrid}>
          {items.map((item) => (
            <div key={item.id} className={styles.pageCard}>
              {/* Hero Image */}
              <div className={styles.heroImageContainer}>
                {item.heroImages && item.heroImages.length > 0 ? (
                  <div
                    className={styles.heroImage}
                    style={{ backgroundImage: `url(${item.heroImages[0]})` }}
                    aria-label="hero 圖片"
                  />
                ) : (
                  <div className={styles.heroPlaceholder}>
                    <FiImage size={48} />
                  </div>
                )}
              </div>

              {/* Card Content */}
              <div className={styles.cardContent}>
                <div className={styles.cardHeader}>
                  <div className={styles.pageInfo}>
                    <h3 className={styles.pageTitle}>{item.title}</h3>
                    <p className={styles.pageSlug}>/{item.slug}</p>
                  </div>
                  <span
                    className={`${styles.statusBadge} ${
                      item.isPublished
                        ? styles.statusPublished
                        : styles.statusDraft
                    }`}
                  >
                    {item.isPublished ? "已發布" : "草稿"}
                  </span>
                </div>

                {/* Action Buttons */}
                <div className={styles.cardActions}>
                  <Link
                    href={`/admin/PageManager/${item.id}/blocks`}
                    className={styles.editBlocksButton}
                  >
                    <FiLayout size={14} />
                    <span>編輯區塊</span>
                  </Link>
                  <div className={styles.actionButtons}>
                    <button
                      className={styles.actionButton}
                      onClick={() => handleOpenModal(item)}
                    >
                      <FiEdit size={14} />
                    </button>
                    <button
                      className={styles.actionButton}
                      onClick={() => togglePublish(item)}
                    >
                      {item.isPublished ? (
                        <FiEye size={14} className={styles.eyeIcon} />
                      ) : (
                        <FiEyeOff size={14} />
                      )}
                    </button>
                    <Link
                      href={`/admin/PageManager/preview?slug=${item.slug}`}
                      className={styles.actionButton}
                    >
                      <MdOpenInNew size={14} />
                    </Link>
                    <button
                      className={`${styles.actionButton} ${styles.deleteButton}`}
                      onClick={() => handleDelete(item.id)}
                    >
                      <FiTrash2 size={14} />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal */}
      <PageModal
        open={modalOpen}
        onClose={handleCloseModal}
        onSubmit={handleSubmit}
        editingPage={editingItem as any}
        type={type}
      />
    </div>
  );
};

export default PageManager;
