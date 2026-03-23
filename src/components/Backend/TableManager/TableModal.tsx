"use client";

import { useState, useEffect } from "react";

import { FiX, FiTrash2, FiPlus, FiMenu } from "react-icons/fi";
import Swal from "sweetalert2";

import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from "@dnd-kit/core";

import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";

import { CSS } from "@dnd-kit/utilities";
import styles from "./TableModal.module.scss";

import { accentOrange } from "@/styles/theme";

interface CustomTable {
  id?: string;
  name: string;
  description: string;
  columns: Array<{
    key: string;
    label: string;
    labelEn?: string;
    type: string;
  }>;
  show_search?: boolean;
}

interface TableModalProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (data: Partial<CustomTable>) => void;
  editingTable: CustomTable | null;
  columnsOnly?: boolean;
}

interface SortableColumnItemProps {
  id: number;
  col: { key: string; label: string; labelEn?: string; type: string };
  index: number;
  onUpdateLabel: (index: number, value: string) => void;
  onUpdateLabelEn: (index: number, value: string) => void;
  onRemove: (index: number) => void;
}

const SortableColumnItem = ({
  id,
  col,
  index,
  onUpdateLabel,
  onUpdateLabelEn,
  onRemove,
}: SortableColumnItemProps) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({
    id,
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`${styles.columnItem}

      ${isDragging ? styles.dragging : ""}

      `}
    >
      <span
        className={styles.dragHandle}
        {...attributes}
        {...listeners}
        title="拖曳排序"
      >
        <FiMenu size={18} />
      </span>
      <input
        type="text"
        className={styles.input}
        value={col.key}
        onChange={(e) => onUpdateLabel(index, e.target.value)}
        placeholder={`欄位 ${index + 1}
      `}
      />
      <input
        type="text"
        className={styles.input}
        value={col.labelEn}
        onChange={(e) => onUpdateLabelEn(index, e.target.value)}
        placeholder={`欄位 （英文）${index + 1}
      `}
      />
      <button
        type="button"
        className={styles.removeButton}
        onClick={() => onRemove(index)}
        title="刪除欄位"
      >
        <FiTrash2 size={16} />
      </button>
    </div>
  );
};

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
        confirmButtonColor: accentOrange,
      });
      return;
    }

    const cleanedColumns = (formData.columns || [])
      .map((col) => ({
      ...col,  
      key: String(col.key || "").trim(),
      label: String(col.label || "").trim(),
      labelEn: String(col.labelEn || "").trim()||undefined,
      type:col.type || "text",
    }))
      .filter((col) => col.key && col.label);

    if (cleanedColumns.length === 0) {
      Swal.fire({
        icon: "error",
        title: "資料驗證錯誤",
        text: "至少需要一個中文欄位",
        confirmButtonText: "確定",
        confirmButtonColor: accentOrange,
      });
      return;
    }

    onSubmit(formData);
  };

  const handleAddColumn = () => {
    setFormData({
      ...formData,
      columns: [
        ...(formData.columns || []),
        { key: "", label: "", labelEn: "", type: "text" },
      ],
    });
  };

  const handleUpdateLabel = (index: number, value: string) => {
    const newColumns = [...(formData.columns || [])];
    if (!newColumns[index]) return;
    newColumns[index] = { ...newColumns[index], key: value, label: value };

    setFormData({
      ...formData,
      columns: newColumns,
    });
  };
  const handleUpdateLabelEn = (index: number, value: string) => {
    const newColumns = [...(formData.columns || [])];
    if (!newColumns[index]) return;
    newColumns[index] = { ...newColumns[index], labelEn: value };

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

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;

    const columns = formData.columns || [];
    const oldIndex =
      typeof active.id === "number" ? active.id : Number(active.id);
    const newIndex = typeof over.id === "number" ? over.id : Number(over.id);

    if (
      Number.isNaN(oldIndex) ||
      Number.isNaN(newIndex) ||
      oldIndex < 0 ||
      newIndex < 0 ||
      oldIndex >= columns.length ||
      newIndex >= columns.length
    ) {
      return;
    }

    const newColumns = arrayMove(columns, oldIndex, newIndex);

    setFormData({
      ...formData,
      columns: newColumns,
    });
  };

  const dndSensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    }),
  );

  if (!open) return null;

  return (
    <div className={styles.modalOverlay}>
      <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
        <div className={styles.modalHeader}>
          <h2 className={styles.modalTitle}>
            {columnsOnly
              ? "設定表格欄位"
              : editingTable
                ? "編輯表格"
                : "新增表格"}
          </h2>
          <button className={styles.closeButton} onClick={onClose}>
            <FiX size={24} />
          </button>
        </div>
        <form onSubmit={handleSubmit} className={styles.form}>
          {!columnsOnly && (
            <>
              <div className={styles.formGroup}>
                <label className={styles.label}>
                  表格名稱 <span className={styles.required}>*</span>
                </label>
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
                />
              </div>
              <div className={styles.formGroup}>
                <label className={styles.label}>描述</label>
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
                />
              </div>
              <div className={styles.formGroup}>
                <div className={styles.switchGroup}>
                  <label className={styles.label}>顯示搜尋欄</label>
                  <label className={styles.switch}>
                    <input
                      type="checkbox"
                      checked={formData.show_search !== false}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          show_search: e.target.checked,
                        })
                      }
                    />
                    <span className={styles.slider}></span>
                  </label>
                </div>
                <p className={styles.helpText}>
                  開啟後，前台表格將顯示搜尋功能
                </p>
              </div>
            </>
          )}
          <div className={styles.formGroup}>
            <label className={styles.label}>
              欄位設定
              {columnsOnly && <span className={styles.required}>*</span>}
            </label>
            <div className={styles.columnsList}>
              <DndContext
                sensors={dndSensors}
                collisionDetection={closestCenter}
                onDragEnd={handleDragEnd}
              >
                <SortableContext
                  items={(formData.columns || []).map((_, i) => i)}
                  strategy={verticalListSortingStrategy}
                >
                  {(formData.columns || []).map((col, index) => (
                    <SortableColumnItem
                      key={index}
                      id={index}
                      col={col}
                      index={index}
                      onUpdateLabel={handleUpdateLabel}
                      onUpdateLabelEn={handleUpdateLabelEn}
                      onRemove={handleRemoveColumn}
                    />
                  ))}
                </SortableContext>
              </DndContext>
            </div>
            <button
              type="button"
              className={styles.addColumnButton}
              onClick={handleAddColumn}
            >
              <FiPlus size={18} /> <span>新增欄位</span>
            </button>
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

export default TableModal;
