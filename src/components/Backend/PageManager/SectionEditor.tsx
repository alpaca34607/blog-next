"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import {
  FiEdit,
  FiTrash2,
  FiEye,
  FiEyeOff,
  FiArrowLeft,
  FiPlus,
  FiLayout,
} from "react-icons/fi";
import { MdDragHandle } from "react-icons/md";
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
import type { SectionSettings } from "@/types/section";
import SectionModal from "./SectionModal";
import styles from "./SectionEditor.module.scss";
import adminStyles from "@/styles/AdminPagePublic.module.scss";
import {
  API_GetPageById,
  API_GetPageSectionsAdmin,
  API_UpdatePageSectionsAdmin,
} from "@/app/api/admin_api";

interface Section {
  id: string;
  sectionType: string;
  title?: string;
  subtitle?: string;
  content?: string;
  sortOrder: number;
  settings?: SectionSettings & Record<string, any>;
}

interface Product {
  id: string;
  title: string;
  slug: string;
}

interface SectionEditorProps {
  pageId: string;
}

const SECTION_TYPES = [
  { value: "hero", label: "banner 橫幅" },
  { value: "icon_features", label: "Icon 圖文" },
  { value: "card_grid", label: "卡片區塊" },
  { value: "image_text", label: "圖文說明" },
  { value: "video_text", label: "影片說明" },
  { value: "gallery", label: "畫廊" },
  { value: "table", label: "表格" },
  { value: "product_specs", label: "產品規格表" },
  { value: "timeline", label: "時間軸" },
  { value: "content_block", label: "內容區塊" },
  { value: "cta", label: "行動呼籲" },
  { value: "downloads", label: "下載專區" },
];

// 可拖曳的區塊卡片
interface SortableSectionCardProps {
  section: Section;
  getSectionTypeLabel: (type: string) => string;
  onEdit: (section: Section) => void;
  onDelete: (id: string) => void;
}

const SortableSectionCard = ({
  section,
  getSectionTypeLabel,
  onEdit,
  onDelete,
}: SortableSectionCardProps) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: section.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`${styles.sectionCard} ${isDragging ? styles.dragging : ""}`}
    >
      <div
        className={styles.dragHandle}
        {...attributes}
        {...listeners}
        // 拖曳提示：僅在拖曳手把上綁定事件，避免誤觸
      >
        <MdDragHandle size={20} />
      </div>

      <div className={styles.sectionIcon}>
        <FiLayout size={20} />
      </div>

      <div className={styles.sectionInfo}>
        <div className={styles.sectionHeader}>
          <span className={styles.sectionTitle}>
            {section.title || getSectionTypeLabel(section.sectionType)}
          </span>
          <span className={styles.sectionTypeBadge}>
            {getSectionTypeLabel(section.sectionType)}
          </span>
          {section.settings?.templateVariant && (
            <span className={styles.variantBadge}>
              {section.settings?.templateVariant}
            </span>
          )}
        </div>
        {section.subtitle && (
          <p className={styles.sectionSubtitle}>{section.subtitle}</p>
        )}
      </div>

      <div className={styles.sectionActions}>
        {section.settings?.isVisible !== false ? (
          <FiEye size={18} className={styles.eyeIcon} />
        ) : (
          <FiEyeOff size={18} className={styles.eyeOffIcon} />
        )}
        <button className={styles.actionButton} onClick={() => onEdit(section)}>
          <FiEdit size={16} />
        </button>
        <button
          className={`${styles.actionButton} ${styles.deleteButton}`}
          onClick={() => onDelete(section.id)}
        >
          <FiTrash2 size={16} />
        </button>
      </div>
    </div>
  );
};

const SectionEditor = ({ pageId }: SectionEditorProps) => {
  const [modalOpen, setModalOpen] = useState(false);
  const [editingSection, setEditingSection] = useState<Section | null>(null);

  // 從 API 載入目前頁面/產品資訊（用於顯示標題、返回連結、預覽連結）
  const [currentItem, setCurrentItem] = useState<Product | null>(null);
  const [isProduct, setIsProduct] = useState(false);
  const [isClient, setIsClient] = useState(false);
  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  // 預設資料（用於 SSR）
  const defaultSections: Section[] = [

  ];

  const [sections, setSections] = useState<Section[]>(defaultSections);

  // 在客戶端載入 API 資料（避免依賴 localStorage）
  useEffect(() => {
    setIsClient(true);

    const loadSections = async () => {
      try {
        const res = await API_GetPageSectionsAdmin(pageId);
        if (res?.success && Array.isArray(res.data)) {
          const next = res.data as any[];
          setSections(next.length > 0 ? (next as any) : defaultSections);
        } else {
          setSections(defaultSections);
        }
      } catch (e) {
        console.error("載入區塊資料時發生錯誤:", e);
        setSections(defaultSections);
      }
    };

    if (pageId) loadSections();
  }, [pageId]);

  // 監聽自訂事件（由後台更新觸發），重新抓取 API
  useEffect(() => {
    if (!isClient) return;

    const handleSectionsChange = async () => {
      try {
        const res = await API_GetPageSectionsAdmin(pageId);
        if (res?.success && Array.isArray(res.data)) {
          setSections(res.data as any);
        }
      } catch {
        // 忽略錯誤
      }
    };

    window.addEventListener("sectionsUpdated", handleSectionsChange);

    return () => {
      window.removeEventListener("sectionsUpdated", handleSectionsChange);
    };
  }, [isClient, pageId]);

  // 從 API 取得 slug/type，避免依賴 localStorage 而導致「預覽頁面」按鈕不顯示
  useEffect(() => {
    if (!isClient) return;
    if (!pageId) return;

    const loadCurrentItem = async () => {
      try {
        const response = await API_GetPageById(pageId);
        if (response?.success && response.data) {
          const item = response.data as {
            id: string;
            title: string;
            slug: string;
            type?: "page" | "product";
          };
          setCurrentItem({ id: item.id, title: item.title, slug: item.slug });
          setIsProduct(item.type === "product");
        } else {
          setCurrentItem(null);
          setIsProduct(false);
        }
      } catch (err) {
        console.error("載入頁面資訊時發生錯誤:", err);
        setCurrentItem(null);
        setIsProduct(false);
      }
    };

    loadCurrentItem();
  }, [isClient, pageId]);

  // 儲存區塊資料到 API（避免依賴 localStorage）
  const saveSections = async (newSections: Section[]) => {
    if (typeof window === "undefined") return;

    try {
      // 壓縮所有圖片
      const { compressAllImages } = await import("@/utils/imageCompression");
      const compressedSections = await Promise.all(
        newSections.map(async (section) => {
          return await compressAllImages(section);
        })
      );

      const jsonString = JSON.stringify(compressedSections);
      const sizeInMB = new Blob([jsonString]).size / 1024 / 1024;

      // 檢查大小（localStorage 通常限制約 5-10MB）
      if (sizeInMB > 4.5) {
        alert(
          `警告：資料大小為 ${sizeInMB.toFixed(
            2
          )}MB，接近 localStorage 限制。\n\n建議：\n1. 減少圖片數量或尺寸\n2. 移除不需要的背景圖片\n3. 使用較小的圖片檔案`
        );
      }

      // 將目前前端 section 轉為後端 DB 結構（多餘欄位統一放入 settings）
      const payload = compressedSections.map((s: any, idx: number) => {
        return {
          id: s.id,
          sectionType: s.sectionType,
          title: s.title ?? undefined,
          subtitle: s.subtitle ?? undefined,
          content: s.content ?? undefined,
          sortOrder: typeof s.sortOrder === "number" ? s.sortOrder : idx,
          settings: s.settings || {},
        };
      });

      const res = await API_UpdatePageSectionsAdmin(pageId, payload);
      if (!res?.success) {
        throw new Error(res?.error?.message || "更新區塊失敗");
      }

      // 觸發自訂事件，通知前台/預覽重新抓取 API
      window.dispatchEvent(new Event("sectionsUpdated"));
    } catch (error: any) {
      if (error.name === "QuotaExceededError" || error.code === 22) {
        alert(
          "錯誤：儲存空間不足！\n\n可能原因：\n1. 圖片檔案太大\n2. 區塊資料過多\n\n解決方案：\n1. 請移除一些圖片或區塊\n2. 使用較小的圖片檔案\n3. 清除瀏覽器快取後重試"
        );
      } else {
        console.error("儲存失敗:", error);
        alert(`儲存失敗：${error.message || "未知錯誤"}`);
      }
      throw error;
    }
  };

  const handleOpenModal = (section: Section | null = null) => {
    setEditingSection(section);
    setModalOpen(true);
  };

  const handleCloseModal = () => {
    setModalOpen(false);
    setEditingSection(null);
  };

  const handleSubmit = async (formData: Partial<Section>) => {
    try {
      if (editingSection) {
        // 更新區塊
        const updatedSections = sections.map((section) => {
          if (section.id === editingSection.id) {
            // 合併 settings，確保 images 和 specs 等欄位正確保留
            const settings = {
              ...section.settings,
              ...formData.settings,
            };

            // 如果 formData 中有 images 欄位（在根層級），將其加入 settings
            if ((formData as any).images) {
              settings.images = (formData as any).images;
            }

            // 如果 formData.settings 中有 images，優先使用
            if (formData.settings?.images) {
              settings.images = formData.settings.images;
            }

            const updatedSection: Section = {
              ...section,
              sectionType: (formData as any).sectionType || section.sectionType,
              title: formData.title ?? section.title,
              subtitle: formData.subtitle ?? section.subtitle,
              content: formData.content ?? section.content,
              settings: settings,
            };

            return updatedSection;
          }
          return section;
        });
        setSections(updatedSections);
        await saveSections(updatedSections);
      } else {
        // 新增區塊
        const settings = { ...formData.settings };
        // 如果 formData 中有 images 欄位，將其加入 settings
        if ((formData as any).images) {
          settings.images = (formData as any).images;
        }
        // 如果 formData.settings 中有 images，優先使用
        if (formData.settings?.images) {
          settings.images = formData.settings.images;
        }

        const newSection: Section = {
          id: Date.now().toString(),
          sectionType: (formData as any).sectionType || "content_block",
          title: formData.title || "",
          subtitle: formData.subtitle,
          content: formData.content,
          sortOrder: sections.length,
          settings: settings,
        };
        const updatedSections = [...sections, newSection];
        setSections(updatedSections);
        await saveSections(updatedSections);
      }
      handleCloseModal();
    } catch (error) {
      // 錯誤已在 saveSections 中處理並顯示
      console.error("提交失敗:", error);
    }
  };

  const handleDelete = async (id: string) => {
    if (confirm("確定要刪除此區塊？")) {
      try {
        const updatedSections = sections.filter((section) => section.id !== id);
        setSections(updatedSections);
        await saveSections(updatedSections);
      } catch (error) {
        console.error("刪除失敗:", error);
      }
    }
  };

  const getSectionTypeLabel = (type: string) => {
    return SECTION_TYPES.find((t) => t.value === type)?.label || type;
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (!over || active.id === over.id) return;

    // 以 sortOrder 排序後再進行重排，確保畫面與狀態一致
    const sorted = [...sections].sort((a, b) => a.sortOrder - b.sortOrder);
    const oldIndex = sorted.findIndex((item) => item.id === active.id);
    const newIndex = sorted.findIndex((item) => item.id === over.id);

    if (oldIndex === -1 || newIndex === -1) return;

    const reordered = arrayMove(sorted, oldIndex, newIndex);
    const updated = reordered.map((section, index) => ({
      ...section,
      sortOrder: index,
    }));

    setSections(updated);
    saveSections(updated).catch((error) => {
      console.error("儲存失敗:", error);
    });
  };

  if (!pageId) {
    return (
      <div className={styles.errorContainer}>
        <p className={styles.errorText}>請選擇一個頁面來編輯區塊</p>
        <Link
          href={isProduct ? "/admin/ProductsManager" : "/admin/PageManager"}
          className={styles.backLink}
        >
          {isProduct ? "返回產品管理" : "返回頁面管理"}
        </Link>
      </div>
    );
  }

  return (
    <div className={styles.sectionEditor}>
      {/* Header */}
      <div className={styles.header}>
        <Link
          href={isProduct ? "/admin/ProductsManager" : "/admin/PageManager"}
          className={styles.backButton}
        >
          <FiArrowLeft size={18} />
          <span>{isProduct ? "返回產品管理" : "返回頁面管理"}</span>
        </Link>
        {currentItem && (
          <Link
            href={`/admin/PageManager/preview?slug=${currentItem.slug}`}
            className={styles.previewButton}
          >
            <FiEye size={16} />
            <span>預覽頁面</span>
          </Link>
        )}
      </div>

      {/* Page Header */}
      <div className={styles.pageHeader}>
        <div>
          <h1 className={adminStyles.title}>
            {currentItem?.title || "頁面"} - 區塊編輯
          </h1>
          <p className={adminStyles.subtitle}>拖放排序區塊，點擊編輯內容</p>
        </div>
        <button
          className={adminStyles.addButton}
          onClick={() => handleOpenModal(null)}
        >
          <FiPlus size={20} />
          <span>新增區塊</span>
        </button>
      </div>

      {/* Sections List */}
      <div className={styles.sectionsContainer}>
        {!isClient ? (
          <div className={styles.emptyState}>載入中...</div>
        ) : sections.length === 0 ? (
          <div className={styles.emptyState}>
            此頁面尚無區塊，點擊上方按鈕新增
          </div>
        ) : (
          <DndContext
            sensors={sensors}
            collisionDetection={closestCenter}
            onDragEnd={handleDragEnd}
          >
            <SortableContext
              items={sections
                .slice()
                .sort((a, b) => a.sortOrder - b.sortOrder)
                .map((section) => section.id)}
              strategy={verticalListSortingStrategy}
            >
              <div className={styles.sectionsList}>
                {sections
                  .slice()
                  .sort((a, b) => a.sortOrder - b.sortOrder)
                  .map((section) => (
                    <SortableSectionCard
                      key={section.id}
                      section={section}
                      getSectionTypeLabel={getSectionTypeLabel}
                      onEdit={handleOpenModal}
                      onDelete={handleDelete}
                    />
                  ))}
              </div>
            </SortableContext>
          </DndContext>
        )}
      </div>

      {/* Modal */}
      <SectionModal
        open={modalOpen}
        onClose={handleCloseModal}
        onSubmit={handleSubmit}
        editingSection={editingSection}
        sectionTypes={SECTION_TYPES}
      />
    </div>
  );
};

export default SectionEditor;
