"use client";
import { useState, useEffect, useMemo } from "react";
import { FiSearch } from "react-icons/fi";
import { getSectionStyle } from "@/utils/sectionStyles";
import styles from "./TableSection.module.scss";
import {
  API_GetTableByIdPublic,
  API_GetTableRowsPublic,
} from "@/app/api/public_api";

interface CustomTable {
  id: string;
  name: string;
  description: string;
  columns: Array<{ key: string; label: string }>;
  showSearch?: boolean;
}

interface TableRow {
  id: string;
  tableId: string;
  data: Record<string, any>;
  sortOrder: number;
  isVisible: boolean;
}

interface TableSectionProps {
  section: {
    title?: string;
    subtitle?: string;
    settings?: {
      backgroundColor?: string;
      backgroundImage?: string;
      tableId?: string;
    };
  };
}

const TableSection = ({ section }: TableSectionProps) => {
  const [table, setTable] = useState<CustomTable | null>(null);
  const [rows, setRows] = useState<TableRow[]>([]);
  const [searchValues, setSearchValues] = useState<Record<string, string>>({});
  const [isClient, setIsClient] = useState(false);

  // 使用共用的背景樣式工具函數
  const { style: sectionStyle, className: backgroundImageClass } =
    getSectionStyle({
      backgroundColor: section.settings?.backgroundColor,
      backgroundImage: section.settings?.backgroundImage,
    });

  // 載入資料
  useEffect(() => {
    setIsClient(true);
    const tableId = section.settings?.tableId;
    if (!tableId) return;

    const load = async () => {
      const [tableRes, rowsRes] = await Promise.all([
        API_GetTableByIdPublic(tableId),
        API_GetTableRowsPublic(tableId),
      ]);

      if (tableRes?.success && tableRes.data) {
        const colsRaw: any[] = Array.isArray((tableRes.data as any).columns)
          ? (tableRes.data as any).columns
          : [];
        const columns = colsRaw.map((c: any) => ({
          key: typeof c === "string" ? c : c.key || c.label || "",
          label: typeof c === "string" ? c : c.label || c.key || "",
        }));

        setTable({
          id: (tableRes.data as any).id,
          name: (tableRes.data as any).name,
          description: (tableRes.data as any).description || "",
          columns: columns.filter((c) => c.key),
          showSearch: (tableRes.data as any).showSearch,
        });
      } else {
        setTable(null);
      }

      if (rowsRes?.success && Array.isArray(rowsRes.data)) {
        const mapped: TableRow[] = (rowsRes.data as any[]).map((r: any) => ({
          id: r.id,
          tableId,
          data: (r.data || {}) as Record<string, any>,
          sortOrder: r.sortOrder ?? 0,
          isVisible: r.isVisible !== false,
        }));
        setRows(
          mapped
            .filter((r) => r.isVisible)
            .sort((a, b) => a.sortOrder - b.sortOrder)
        );
      } else {
        setRows([]);
      }
    };

    load().catch((e) => {
      console.error("載入表格資料時發生錯誤:", e);
      setTable(null);
      setRows([]);
    });
  }, [section.settings?.tableId]);

  // 後台更新時可透過自訂事件觸發重新抓取（避免依賴 localStorage）
  useEffect(() => {
    if (!isClient) return;
    const tableId = section.settings?.tableId;
    if (!tableId) return;

    const reload = () => {
      Promise.all([
        API_GetTableByIdPublic(tableId),
        API_GetTableRowsPublic(tableId),
      ])
        .then(([tableRes, rowsRes]) => {
          if (tableRes?.success && tableRes.data) {
            const colsRaw: any[] = Array.isArray((tableRes.data as any).columns)
              ? (tableRes.data as any).columns
              : [];
            const columns = colsRaw.map((c: any) => ({
              key: typeof c === "string" ? c : c.key || c.label || "",
              label: typeof c === "string" ? c : c.label || c.key || "",
            }));
            setTable({
              id: (tableRes.data as any).id,
              name: (tableRes.data as any).name,
              description: (tableRes.data as any).description || "",
              columns: columns.filter((c) => c.key),
              showSearch: (tableRes.data as any).showSearch,
            });
          }

          if (rowsRes?.success && Array.isArray(rowsRes.data)) {
            const mapped: TableRow[] = (rowsRes.data as any[]).map(
              (r: any) => ({
                id: r.id,
                tableId,
                data: (r.data || {}) as Record<string, any>,
                sortOrder: r.sortOrder ?? 0,
                isVisible: r.isVisible !== false,
              })
            );
            setRows(
              mapped
                .filter((r) => r.isVisible)
                .sort((a, b) => a.sortOrder - b.sortOrder)
            );
          }
        })
        .catch(() => {});
    };

    const handleTablesUpdate = () => reload();
    const handleRowsUpdate = () => reload();

    window.addEventListener("tablesUpdated", handleTablesUpdate);
    window.addEventListener(`rowsUpdated_${tableId}`, handleRowsUpdate);
    return () => {
      window.removeEventListener("tablesUpdated", handleTablesUpdate);
      window.removeEventListener(`rowsUpdated_${tableId}`, handleRowsUpdate);
    };
  }, [isClient, section.settings?.tableId]);

  // 取得前三個欄位用於搜尋
  const searchableColumns = useMemo(() => {
    if (!table) return [];
    return table.columns.slice(0, 3);
  }, [table]);

  // 搜尋功能（只搜尋前三個欄位）
  const filteredRows = useMemo(() => {
    if (!table || rows.length === 0) {
      return [];
    }

    let filtered = [...rows];

    // 只根據前三個欄位進行搜尋
    searchableColumns.forEach((column) => {
      const searchValue = searchValues[column.key]?.toLowerCase().trim();
      if (searchValue) {
        filtered = filtered.filter((row) => {
          const cellValue = String(row.data?.[column.key] ?? "")
            .toLowerCase()
            .trim();
          return cellValue.includes(searchValue);
        });
      }
    });

    return filtered;
  }, [searchValues, rows, table, searchableColumns]);

  if (!isClient || !table) {
    return null;
  }

  return (
    <section
      className={`${styles.tableSection} ${
        backgroundImageClass ? styles.hasBgImage : ""
      }`}
      style={sectionStyle}
    >
      <div className={styles.container}>
        {section.title && (
          <div className={styles.header}>
            <h2 className={styles.title}>{section.title}</h2>
            {section.subtitle && (
              <p className={styles.subtitle}>{section.subtitle}</p>
            )}
          </div>
        )}

        {/* 搜尋區域（只顯示前三個欄位） */}
        {table.showSearch !== false && searchableColumns.length > 0 ? (
          <div className={styles.searchSection}>
            <div className={styles.searchContainer}>
              <div className={styles.searchGrid}>
                {searchableColumns.map((column, idx) => (
                  <div key={idx} className={styles.searchField}>
                    <div className={styles.searchInputWrapper}>
                      <FiSearch className={styles.searchIcon} size={18} />
                      <input
                        type="text"
                        className={styles.searchInput}
                        value={searchValues[column.key] || ""}
                        onChange={(e) =>
                          setSearchValues({
                            ...searchValues,
                            [column.key]: e.target.value,
                          })
                        }
                        placeholder={`搜尋${column.label}`}
                      />
                    </div>
                  </div>
                ))}
              </div>
              <button className={styles.searchButton} type="button">
                <FiSearch size={20} />
              </button>
            </div>
          </div>
        ) : null}

        {/* 表格區域 */}
        <div className={styles.tableWrapper}>
          {filteredRows.length === 0 ? (
            <div className={styles.emptyState}>
              {rows.length === 0 ? "此表格尚無資料" : "沒有符合搜尋條件的資料"}
            </div>
          ) : (
            <table className={styles.dataTable}>
              <thead>
                <tr>
                  {table.columns.map((col, idx) => (
                    <th key={idx}>{col.label}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filteredRows.map((row) => (
                  <tr key={row.id}>
                    {table.columns.map((col, idx) => (
                      <td key={idx}>{row.data?.[col.key] ?? "-"}</td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </section>
  );
};

export default TableSection;
