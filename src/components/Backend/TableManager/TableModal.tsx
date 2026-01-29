"use client";

import { useState, useEffect } from "react";

import { FiX, FiTrash2, FiPlus } from "react-icons/fi";
import Swal from "sweetalert2";
import styles from "./TableModal.module.scss";

interface CustomTable {
  id?: string;
  name: string;
  description: string;
  columns: string[];
  show_search?: boolean;
}

interface TableModalProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (data: Partial<CustomTable>) => void;
  editingTable: CustomTable | null;
  columnsOnly?: boolean;
}

const TableModal = ({
  open,
  onClose,
  onSubmit,
  editingTable,
  columnsOnly = false,
}: TableModalProps) => {
  const [formData, setFormData] = useState<Partial<CustomTable>>({
    name: "",
    description: "",
    columns: [],
    show_search: true,
  });

  useEffect(() => {
    if (editingTable) {
      setFormData({
        name: editingTable.name || "",
        description: editingTable.description || "",
        columns: editingTable.columns || [],
        show_search: editingTable.show_search !== false,
      });
    } else {
      setFormData({
        name: "",
        description: "",
        columns: [],
        show_search: true,
      });
    }
  }, [editingTable, open]);

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

    if (!columnsOnly && !formData.name?.trim()) {
      Swal.fire({
        icon: "error",
        title: "資料驗證錯誤",
        text: "請輸入表格名稱",
        confirmButtonText: "確定",
        confirmButtonColor: "#ffaa00",
      });
      return;
    }

    const cleanedColumns = (formData.columns || [])
      .map((c) => String(c || "").trim())
      .filter(Boolean);
    if (cleanedColumns.length === 0) {
      Swal.fire({
        icon: "error",
        title: "資料驗證錯誤",
        text: "至少需要一個欄位",
        confirmButtonText: "確定",
        confirmButtonColor: "#ffaa00",
      });
      return;
    }

    onSubmit(formData);
  };

  const handleAddColumn = () => {
    setFormData({
      ...formData,
      columns: [...(formData.columns || []), ""],
    });
  };

  const handleUpdateColumn = (index: number, value: string) => {
    const newColumns = [...(formData.columns || [])];
    newColumns[index] = value;

    setFormData({
      ...formData,
      columns: newColumns,
    });
  };

  const handleRemoveColumn = (index: number) => {
    const newColumns = [...(formData.columns || [])];
    newColumns.splice(index, 1);

    setFormData({
      ...formData,
      columns: newColumns,
    });
  };

  if (!open) return null;

  return (
    <div className={styles.modalOverlay}>
      {" "}
      <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
        {" "}
        <div className={styles.modalHeader}>
          {" "}
          <h2 className={styles.modalTitle}>
            {" "}
            {columnsOnly
              ? "設定表格欄位"
              : editingTable
              ? "編輯表格"
              : "新增表格"}
          </h2>{" "}
          <button className={styles.closeButton} onClick={onClose}>
            {" "}
            <FiX size={24} />{" "}
          </button>{" "}
        </div>{" "}
        <form onSubmit={handleSubmit} className={styles.form}>
          {" "}
          {!columnsOnly && (
            <>
              {" "}
              <div className={styles.formGroup}>
                {" "}
                <label className={styles.label}>
                  {" "}
                  表格名稱 <span className={styles.required}>*</span>{" "}
                </label>{" "}
                <input
                  type="text"
                  className={styles.input}
                  value={formData.name}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      name: e.target.value,
                    })
                  }
                  placeholder="例如：共契專區、產品規格"
                  required
                />{" "}
              </div>{" "}
              <div className={styles.formGroup}>
                {" "}
                <label className={styles.label}>描述</label>{" "}
                <textarea
                  className={styles.textarea}
                  value={formData.description}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      description: e.target.value,
                    })
                  }
                  placeholder="表格說明"
                  rows={2}
                />{" "}
              </div>{" "}
              <div className={styles.formGroup}>
                {" "}
                <div className={styles.switchGroup}>
                  {" "}
                  <label className={styles.label}>顯示搜尋欄</label>{" "}
                  <label className={styles.switch}>
                    {" "}
                    <input
                      type="checkbox"
                      checked={formData.show_search !== false}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          show_search: e.target.checked,
                        })
                      }
                    />{" "}
                    <span className={styles.slider}></span>{" "}
                  </label>{" "}
                </div>{" "}
                <p className={styles.helpText}>
                  開啟後，前台表格將顯示搜尋功能
                </p>{" "}
              </div>{" "}
            </>
          )}
          <div className={styles.formGroup}>
            {" "}
            <label className={styles.label}>
              {" "}
              欄位設定{" "}
              {columnsOnly && <span className={styles.required}>*</span>}
            </label>{" "}
            <div className={styles.columnsList}>
              {" "}
              {(formData.columns || []).map((col, index) => (
                <div key={index} className={styles.columnItem}>
                  {" "}
                  <input
                    type="text"
                    className={styles.input}
                    value={col}
                    onChange={(e) => handleUpdateColumn(index, e.target.value)}
                    placeholder={`欄位 ${index + 1}

            `}
                  />{" "}
                  <button
                    type="button"
                    className={styles.removeButton}
                    onClick={() => handleRemoveColumn(index)}
                    title="刪除欄位"
                  >
                    {" "}
                    <FiTrash2 size={16} />{" "}
                  </button>{" "}
                </div>
              ))}
            </div>{" "}
            <button
              type="button"
              className={styles.addColumnButton}
              onClick={handleAddColumn}
            >
              {" "}
              <FiPlus size={18} /> <span>新增欄位</span>{" "}
            </button>{" "}
          </div>{" "}
          {/* Form Actions */}
          <div className={styles.formActions}>
            {" "}
            <button
              type="button"
              className={styles.cancelButton}
              onClick={onClose}
            >
              {" "}
              取消{" "}
            </button>{" "}
            <button type="submit" className={styles.saveButton}>
              {" "}
              儲存{" "}
            </button>{" "}
          </div>{" "}
        </form>{" "}
      </div>{" "}
    </div>
  );
};

export default TableModal;
