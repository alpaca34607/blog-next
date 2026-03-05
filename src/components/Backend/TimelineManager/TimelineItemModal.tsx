"use client";
import { useState, useEffect } from "react";
import { FiX } from "react-icons/fi";
import ImageUploader from "@/components/forms/ImageUploader";
import styles from "./TimelineItemModal.module.scss";

interface TimelineItem {
  id?: string;
  timelineId?: string;
  year: string;
  yearEn: string;
  title: string;
  titleEn: string;
  content: string;
  contentEn: string;
  image: string;
  sortOrder?: number;
}

interface TimelineItemModalProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (data: Partial<TimelineItem>) => void;
  editingItem: TimelineItem | null;
}

const TimelineItemModal = ({
  open,
  onClose,
  onSubmit,
  editingItem,
}: TimelineItemModalProps) => {
  const [formData, setFormData] = useState<Partial<TimelineItem>>({
    year: "",
    yearEn: "",
    title: "",
    titleEn: "",
    content: "",
    contentEn: "",
    image: "",
    sortOrder: 0,
  });

  useEffect(() => {
    if (editingItem) {
      setFormData({
        year: editingItem.year || "",
        yearEn: editingItem.yearEn || "",
        title: editingItem.title || "",
        titleEn: editingItem.titleEn || "",
        content: editingItem.content || "",
        contentEn: editingItem.contentEn || "",
        image: editingItem.image || "",
        sortOrder: editingItem.sortOrder || 0,
      });
    } else {
      setFormData({
        year: "",
        yearEn: "",
        title: "",
        titleEn: "",
        content: "",
        contentEn: "",
        image: "",
        sortOrder: 0,
      });
    }
  }, [editingItem, open]);

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
    if (!formData.year?.trim() || !formData.title?.trim()) {
      alert("請輸入年份和標題");
      return;
    }
    onSubmit(formData);
  };

  if (!open) return null;

  return (
    <div className={styles.modalOverlay}>
      <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
        <div className={styles.modalHeader}>
          <h2 className={styles.modalTitle}>
            {editingItem ? "編輯項目" : "新增項目"}
          </h2>
          <button className={styles.closeButton} onClick={onClose}>
            <FiX size={24} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className={styles.form}>
          <div className={styles.formGrid}>
          <div className={styles.formGroup}>
            <label className={styles.label}>
              年份/步驟 <span className={styles.required}>*</span>
            </label>
            <input
              type="text"
              className={styles.input}
              value={formData.year ?? ""}
              onChange={(e) =>
                setFormData({ ...formData, year: e.target.value })
              }
              placeholder="例如：2024"
              required
            />
          </div>
          <div className={styles.formGroup}>
            <label className={styles.label}>
              年份/步驟 (英文)
            </label>
            <input
              type="text"
              className={styles.input}
              value={formData.yearEn ?? ""}
              onChange={(e) =>
                setFormData({ ...formData, yearEn: e.target.value })
              }
              placeholder="例如：2024"
            />
          </div>

          <div className={styles.formGroup}>
            <label className={styles.label}>
              標題 <span className={styles.required}>*</span>
            </label>
            <input
              type="text"
              className={styles.input}
              value={formData.title ?? ""}
              onChange={(e) =>
                setFormData({ ...formData, title: e.target.value })
              }
              placeholder="重要事件標題"
              required
            />
          </div>

          <div className={styles.formGroup}>
            <label className={styles.label}>
              標題 (英文)
            </label>
            <input
              type="text"
              className={styles.input}
              value={formData.titleEn ?? ""}
              onChange={(e) =>
                setFormData({ ...formData, titleEn: e.target.value })
              }
              placeholder="重要事件標題（英文）"
            />
          </div>

          <div className={styles.formGroup}>
            <label className={styles.label}>描述</label>
            <textarea
              className={styles.textarea}
              value={formData.content ?? ""}
              onChange={(e) =>
                setFormData({ ...formData, content: e.target.value })
              }
              placeholder="詳細描述"
              rows={3}
            />
          </div>

          <div className={styles.formGroup}>
            <label className={styles.label}>描述 (英文)</label>
            <textarea
              className={styles.textarea}
              value={formData.contentEn ?? ""}
              onChange={(e) =>
                setFormData({ ...formData, contentEn: e.target.value })
              }
              placeholder="詳細描述（英文）"
              rows={3}
            />
          </div>

        
          </div>
          <div className={styles.formGroup}>
            <label className={styles.label}>相關圖片</label>
            <div className={styles.imageUploadContainer}>
              {formData.image ? (
                <div className={styles.imagePreview}>
                  <img src={formData.image} alt="Preview" />
                  <button
                    type="button"
                    className={styles.removeImage}
                    onClick={() => setFormData({ ...formData, image: "" })}
                  >
                    <FiX size={16} />
                  </button>
                </div>
              ) : (
                <div className={styles.uploadPlaceholder}>
                  <ImageUploader
                    onUpload={(url) => setFormData({ ...formData, image: url })}
                    buttonLabel="上傳圖片"
                  />
                </div>
              )}
            </div>
          </div>
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

export default TimelineItemModal;
