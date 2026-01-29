"use client";
import { useState, useEffect } from "react";
import { FiX } from "react-icons/fi";
import ImageUploader from "@/components/forms/ImageUploader";
import RichTextEditor from "@/components/forms/RichTextEditor";
import styles from "./NewsModal.module.scss";

interface NewsArticle {
  id?: string;
  title: string;
  slug: string;
  category: string;
  excerpt: string;
  content: string;
  featuredImage: string;
  publishDate: string;
  isPublished: boolean;
  isFeatured: boolean;
}

interface NewsModalProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (data: Partial<NewsArticle>) => void;
  editingNews: NewsArticle | null;
}

const CATEGORIES = ["技術文章", "媒體報導", "活動訊息"];

const NewsModal = ({
  open,
  onClose,
  onSubmit,
  editingNews,
}: NewsModalProps) => {
  const [formData, setFormData] = useState<Partial<NewsArticle>>({
    title: "",
    slug: "",
    category: "技術文章",
    excerpt: "",
    content: "",
    featuredImage: "",
    publishDate: new Date().toISOString().split("T")[0],
    isPublished: false,
    isFeatured: false,
  });

  useEffect(() => {
    if (editingNews) {
      setFormData({
        title: editingNews.title || "",
        slug: editingNews.slug || "",
        category: editingNews.category || "技術文章",
        excerpt: editingNews.excerpt || "",
        content: editingNews.content || "",
        featuredImage: editingNews.featuredImage || "",
        publishDate:
          (editingNews.publishDate
            ? new Date(editingNews.publishDate).toISOString().split("T")[0]
            : "") || new Date().toISOString().split("T")[0],
        isPublished: editingNews.isPublished || false,
        isFeatured: editingNews.isFeatured || false,
      });
    } else {
      setFormData({
        title: "",
        slug: "",
        category: "技術文章",
        excerpt: "",
        content: "",
        featuredImage: "",
        publishDate: new Date().toISOString().split("T")[0],
        isPublished: false,
        isFeatured: false,
      });
    }
  }, [editingNews, open]);

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
    onSubmit(formData);
  };

  if (!open) return null;

  return (
    <div className={styles.modalOverlay}>
      <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
        <div className={styles.modalHeader}>
          <h2 className={styles.modalTitle}>
            {editingNews ? "編輯新聞" : "新增新聞"}
          </h2>
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
                  標題 <span className={styles.required}>*</span>
                </label>
                <input
                  type="text"
                  className={styles.input}
                  value={formData.title}
                  onChange={(e) =>
                    setFormData({ ...formData, title: e.target.value })
                  }
                  placeholder="新聞標題"
                  required
                />
              </div>
              <div className={styles.formGroup}>
                <label className={styles.label}>
                  Slug <span className={styles.required}>*</span>
                </label>
                <input
                  type="text"
                  className={styles.input}
                  value={formData.slug}
                  onChange={(e) =>
                    setFormData({ ...formData, slug: e.target.value })
                  }
                  placeholder="url-friendly-slug"
                  required
                />
              </div>
            </div>

            <div className={styles.formGrid}>
              <div className={styles.formGroup}>
                <label className={styles.label}>
                  分類 <span className={styles.required}>*</span>
                </label>
                <select
                  className={styles.select}
                  value={formData.category}
                  onChange={(e) =>
                    setFormData({ ...formData, category: e.target.value })
                  }
                  required
                >
                  {CATEGORIES.map((cat) => (
                    <option key={cat} value={cat}>
                      {cat}
                    </option>
                  ))}
                </select>
              </div>
              <div className={styles.formGroup}>
                <label className={styles.label}>發布日期</label>
                <input
                  type="date"
                  className={styles.input}
                  value={formData.publishDate}
                  onChange={(e) =>
                    setFormData({ ...formData, publishDate: e.target.value })
                  }
                />
              </div>
            </div>

            <div className={styles.formGroup}>
              <label className={styles.label}>摘要</label>
              <textarea
                className={styles.textarea}
                value={formData.excerpt}
                onChange={(e) =>
                  setFormData({ ...formData, excerpt: e.target.value })
                }
                placeholder="簡短摘要文字"
                rows={2}
              />
            </div>
          </div>

          {/* 封面圖片 */}
          <div className={styles.formSection}>
            <h3 className={styles.sectionTitle}>封面圖片</h3>
            <div className={styles.imageUploadContainer}>
              {formData.featuredImage ? (
                <div className={styles.imagePreview}>
                  <img src={formData.featuredImage} alt="Featured preview" />
                  <button
                    type="button"
                    className={styles.removeImage}
                    onClick={() =>
                      setFormData({ ...formData, featuredImage: "" })
                    }
                  >
                    <FiX size={16} />
                  </button>
                </div>
              ) : (
                <div className={styles.uploadPlaceholder}>
                  <ImageUploader
                    onUpload={(url) =>
                      setFormData({ ...formData, featuredImage: url })
                    }
                    buttonLabel="上傳圖片"
                  />
                </div>
              )}
            </div>
          </div>

          {/* 內容 */}
          <div className={styles.formSection}>
            <h3 className={styles.sectionTitle}>內容</h3>
            <RichTextEditor
              value={formData.content || ""}
              onChange={(value) => setFormData({ ...formData, content: value })}
              placeholder="輸入新聞內容..."
            />
          </div>

          {/* 發布設定 */}
          <div className={styles.formSection}>
            <h3 className={styles.sectionTitle}>發布設定</h3>
            <div className={styles.switchContainer}>
              <div className={styles.switchGroup}>
                <label className={styles.label}>發布文章</label>
                <label className={styles.switch}>
                  <input
                    type="checkbox"
                    checked={formData.isPublished || false}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        isPublished: e.target.checked,
                      })
                    }
                  />
                  <span className={styles.slider}></span>
                </label>
              </div>
              <div className={styles.switchGroup}>
                <label className={styles.label}>設為精選</label>
                <label className={styles.switch}>
                  <input
                    type="checkbox"
                    checked={formData.isFeatured || false}
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

export default NewsModal;
