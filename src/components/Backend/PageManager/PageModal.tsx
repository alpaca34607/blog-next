"use client";
import { useState, useEffect } from "react";
import { FiX } from "react-icons/fi";
import ImageUploader from "@/components/forms/ImageUploader";
import {
  HeroSectionForm,
  HeroSectionFormValue,
} from "../PageSectionSettingsForm";
import styles from "./PageModal.module.scss";

interface BasePage {
  id?: string;
  title: string;
  slug: string;
  isPublished?: boolean;
  metaTitle?: string;
  metaDescription?: string;
  heroTitle?: string;
  heroSubtitle?: string;
  heroImages?: string[];
}

interface Page extends BasePage {}

interface Product extends BasePage {
  logo?: string;
  videoUrl?: string;
  introImage?: string;
  category?: string;
  navOrder?: number;
  isFeatured?: boolean;
  externalUrl?: string;
  sortOrder?: number;
}

type PageType = "page" | "product";

interface PageModalProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (data: Partial<Page | Product>) => void;
  editingPage: Page | Product | null;
  type?: PageType;
}

const PageModal = ({
  open,
  onClose,
  onSubmit,
  editingPage,
  type = "page",
}: PageModalProps) => {
  const [formData, setFormData] = useState<Partial<Page | Product>>({
    title: "",
    slug: "",
    metaTitle: "",
    metaDescription: "",
    heroTitle: "",
    heroSubtitle: "",
    heroImages: [],
    isPublished: false,
    ...(type === "product" && {
      logo: "",
      videoUrl: "",
      category: "",
      sortOrder: 0,
    }),
  });

  useEffect(() => {
    if (editingPage) {
      setFormData({
        title: editingPage.title || "",
        slug: editingPage.slug || "",
        metaTitle: (editingPage as any).metaTitle || "",
        metaDescription: (editingPage as any).metaDescription || "",
        heroTitle: (editingPage as any).heroTitle || "",
        heroSubtitle: (editingPage as any).heroSubtitle || "",
        heroImages: (editingPage as any).heroImages || [],
        isPublished: (editingPage as any).isPublished ?? false,
        ...(type === "product" && {
          logo: (editingPage as Product).logo || "",
          videoUrl: (editingPage as Product).videoUrl || "",
          externalUrl: (editingPage as Product).externalUrl || "",
          introImage: (editingPage as Product).introImage || "",
          category: (editingPage as Product).category || "",
          sortOrder: (editingPage as Product).sortOrder || 0,
          isFeatured: (editingPage as Product).isFeatured || false,
        }),
      });
    } else {
      setFormData({
        title: "",
        slug: "",
        metaTitle: "",
        metaDescription: "",
        heroTitle: "",
        heroSubtitle: "",
        heroImages: [],
        isPublished: false,
        ...(type === "product" && {
          logo: "",
          videoUrl: "",
          category: "",
          sortOrder: 0,
          isFeatured: false,
        }),
      });
    }
  }, [editingPage, open, type]);

  useEffect(() => {
    if (open) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title || !formData.slug) {
      alert(`請填寫${type === "product" ? "產品" : "頁面"}標題和 Slug`);
      return;
    }
    onSubmit(formData);
  };

  if (!open) return null;

  const modalTitle = editingPage
    ? type === "product"
      ? "編輯產品"
      : "編輯頁面"
    : type === "product"
    ? "新增產品"
    : "新增頁面";
  const titleLabel = type === "product" ? "產品標題" : "頁面標題";

  return (
    <div className={styles.modalOverlay}>
      <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
        <div className={styles.modalHeader}>
          <h2 className={styles.modalTitle}>{modalTitle}</h2>
          <button className={styles.closeButton} onClick={onClose}>
            <FiX size={24} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className={styles.form}>
          {/* 基本資訊 */}
          <div className={styles.formSection}>
            <h3 className={styles.sectionTitle}>基本資訊</h3>
            <div className={styles.formGrid}>
              <div className={styles.formGroup}>
                <label className={styles.label}>
                  {titleLabel} <span className={styles.required}>*</span>
                </label>
                <input
                  type="text"
                  className={styles.input}
                  value={formData.title}
                  onChange={(e) =>
                    setFormData({ ...formData, title: e.target.value })
                  }
                  placeholder="例如：關於布創"
                  required
                />
              </div>
              <div className={styles.formGroup}>
                <label className={styles.label}>
                  Slug (URL路徑) <span className={styles.required}>*</span>
                </label>
                <input
                  type="text"
                  className={styles.input}
                  value={formData.slug}
                  onChange={(e) =>
                    setFormData({ ...formData, slug: e.target.value })
                  }
                  placeholder="例如：about-us"
                  required
                />
              </div>
            </div>

            {/* 產品專屬欄位 */}
            {type === "product" && (
              <>
                <div className={styles.formGrid}>
                  <div className={styles.formGroup}>
                    <label className={styles.label}>產品分類</label>
                    <input
                      type="text"
                      className={styles.input}
                      value={(formData as Product).category || ""}
                      onChange={(e) =>
                        setFormData({ ...formData, category: e.target.value })
                      }
                      placeholder="例如：軟體、硬體"
                    />
                  </div>
                  <div className={styles.formGroup}>
                    <label className={styles.label}>導覽選單排序</label>
                    <input
                      type="number"
                      className={styles.input}
                      value={(formData as Product).sortOrder || 0}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          sortOrder: parseInt(e.target.value) || 0,
                        })
                      }
                      placeholder="0"
                    />
                  </div>
                </div>

                <div className={styles.formGroup}>
                  <label className={styles.label}>產品影片</label>
                  <input
                    type="url"
                    className={styles.input}
                    value={(formData as Product).videoUrl || ""}
                    onChange={(e) =>
                      setFormData({ ...formData, videoUrl: e.target.value })
                    }
                    placeholder="https://www.youtube.com/watch?v=dQw4w9WgXcQ"
                  />
                </div>
                <div className={styles.formGroup}>
                  <label className={styles.label}>產品官網
                  </label>
                  <input
                    type="url"
                    className={styles.input}
                    value={(formData as Product).externalUrl || ""}
                    onChange={(e) =>
                      setFormData({ ...formData, externalUrl: e.target.value })
                    }
                    placeholder="https://example.com"
                  />
                </div>
              </>
            )}
          </div>

          {/* SEO 設定 */}
          <div className={styles.formSection}>
            <h3 className={styles.sectionTitle}>SEO 設定</h3>
            <div className={styles.formGroup}>
              <label className={styles.label}>Meta 標題</label>
              <input
                type="text"
                className={styles.input}
                value={formData.metaTitle || ""}
                onChange={(e) =>
                  setFormData({ ...formData, metaTitle: e.target.value })
                }
                placeholder="搜尋引擎顯示的標題"
              />
              <p className={styles.helpText}>搜尋引擎顯示的標題</p>
            </div>
            <div className={styles.formGroup}>
              <label className={styles.label}>Meta 描述</label>
              <textarea
                className={styles.textarea}
                value={formData.metaDescription || ""}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    metaDescription: e.target.value,
                  })
                }
                placeholder="搜尋引擎顯示的描述文字"
                rows={2}
              />
              <p className={styles.helpText}>搜尋引擎顯示的描述文字</p>
            </div>
          </div>

          {/* 頁首區塊 */}
          <HeroSectionForm
            value={{
              title: (formData as any).heroTitle,
              subtitle: (formData as any).heroSubtitle,
              heroImages: (formData as any).heroImages,
            }}
            onChange={(heroValue: HeroSectionFormValue) => {
              setFormData({
                ...formData,
                heroTitle: heroValue.title,
                heroSubtitle: heroValue.subtitle,
                heroImages: heroValue.heroImages,
              });
            }}
          />

          {/* 產品 Logo（僅產品模式） */}
          {type === "product" && (
            <div className={styles.formSection}>
              <div className={styles.formGroup}>
                <label className={styles.label}>產品 Logo</label>
                <div className={styles.imageUploader}>
                  {(formData as Product).logo ? (
                    <div className={styles.imagePreview}>
                      <img
                        src={(formData as Product).logo}
                        alt="Logo preview"
                      />
                      <button
                        type="button"
                        className={styles.removeImage}
                        onClick={() => setFormData({ ...formData, logo: "" })}
                      >
                        <FiX size={16} />
                      </button>
                    </div>
                  ) : (
                    <ImageUploader
                      onUpload={(url) =>
                        setFormData({ ...formData, logo: url })
                      }
                      buttonLabel="上傳產品 Logo"
                    />
                  )}
                </div>
              </div>
            </div>
          )}
          {/* 產品 說明圖片（僅產品模式） */}
          {type === "product" && (
            <div className={styles.formSection}>
              <div className={styles.formGroup}>
                <label className={styles.label}>產品 說明圖片</label>
                <div className={styles.imageUploader}>
                  {(formData as Product).introImage ? (
                    <div className={styles.imagePreview}>
                      <img
                        src={(formData as Product).introImage}
                        alt="Info images preview"
                      />
                      <button
                        type="button"
                        className={styles.removeImage}
                        onClick={() =>
                          setFormData({ ...formData, introImage: "" })
                        }
                      >
                        <FiX size={16} />
                      </button>
                    </div>
                  ) : (
                    <ImageUploader
                      onUpload={(url) =>
                        setFormData({ ...formData, introImage: url })
                      }
                      buttonLabel="上傳產品 說明圖片"
                    />
                  )}
                </div>
              </div>
            </div>
          )}
          {type === "product" && (
            <>
              <div className={styles.switchGroup}>
                <label className={styles.label}>顯示於首頁服務區塊</label>
                <label className={styles.switch}>
                  <input
                    type="checkbox"
                    checked={(formData as Product).isFeatured || false}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        isFeatured: e.target.checked,
                      })
                    }
                  />
                  <span className={styles.slider}></span>
                </label>
              </div>
            </>
          )}
          {/* 立即發布 */}
          <div className={styles.formSection}>
            <div className={styles.switchGroup}>
              <label className={styles.label}>立即發布</label>
              <label className={styles.switch}>
                <input
                  type="checkbox"
                  checked={(formData as any).isPublished ?? false}
                  onChange={(e) =>
                    setFormData({ ...formData, isPublished: e.target.checked })
                  }
                />
                <span className={styles.slider}></span>
              </label>
            </div>
          </div>

          {/* Form Actions */}
          <div className={styles.formActions}>
            <button
              type="button"
              className={styles.cancelButton}
              onClick={onClose}
            >
              取消
            </button>
            <button type="submit" className={styles.saveButton}>
              儲存
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default PageModal;
