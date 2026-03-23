"use client";
import { useState, useEffect } from "react";
import { FiX } from "react-icons/fi";
import styles from "./RowModal.module.scss";

interface CustomTable {
  id: string;
  name: string;
  description: string;
  columns:  Array<{ key: string; label: string; labelEn?: string; type?: string }>;
}

interface TableRow {
  id?: string;
  data: Record<string, string>;
  tableId: string;
  sortOrder: number;
  isVisible: boolean;
}

interface RowModalProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (data: Partial<TableRow>) => void;
  editingRow: TableRow | null;
  table: CustomTable;
  defaultOrder: number;
}

const RowModal = ({
  open,
  onClose,
  onSubmit,
  editingRow,
  table,
  defaultOrder,
}: RowModalProps) => {
  const [formData, setFormData] = useState<Partial<TableRow>>({
    data: {},
    sortOrder: defaultOrder,
    isVisible: true,
  });

  useEffect(() => {
    if (editingRow) {
      setFormData({
        data: editingRow.data || {},
        sortOrder: editingRow.sortOrder || 0,
        isVisible: editingRow.isVisible !== false,
      });
    } else {
      const emptyData: Record<string, string> = {};
      (table.columns || []).forEach((col) => {
        emptyData[col.key] = "";
      });
      setFormData({
        data: emptyData,
        sortOrder: defaultOrder,
        isVisible: true,
      });
    }
  }, [editingRow, open, table.columns, defaultOrder]);

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

  const handleDataChange = (column: string, value: string) => {
    setFormData({
      ...formData,
      data: { ...formData.data, [column]: value },
    });
  };

  if (!open) return null;

  return (
    <div className={styles.modalOverlay}>
      <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
        <div className={styles.modalHeader}>
          <h2 className={styles.modalTitle}>
            {editingRow ? "編輯資料" : "新增資料"}
          </h2>
          <button className={styles.closeButton} onClick={onClose}>
            <FiX size={24} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className={styles.form}>
          <div className={styles.formGroup}>
            {(table.columns || []).map((col, idx) => (
              <div key={idx} className={styles.formField}>
                <label className={styles.label}>{col.label}</label>
                <textarea
                  className={styles.textarea}
                  value={formData.data?.[col.key] || ""}
                  onChange={(e) => handleDataChange(col.key, e.target.value)}
                  placeholder={`輸入 ${col.label}`}
                  rows={3}
                />
              </div>
            ))}
          </div>

          <div className={styles.switchContainer}>
            <label className={styles.switchLabel}>顯示於網站</label>
            <label className={styles.switch}>
              <input
                type="checkbox"
                checked={formData.isVisible !== false}
                onChange={(e) =>
                  setFormData({ ...formData, isVisible: e.target.checked })
                }
              />
              <span className={styles.slider}></span>
            </label>
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

export default RowModal;
