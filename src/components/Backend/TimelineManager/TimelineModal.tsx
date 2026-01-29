"use client";
import { useState, useEffect } from "react";
import { FiX } from "react-icons/fi";
import styles from "./TimelineModal.module.scss";

interface Timeline {
  id?: string;
  name: string;
  description: string;
}

interface TimelineModalProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (data: Partial<Timeline>) => void;
  editingTimeline: Timeline | null;
}

const TimelineModal = ({
  open,
  onClose,
  onSubmit,
  editingTimeline,
}: TimelineModalProps) => {
  const [formData, setFormData] = useState<Partial<Timeline>>({
    name: "",
    description: "",
  });

  useEffect(() => {
    if (editingTimeline) {
      setFormData({
        name: editingTimeline.name || "",
        description: editingTimeline.description || "",
      });
    } else {
      setFormData({
        name: "",
        description: "",
      });
    }
  }, [editingTimeline, open]);

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
    if (!formData.name?.trim()) {
      alert("請輸入時間軸名稱");
      return;
    }
    onSubmit(formData);
  };

  if (!open) return null;

  return (
    <div className={styles.modalOverlay} onClick={onClose}>
      <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
        <div className={styles.modalHeader}>
          <h2 className={styles.modalTitle}>
            {editingTimeline ? "編輯時間軸" : "新增時間軸"}
          </h2>
          <button className={styles.closeButton} onClick={onClose}>
            <FiX size={24} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className={styles.form}>
          <div className={styles.formGroup}>
            <label className={styles.label}>
              時間軸名稱 <span className={styles.required}>*</span>
            </label>
            <input
              type="text"
              className={styles.input}
              value={formData.name}
              onChange={(e) =>
                setFormData({ ...formData, name: e.target.value })
              }
              placeholder="例如：企業大事記、產品演進"
              required
            />
          </div>

          <div className={styles.formGroup}>
            <label className={styles.label}>描述</label>
            <textarea
              className={styles.textarea}
              value={formData.description}
              onChange={(e) =>
                setFormData({ ...formData, description: e.target.value })
              }
              placeholder="時間軸說明"
              rows={2}
            />
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

export default TimelineModal;
