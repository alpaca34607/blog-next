"use client";

import { useState, useEffect } from "react";

import {
  FiEdit,
  FiTrash2,
  FiPlus,
  FiFileText,
  FiSettings,
  FiRefreshCw,
  FiLoader,
} from "react-icons/fi";
import Swal from "sweetalert2";
import TableModal from "./TableModal";
import RowModal from "./RowModal";
import styles from "./TableManager.module.scss";
import adminStyles from "@/styles/AdminPagePublic.module.scss";
import {
  API_GetTablesAdmin,
  API_GetTableById,
  API_CreateTable,
  API_UpdateTable,
  API_DeleteTable,
  API_GetTableRows,
  API_CreateTableRow,
  API_UpdateTableRow,
  API_DeleteTableRow,
} from "@/app/api/admin_api";

interface CustomTable {
  id: string;
  name: string;
  description: string;
  columns: string[];
  createdAt?: string;
  updatedAt?: string;
}

interface TableRow {
  id: string;
  tableId: string;
  data: Record<string, any>;
  sortOrder: number;
  isVisible: boolean;
  createdAt?: string;
  updatedAt?: string;
}

const TableManager = () => {
  const [tableModalOpen, setTableModalOpen] = useState(false);
  const [rowModalOpen, setRowModalOpen] = useState(false);
  const [columnsModalOpen, setColumnsModalOpen] = useState(false);
  const [editingTable, setEditingTable] = useState<CustomTable | null>(null);
  const [editingRow, setEditingRow] = useState<TableRow | null>(null);
  const [selectedTableId, setSelectedTableId] = useState<string | null>(null);
  const [tables, setTables] = useState<CustomTable[]>([]);
  const [rows, setRows] = useState<TableRow[]>([]);
  const [isClient, setIsClient] = useState(false);
  const [isLoadingTables, setIsLoadingTables] = useState(false);
  const [isLoadingRows, setIsLoadingRows] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const showApiErrorSwal = (apiError?: any, fallbackTitle = "操作失敗") => {
    const title =
      apiError?.message || apiError?.error?.message || fallbackTitle || "操作失敗";

    const details = apiError?.details || apiError?.error?.details;
    const issues = Array.isArray(details) ? details : [];

    const html =
      issues.length > 0
        ? `<ul style="text-align:left; margin:0; padding-left: 18px;">
            ${issues
              .map((issue: any) => {
                const path = Array.isArray(issue?.path)
                  ? issue.path.join(".")
                  : "";
                const msg = String(issue?.message || "").trim();
                const text = path ? `${path}：${msg || "資料驗證錯誤"}` : msg;
                return `<li>${text || "資料驗證錯誤"}</li>`;
              })
              .join("")}
          </ul>`
        : undefined;

    Swal.fire({
      icon: "error",
      title,
      ...(html ? { html } : { text: String(title) }),
      confirmButtonText: "確定",
      confirmButtonColor: "#ffaa00",
    });
  };

  // 載入表格列表
  const loadTables = async () => {
    try {
      setIsLoadingTables(true);
      setError(null);

      const response = await API_GetTablesAdmin();

      if (response?.success) {
        const tablesData = (response.data || []).map((table: any) => ({
          ...table,
          columns: (table.columns || []).map((col: any) =>
            typeof col === "string" ? col : col.label || col.key
          ),
        }));
        setTables(tablesData);

        if (tablesData.length > 0 && !selectedTableId) {
          setSelectedTableId(tablesData[0].id);
        }
      } else {
        setError(response?.error?.message || "載入表格失敗");
        setTables([]);
      }
    } catch (err) {
      console.error("載入表格時發生錯誤:", err);
      setError("載入表格時發生錯誤");
      setTables([]);
    } finally {
      setIsLoadingTables(false);
    }
  };

  // 載入表格行資料
  const loadRows = async (tableId: string) => {
    try {
      setIsLoadingRows(true);
      setError(null);

      const response = await API_GetTableRows(tableId);

      if (response?.success) {
        const rowsData = response.data || [];
        // 按 sortOrder 排序
        const sortedRows = [...rowsData].sort(
          (a: TableRow, b: TableRow) => a.sortOrder - b.sortOrder
        );
        setRows(sortedRows);
      } else {
        setError(response?.error?.message || "載入資料失敗");
        setRows([]);
      }
    } catch (err) {
      console.error("載入資料時發生錯誤:", err);
      setError("載入資料時發生錯誤");
      setRows([]);
    } finally {
      setIsLoadingRows(false);
    }
  };

  // 在客戶端載入資料
  useEffect(() => {
    setIsClient(true);
    loadTables();
  }, []);

  // 當選擇的表格改變時，載入對應的行資料
  useEffect(() => {
    if (!isClient || !selectedTableId) {
      setRows([]);
      return;
    }

    loadRows(selectedTableId);
  }, [selectedTableId, isClient]);

  const selectedTable = tables.find((t) => t.id === selectedTableId);

  const handleOpenTableModal = (table: CustomTable | null = null) => {
    setEditingTable(table);
    setTableModalOpen(true);
  };

  const handleOpenColumnsModal = () => {
    if (selectedTable) {
      setEditingTable(selectedTable);
      setColumnsModalOpen(true);
    }
  };

  const handleOpenRowModal = (row: TableRow | null = null) => {
    setEditingRow(row);
    setRowModalOpen(true);
  };

  const handleSubmitTable = async (formData: Partial<CustomTable>) => {
    try {
      setError(null);

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

      if (editingTable) {
        // 更新表格
        const response = await API_UpdateTable(editingTable.id, {
          name: formData.name,
          description: formData.description,
          columns: cleanedColumns.map((col) => ({
            key: col,
            label: col,
            type: "text",
          })),
        });

        if (response?.success) {
          // 重新載入表格列表
          await loadTables();
          setTableModalOpen(false);
          setEditingTable(null);
        } else {
          setError(response?.error?.message || "更新表格失敗");
          showApiErrorSwal(response?.error, "更新表格失敗");
          return;
        }
      } else {
        // 新增表格
        const response = await API_CreateTable({
          name: formData.name || "",
          description: formData.description || "",
          columns: cleanedColumns.map((col) => ({
            key: col,
            label: col,
            type: "text",
          })),
        });

        if (response?.success) {
          // 重新載入表格列表
          await loadTables();
          // 選擇新建立的表格
          if (response.data?.id) {
            setSelectedTableId(response.data.id);
          }
          setTableModalOpen(false);
          setEditingTable(null);
        } else {
          setError(response?.error?.message || "創建表格失敗");
          showApiErrorSwal(response?.error, "創建表格失敗");
          return;
        }
      }
    } catch (err) {
      console.error("提交表格時發生錯誤:", err);
      setError("提交表格時發生錯誤");
      showApiErrorSwal({ message: "提交表格時發生錯誤" }, "提交表格時發生錯誤");
    }
  };

  const handleSubmitColumns = async (formData: Partial<CustomTable>) => {
    if (selectedTableId && editingTable) {
      try {
        setError(null);

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

        const response = await API_UpdateTable(selectedTableId, {
          columns: cleanedColumns.map((col) => ({
            key: col,
            label: col,
            type: "text",
          })),
        });

        if (response?.success) {
          // 重新載入表格列表
          await loadTables();
          setColumnsModalOpen(false);
          setEditingTable(null);
        } else {
          setError(response?.error?.message || "更新欄位失敗");
          showApiErrorSwal(response?.error, "更新欄位失敗");
          return;
        }
      } catch (err) {
        console.error("更新欄位時發生錯誤:", err);
        setError("更新欄位時發生錯誤");
        showApiErrorSwal({ message: "更新欄位時發生錯誤" }, "更新欄位失敗");
      }
    }
  };

  const handleSubmitRow = async (formData: Partial<TableRow>) => {
    if (!selectedTableId) return;

    try {
      setError(null);

      if (editingRow) {
        // 更新行
        const response = await API_UpdateTableRow(
          selectedTableId,
          editingRow.id,
          {
            data: formData.data,
            sortOrder: formData.sortOrder,
            isVisible: formData.isVisible,
          }
        );

        if (response?.success) {
          // 重新載入行資料
          await loadRows(selectedTableId);
        } else {
          setError(response?.error?.message || "更新資料失敗");
        }
      } else {
        // 新增行
        const response = await API_CreateTableRow(selectedTableId, {
          data: formData.data || {},
          sortOrder: formData.sortOrder ?? rows.length,
          isVisible: formData.isVisible !== false,
        });

        if (response?.success) {
          // 重新載入行資料
          await loadRows(selectedTableId);
        } else {
          setError(response?.error?.message || "新增資料失敗");
        }
      }

      setRowModalOpen(false);
      setEditingRow(null);
    } catch (err) {
      console.error("提交資料時發生錯誤:", err);
      setError("提交資料時發生錯誤");
    }
  };

  const handleDeleteTable = async (id: string) => {
    if (confirm("確定要刪除此表格？相關資料也會一併刪除。")) {
      try {
        setError(null);

        const response = await API_DeleteTable(id);

        if (response?.success) {
          // 重新載入表格列表
          await loadTables();

          if (selectedTableId === id) {
            setSelectedTableId(null);
            setRows([]);
          }
        } else {
          setError(response?.error?.message || "刪除表格失敗");
        }
      } catch (err) {
        console.error("刪除表格時發生錯誤:", err);
        setError("刪除表格時發生錯誤");
      }
    }
  };

  const handleDeleteRow = async (id: string) => {
    if (confirm("確定要刪除此資料？")) {
      if (!selectedTableId) return;

      try {
        setError(null);

        const response = await API_DeleteTableRow(selectedTableId, id);

        if (response?.success) {
          // 重新載入行資料
          await loadRows(selectedTableId);
        } else {
          setError(response?.error?.message || "刪除資料失敗");
        }
      } catch (err) {
        console.error("刪除資料時發生錯誤:", err);
        setError("刪除資料時發生錯誤");
      }
    }
  };

  return (
    <div className={styles.tableManager}>
      {" "}
      {/* Header */}
      <div className={adminStyles.header}>
        {" "}
        <div className={adminStyles.headerContent}>
          {" "}
          <div>
            {" "}
            <h1 className={adminStyles.title}>表格管理</h1>{" "}
            <p className={adminStyles.subtitle}>建立與管理多個自訂表格</p>{" "}
          </div>{" "}
          <button
            className={adminStyles.addButton}
            onClick={() => handleOpenTableModal(null)}
          >
            {" "}
            <FiPlus size={20} /> <span>新增表格</span>{" "}
          </button>{" "}
        </div>{" "}
      </div>{" "}
      <div className={styles.contentGrid}>
        {" "}
        {/* Table List */}
        <div className={styles.tableList}>
          {" "}
          <h3 className={styles.listTitle}>表格列表</h3>{" "}
          <div className={styles.tableItems}>
            {" "}
            {isLoadingTables ? (
              <div className={styles.loading}>
                <FiLoader className={styles.spinner} size={24} />
                <span>載入中...</span>
              </div>
            ) : tables.length === 0 ? (
              <div className={styles.emptyState}>尚無表格</div>
            ) : (
              tables.map((table) => (
                <div
                  key={table.id}
                  className={`${styles.tableItem} ${
                    selectedTableId === table.id ? styles.tableItemActive : ""
                  }`}
                  onClick={() => setSelectedTableId(table.id)}
                >
                  {" "}
                  <div className={styles.tableItemContent}>
                    {" "}
                    <h4 className={styles.tableItemName}> {table.name}</h4>{" "}
                    {table.description && (
                      <p className={styles.tableItemDesc}>
                        {" "}
                        {table.description}
                      </p>
                    )}
                  </div>{" "}
                  <div className={styles.tableItemActions}>
                    {" "}
                    <button
                      className={styles.actionButton}
                      onClick={(e) => {
                        e.stopPropagation();
                        handleOpenTableModal(table);
                      }}
                      title="編輯"
                    >
                      {" "}
                      <FiEdit size={14} />{" "}
                    </button>{" "}
                    <button
                      className={`${styles.actionButton} ${styles.deleteButton}`}
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDeleteTable(table.id);
                      }}
                      title="刪除"
                    >
                      {" "}
                      <FiTrash2 size={14} />{" "}
                    </button>{" "}
                  </div>{" "}
                </div>
              ))
            )}
          </div>{" "}
        </div>{" "}
        {/* Table Content */}
        <div className={styles.tableContent}>
          {error && (
            <div className={styles.errorMessage}>
              <p>{error}</p>
              <button
                onClick={() => {
                  if (selectedTableId) {
                    loadRows(selectedTableId);
                  }
                }}
                className={styles.retryButton}
              >
                重試
              </button>
            </div>
          )}
          {selectedTableId && selectedTable ? (
            <>
              {" "}
              <div className={styles.contentHeader}>
                {" "}
                <h3 className={styles.contentTitle}>
                  {" "}
                  {selectedTable.name}
                </h3>{" "}
                <div className={styles.contentActions}>
                  {" "}
                  <button
                    className={styles.settingsButton}
                    onClick={handleOpenColumnsModal}
                  >
                    {" "}
                    <FiSettings size={18} /> <span>設定欄位</span>{" "}
                  </button>{" "}
                  <button
                    className={styles.addDataButton}
                    onClick={() => handleOpenRowModal(null)}
                  >
                    {" "}
                    <FiPlus size={18} /> <span>新增資料</span>{" "}
                  </button>{" "}
                </div>{" "}
              </div>{" "}
              {(selectedTable.columns || []).length > 0 ? (
                <div className={styles.tableWrapper}>
                  <table className={styles.dataTable}>
                    <thead>
                      <tr>
                        {(selectedTable.columns || []).map((col, idx) => (
                          <th key={idx}>{col}</th>
                        ))}
                        <th>狀態</th>
                        <th className={styles.actionColumn}>操作</th>
                      </tr>
                    </thead>
                    <tbody>
                      {rows.length === 0 ? (
                        <tr>
                          <td
                            colSpan={(selectedTable.columns?.length || 0) + 2}
                            className={styles.emptyCell}
                          >
                            此表格尚無資料，點擊上方按鈕新增
                          </td>
                        </tr>
                      ) : (
                        rows.map((row) => (
                          <tr key={row.id}>
                            {(selectedTable.columns || []).map((col, idx) => (
                              <td key={idx}>{row.data?.[col] || "-"}</td>
                            ))}
                            <td>
                              {row.isVisible ? (
                                <span className={styles.statusVisible}>
                                  顯示
                                </span>
                              ) : (
                                <span className={styles.statusHidden}>
                                  隱藏
                                </span>
                              )}
                            </td>
                            <td className={styles.actionColumn}>
                              <div className={styles.rowActions}>
                                <button
                                  className={styles.actionButton}
                                  onClick={() => handleOpenRowModal(row)}
                                  title="編輯"
                                >
                                  <FiEdit size={16} />
                                </button>
                                <button
                                  className={`${styles.actionButton} ${styles.deleteButton}`}
                                  onClick={() => handleDeleteRow(row.id)}
                                  title="刪除"
                                >
                                  <FiTrash2 size={16} />
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className={styles.emptyState}>
                  {" "}
                  <p>此表格尚未設定欄位</p>{" "}
                  <button
                    className={styles.settingsButton}
                    onClick={handleOpenColumnsModal}
                  >
                    {" "}
                    立即設定欄位{" "}
                  </button>{" "}
                </div>
              )}
            </>
          ) : (
            <div className={styles.emptyState}>
              {" "}
              <FiFileText size={48} className={styles.emptyIcon} />{" "}
              <p>請選擇左側的表格來管理資料</p>{" "}
            </div>
          )}
        </div>{" "}
      </div>{" "}
      {/* Table Modal */}
      <TableModal
        open={tableModalOpen}
        onClose={() => {
          setTableModalOpen(false);
          setEditingTable(null);
        }}
        onSubmit={handleSubmitTable}
        editingTable={editingTable}
      />{" "}
      {/* Columns Modal */}
      <TableModal
        open={columnsModalOpen}
        onClose={() => {
          setColumnsModalOpen(false);
          setEditingTable(null);
        }}
        onSubmit={handleSubmitColumns}
        editingTable={editingTable}
        columnsOnly={true}
      />{" "}
      {/* Row Modal */}
      {selectedTable && (
        <RowModal
          open={rowModalOpen}
          onClose={() => {
            setRowModalOpen(false);
            setEditingRow(null);
          }}
          onSubmit={handleSubmitRow}
          editingRow={editingRow}
          table={selectedTable}
          defaultOrder={rows.length}
        />
      )}
    </div>
  );
};

export default TableManager;
