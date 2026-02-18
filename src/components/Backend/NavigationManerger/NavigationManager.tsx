"use client";
import { useEffect, useMemo, useState, type CSSProperties } from "react";
import {
  FiEdit,
  FiTrash2,
  FiExternalLink,
  FiEye,
  FiEyeOff,
  FiPlus,
  FiRefreshCw,
  FiMenu,
} from "react-icons/fi";
import NavigationModal from "./NavigationModal";
import styles from "./NavigationManager.module.scss";
import adminStyles from "@/styles/AdminPagePublic.module.scss";
import {
  API_GetNavigationAdmin,
  API_CreateNavigation,
  API_UpdateNavigation,
  API_DeleteNavigation,
  API_GetPagesAdmin,
} from "@/app/api/admin_api";
import {
  closestCenter,
  DndContext,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";

interface NavigationItem {
  id: string;
  title: string;
  titleEn?: string;
  url?: string;
  productCategory?: string | null;
  type: "internal" | "external";
  isVisible: boolean;
  sortOrder?: number;
  parentId?: string;
  children?: NavigationItem[];
}

type PageOption = { id: string; title: string; slug: string };

const normalizeSlugFromUrl = (url?: string | null) =>
  (url ? String(url) : "").replace(/^\//, "").trim();

const normalizeInternalUrlFromSlug = (slug?: string | null) => {
  const s = (slug ? String(slug) : "").trim().replace(/^\/+/, "");
  return s ? `/${s}` : undefined;
};

const NavigationManager = () => {
  const [modalOpen, setModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<NavigationItem | null>(null);
  const [navItems, setNavItems] = useState<NavigationItem[]>([]);
  const [pages, setPages] = useState<PageOption[]>([]);
  const [productCategories, setProductCategories] = useState<string[]>([]);
  const [isClient, setIsClient] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // 從 API 載入導航資料
  const loadNavigation = async () => {
    try {
      setIsLoading(true);
      setError(null);

      const response = await API_GetNavigationAdmin();

      if (response?.success) {
        const items: NavigationItem[] = Array.isArray(response.data)
          ? response.data
          : [];

        // 保底排序：避免 sortOrder 相同時順序飄動
        const sorted = [...items].sort(
          (a, b) => (a.sortOrder ?? 0) - (b.sortOrder ?? 0)
        );
        sorted.forEach((p) => {
          if (Array.isArray(p.children)) {
            p.children = [...p.children].sort(
              (a, b) => (a.sortOrder ?? 0) - (b.sortOrder ?? 0)
            );
          }
        });

        setNavItems(sorted);
      } else {
        setError(response?.error?.message || "載入導航失敗");
        setNavItems([]);
      }
    } catch (err) {
      console.error("載入導航時發生錯誤:", err);
      setError("載入導航時發生錯誤");
      setNavItems([]);
    } finally {
      setIsLoading(false);
    }
  };

  // 從 API 載入頁面清單（供「連結頁面」選擇）
  const loadPages = async () => {
    try {
      const response = await API_GetPagesAdmin({ page: 1, limit: 500 });
      if (response?.success) {
        const items: any[] = Array.isArray(response.data) ? response.data : [];
        const mapped: PageOption[] = items
          .map((p: any) => ({
            id: String(p.id),
            title: String(p.title ?? ""),
            slug: String(p.slug ?? ""),
          }))
          .filter((p) => !!p.id && !!p.title && !!p.slug);
        setPages(mapped);
      } else {
        setPages([]);
      }
    } catch (err) {
      console.error("載入頁面清單時發生錯誤:", err);
      setPages([]);
    }
  };

  // 從 API 載入產品分類清單（來源：產品管理 /admin/ProductsManager）
  const loadProductCategories = async () => {
    try {
      const response = await API_GetPagesAdmin({
        page: 1,
        limit: 500,
        filter: { type: "product" },
      });
      if (!response?.success) {
        setProductCategories([]);
        return;
      }

      const items: any[] = Array.isArray(response.data) ? response.data : [];
      const categories = Array.from(
        new Set(
          items
            .map((p: any) => String(p?.category ?? "").trim())
            .filter((c: string) => !!c)
        )
      ).sort((a, b) => a.localeCompare(b, "zh-Hant"));

      setProductCategories(categories);
    } catch (err) {
      console.error("載入產品分類清單時發生錯誤:", err);
      setProductCategories([]);
    }
  };

  // 在客戶端載入 API 資料
  useEffect(() => {
    setIsClient(true);
    loadNavigation();
    loadPages();
    loadProductCategories();
  }, []);

  const handleOpenModal = (item: NavigationItem | null = null) => {
    setEditingItem(item);
    setModalOpen(true);
  };

  const handleCloseModal = () => {
    setModalOpen(false);
    setEditingItem(null);
  };

  const handleSubmit = async (formData: any) => {
    try {
      setIsLoading(true);
      setError(null);

      const isExternal = !!formData.isExternal;
      const hasChildren = !!formData.hasChildren;

      // internal：url 以 slug 產生（/xxx）；external：url 為完整網址
      let url: string | null | undefined;
      if (hasChildren) {
        // 當勾選「有子分頁」時，明確傳送 null 來清空後端的 url
        url = null;
      } else if (isExternal) {
        url = (formData.externalUrl || "").trim() || undefined;
      } else if (formData.pageId) {
        const selected = pages.find((p) => p.id === formData.pageId);
        url = normalizeInternalUrlFromSlug(selected?.slug || formData.slug);
      } else {
        url = normalizeInternalUrlFromSlug(formData.slug);
      }

      const normalizedCategory = (formData.productCategory || "").trim();

      const apiData = {
        title: formData.title,
        titleEn: formData.titleEn,
        parentId: formData.parentId || undefined,
        type: (isExternal ? "external" : "internal") as "internal" | "external",
        url,
        // 若使用者選「不設定產品分類」，明確送出 null 來清空後端欄位
        productCategory: normalizedCategory === "" ? null : normalizedCategory,
        isVisible: formData.isVisible,
        sortOrder:
          typeof formData.sortOrder === "number"
            ? formData.sortOrder
            : undefined,
      };

      if (editingItem && editingItem.id) {
        // 更新項目
        const response = await API_UpdateNavigation(editingItem.id, apiData);

        if (response?.success) {
          // 重新載入導航列表
          await loadNavigation();
          if (typeof window !== "undefined") {
            window.dispatchEvent(new Event("navigationUpdated"));
          }
        } else {
          setError(response?.error?.message || "更新導航失敗");
        }
      } else {
        // 新增項目
        const response = await API_CreateNavigation(apiData);

        if (response?.success) {
          // 重新載入導航列表
          await loadNavigation();
          if (typeof window !== "undefined") {
            window.dispatchEvent(new Event("navigationUpdated"));
          }
        } else {
          setError(response?.error?.message || "創建導航失敗");
        }
      }

      handleCloseModal();
    } catch (err) {
      console.error("提交導航時發生錯誤:", err);
      setError("提交導航時發生錯誤");
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("確定要刪除此導航項目？")) return;

    try {
      setIsLoading(true);
      setError(null);

      const response = await API_DeleteNavigation(id);

      if (response?.success) {
        // 重新載入導航列表
        await loadNavigation();
        if (typeof window !== "undefined") {
          window.dispatchEvent(new Event("navigationUpdated"));
        }
      } else {
        setError(response?.error?.message || "刪除導航失敗");
      }
    } catch (err) {
      console.error("刪除導航時發生錯誤:", err);
      setError("刪除導航時發生錯誤");
    } finally {
      setIsLoading(false);
    }
  };

  const toggleVisibility = async (item: NavigationItem) => {
    try {
      setIsLoading(true);
      setError(null);

      const response = await API_UpdateNavigation(item.id!, {
        isVisible: !item.isVisible,
      });

      if (response?.success) {
        // 重新載入導航列表
        await loadNavigation();
        if (typeof window !== "undefined") {
          window.dispatchEvent(new Event("navigationUpdated"));
        }
      } else {
        setError(response?.error?.message || "更新可見性失敗");
      }
    } catch (err) {
      console.error("切換可見性時發生錯誤:", err);
      setError("切換可見性時發生錯誤");
    } finally {
      setIsLoading(false);
    }
  };

  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 6 } }));

  const parentIds = useMemo(() => navItems.map((n) => n.id), [navItems]);

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over) return;
    if (String(active.id) === String(over.id)) return;

    const oldIndex = navItems.findIndex((i) => i.id === String(active.id));
    const newIndex = navItems.findIndex((i) => i.id === String(over.id));
    if (oldIndex < 0 || newIndex < 0) return;

    const next = arrayMove(navItems, oldIndex, newIndex).map((item, idx) => ({
      ...item,
      sortOrder: idx,
    }));

    // 先樂觀更新 UI，再寫入 DB；若失敗則重載
    setNavItems(next);
    try {
      // 依專案既有 API：逐筆呼叫 PUT /api/navigation/{id} 更新 sortOrder
      const results = await Promise.all(
        next.map((item, idx) => API_UpdateNavigation(item.id, { sortOrder: idx }))
      );

      const hasFailure = results.some((r) => !r?.success);
      if (hasFailure) await loadNavigation();
      else if (typeof window !== "undefined")
        window.dispatchEvent(new Event("navigationUpdated"));
    } catch {
      await loadNavigation();
    }
  };

  const SortableParentRow = ({ item }: { item: NavigationItem }) => {
    const {
      attributes,
      listeners,
      setNodeRef,
      transform,
      transition,
      isDragging,
    } = useSortable({ id: item.id });

    const style: CSSProperties = {
      transform: CSS.Transform.toString(transform),
      transition,
    };

    return (
      <>
        <tr
          ref={setNodeRef}
          style={style}
          className={`${styles.tableRow} ${isDragging ? styles.dragging : ""}`}
        >
          <td className={`${styles.tableCell} ${styles.dragCell}`}>
            <span className={styles.dragHandleWrapper} {...attributes} {...listeners} title="拖曳排序">
              <FiMenu size={18} className={styles.dragHandle} />
            </span>
          </td>
          <td className={`${styles.tableCell} ${styles.nameCell}`}>
            {item.title}
          </td>
          <td className={`${styles.tableCell} ${styles.typeCell}`}>
            {item.type === "external" ? (
              <span className={styles.badgeExternal}>
                <FiExternalLink size={12} />
                外部連結
              </span>
            ) : (
              <span className={styles.badgeInternal}>內部頁面</span>
            )}
          </td>
          <td className={`${styles.tableCell} ${styles.statusCell}`}>
            {item.isVisible ? (
              <FiEye className={styles.eyeIcon} size={18} />
            ) : (
              <FiEyeOff className={styles.eyeOffIcon} size={18} />
            )}
          </td>
          <td className={`${styles.tableCell} ${styles.actionsCell}`}>
            <div className={styles.actions}>
              <button
                className={styles.actionButton}
                onClick={() => toggleVisibility(item)}
                title={item.isVisible ? "隱藏" : "顯示"}
              >
                {item.isVisible ? <FiEye size={14} /> : <FiEyeOff size={14} />}
              </button>
              <button
                className={styles.actionButton}
                onClick={() => handleOpenModal(item)}
                title="編輯"
              >
                <FiEdit size={16} />
              </button>
              <button
                className={`${styles.actionButton} ${styles.deleteButton}`}
                onClick={() => handleDelete(item.id)}
                title="刪除"
              >
                <FiTrash2 size={16} />
              </button>
            </div>
          </td>
        </tr>

        {(item.children || []).map((child) => (
          <tr key={child.id} className={`${styles.tableRow} ${styles.childRow}`}>
            <td className={`${styles.tableCell} ${styles.dragCell}`} />
            <td className={`${styles.tableCell} ${styles.nameCell}`}>
              <span className={styles.childName}>
                <span>↳</span>
                {child.title}
              </span>
            </td>
            <td className={`${styles.tableCell} ${styles.typeCell}`}>
              {child.type === "external" ? (
                <span className={styles.badgeExternal}>
                  <FiExternalLink size={12} />
                  外部連結
                </span>
              ) : (
                <span className={styles.badgeInternal}>內部頁面</span>
              )}
            </td>
            <td className={`${styles.tableCell} ${styles.statusCell}`}>
              {child.isVisible ? (
                <FiEye className={styles.eyeIcon} size={18} />
              ) : (
                <FiEyeOff className={styles.eyeOffIcon} size={18} />
              )}
            </td>
            <td className={`${styles.tableCell} ${styles.actionsCell}`}>
              <div className={styles.actions}>
                <button
                  className={styles.actionButton}
                  onClick={() => toggleVisibility(child)}
                  title={child.isVisible ? "隱藏" : "顯示"}
                >
                  {child.isVisible ? <FiEye size={14} /> : <FiEyeOff size={14} />}
                </button>
                <button
                  className={styles.actionButton}
                  onClick={() => handleOpenModal(child)}
                  title="編輯"
                >
                  <FiEdit size={16} />
                </button>
                <button
                  className={`${styles.actionButton} ${styles.deleteButton}`}
                  onClick={() => handleDelete(child.id)}
                  title="刪除"
                >
                  <FiTrash2 size={16} />
                </button>
              </div>
            </td>
          </tr>
        ))}
      </>
    );
  };

  return (
    <div className={styles.navigationManager}>
      {/* Header */}
      <div className={adminStyles.header}>
        <div className={adminStyles.headerContent}>
          <div>
            <h1 className={adminStyles.title}>導航選單管理</h1>
            <p className={adminStyles.subtitle}>管理網站的主導航列</p>
          </div>
          <div className={adminStyles.buttonGroup}>
            <button
              className={adminStyles.refreshButton}
              onClick={() => loadNavigation()}
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
              <span>新增項目</span>
            </button>
          </div>
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <div className={styles.errorMessage}>
          <p>{error}</p>
          <button
            onClick={() => loadNavigation()}
            className={styles.retryButton}
          >
            重試
          </button>
        </div>
      )}

      {/* Navigation List */}
      {isLoading ? (
        <div className={styles.loading}>
          <FiRefreshCw size={24} className={styles.spinning} />
          <p>載入中...</p>
        </div>
      ) : !isClient ? (
        <div className={styles.emptyState}>載入中...</div>
      ) : navItems.length === 0 ? (
        <div className={styles.emptyState}>尚無導航項目，點擊上方按鈕新增</div>
      ) : (
        // 注意：DndContext 會插入隱藏的 <div>（可及性），不可放在 <table> 內，否則會造成 hydration error
        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragEnd={handleDragEnd}
        >
          <div className={styles.tableContainer}>
            <table className={styles.table}>
              <thead className={styles.tableHead}>
                <tr>
                  <th className={`${styles.tableHeader} ${styles.dragColumn}`}></th>
                  <th className={styles.tableHeader}>名稱</th>
                  <th className={styles.tableHeader}>類型</th>
                  <th className={styles.tableHeader}>狀態</th>
                  <th className={`${styles.tableHeader} ${styles.actionsColumn}`}>
                    操作
                  </th>
                </tr>
              </thead>
              <SortableContext
                items={parentIds}
                strategy={verticalListSortingStrategy}
              >
                <tbody>
                  {navItems.map((item) => (
                    <SortableParentRow key={item.id} item={item} />
                  ))}
                </tbody>
              </SortableContext>
            </table>
          </div>
        </DndContext>
      )}

      {/* Modal */}
      {(() => {
        const editingSlug =
          editingItem?.type === "internal"
            ? normalizeSlugFromUrl(editingItem?.url)
            : "";

        const matchedPageId =
          editingItem?.type === "internal"
            ? pages.find((p) => p.slug === editingSlug)?.id || ""
            : "";

        const modalEditingItem = editingItem
          ? {
              id: editingItem.id,
              title: editingItem.title,
              slug: editingSlug,
              parentId: editingItem.parentId,
              sortOrder: editingItem.sortOrder,
              isExternal: editingItem.type === "external",
              externalUrl:
                editingItem.type === "external" ? editingItem.url : "",
              isVisible: editingItem.isVisible !== false,
              pageId: matchedPageId,
              productCategory: editingItem.productCategory || "",
              hasChildren:
                Array.isArray(editingItem.children) &&
                editingItem.children.length > 0 &&
                !editingItem.url,
            }
          : null;

        const parentItems = navItems
          .filter((n) => n.id !== editingItem?.id)
          .map((n) => ({
            id: String(n.id),
            title: n.title,
            slug: normalizeSlugFromUrl(n.url),
            parentId: n.parentId,
            sortOrder: n.sortOrder,
            isExternal: n.type === "external",
            externalUrl: n.type === "external" ? n.url : "",
            isVisible: n.isVisible !== false,
          }));

        return (
          <NavigationModal
            open={modalOpen}
            onClose={handleCloseModal}
            onSubmit={handleSubmit}
            editingItem={modalEditingItem as any}
            parentItems={parentItems as any}
            pages={pages}
            productCategories={productCategories}
          />
        );
      })()}
    </div>
  );
};

export default NavigationManager;
