"use client";
import { useState, useEffect } from "react";
import { FiEdit, FiTrash2, FiPlus, FiClock, FiLoader } from "react-icons/fi";
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
import TimelineModal from "./TimelineModal";
import TimelineItemModal from "./TimelineItemModal";
import styles from "./TimelineManager.module.scss";
import adminStyles from "@/styles/AdminPagePublic.module.scss";
import {
  API_GetTimelinesAdmin,
  API_GetTimelineItems,
  API_CreateTimeline,
  API_UpdateTimeline,
  API_DeleteTimeline,
  API_CreateTimelineItem,
  API_UpdateTimelineItem,
  API_DeleteTimelineItem,
} from "@/app/api/admin_api";
import Swal from "sweetalert2";
import { getDemoToken, getAuthToken } from "@/utils/common";

interface Timeline {
  id: string;
  name: string;
  description: string;
}

interface TimelineItem {
  id: string;
  timelineId: string;
  year: string;
  title: string;
  description: string;
  image: string;
  sortOrder: number;
}

// 可拖曳的時間軸項目組件
interface SortableItemProps {
  item: TimelineItem;
  onEdit: (item: TimelineItem) => void;
  onDelete: (id: string) => void;
}

const SortableItem = ({ item, onEdit, onDelete }: SortableItemProps) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: item.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`${styles.timelineItem} ${isDragging ? styles.dragging : ""}`}
    >
      <div {...attributes} {...listeners} className={styles.dragHandle}>
        <MdDragHandle size={18} />
      </div>

      <div className={styles.yearLabel}>{item.year}</div>

      <div className={styles.timelineDot} />

      <div className={styles.itemContent}>
        <div className={styles.itemInner}>
          {item.image && (
            <img
              src={item.image}
              alt={item.title}
              className={styles.itemImage}
            />
          )}
          <div className={styles.itemText}>
            <h4 className={styles.itemTitle}>{item.title}</h4>
            {item.description && (
              <p className={styles.itemDescription}>{item.description}</p>
            )}
          </div>
          <div className={styles.itemActions}>
            <button
              className={styles.actionButton}
              onClick={() => onEdit(item)}
              title="編輯"
            >
              <FiEdit size={14} />
            </button>
            <button
              className={`${styles.actionButton} ${styles.deleteButton}`}
              onClick={() => {
                if (confirm("確定要刪除此項目？")) {
                  onDelete(item.id);
                }
              }}
              title="刪除"
            >
              <FiTrash2 size={14} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

const TimelineManager = () => {
  const [timelineModalOpen, setTimelineModalOpen] = useState(false);
  const [itemModalOpen, setItemModalOpen] = useState(false);
  const [editingTimeline, setEditingTimeline] = useState<Timeline | null>(null);
  const [editingItem, setEditingItem] = useState<TimelineItem | null>(null);
  const [selectedTimelineId, setSelectedTimelineId] = useState<string | null>(
    null
  );
  const [isClient, setIsClient] = useState(false);
  const [isLoadingTimelines, setIsLoadingTimelines] = useState(false);
  const [isLoadingItems, setIsLoadingItems] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [timelines, setTimelines] = useState<Timeline[]>([]);
  const [items, setItems] = useState<TimelineItem[]>([]);

  const [isDemoMode, setIsDemoMode] = useState(false);
  useEffect(() => {
    setIsDemoMode(!!getDemoToken().token && !getAuthToken().token);
  }, []);

  const showDemoReadOnlyToast = () => {
    Swal.fire({
      toast: true,
      position: "top-end",
      icon: "info",
      title: "此頁面僅供檢視，無法儲存",
      showConfirmButton: false,
      timer: 2500,
      timerProgressBar: true,
    });
  };

  // 載入時間軸列表
  const loadTimelines = async () => {
    try {
      setIsLoadingTimelines(true);
      setError(null);

      const response = await API_GetTimelinesAdmin();

      if (response?.success) {
        const timelinesData = response.data || [];
        setTimelines(timelinesData);

        if (timelinesData.length > 0 && !selectedTimelineId) {
          setSelectedTimelineId(timelinesData[0].id);
        }
      } else {
        setError(response?.error?.message || "載入時間軸失敗");
        setTimelines([]);
      }
    } catch (err) {
      console.error("載入時間軸時發生錯誤:", err);
      setError("載入時間軸時發生錯誤");
      setTimelines([]);
    } finally {
      setIsLoadingTimelines(false);
    }
  };

  // 載入時間軸項目
  const loadItems = async (timelineId: string) => {
    try {
      setIsLoadingItems(true);
      setError(null);

      const response = await API_GetTimelineItems(timelineId);

      if (response?.success) {
        const itemsData = (response.data || []) as any[];

        // 後端欄位：content/year；後台使用：description/year
        const normalized = itemsData.map((item) => ({
          ...item,
          year: item.year ?? item.date ?? "",
          description: item.description ?? item.content ?? "",
          image: item.image ?? "",
        }));

        // 按 sortOrder 排序
        const sortedItems = [...normalized].sort(
          (a: TimelineItem, b: TimelineItem) => a.sortOrder - b.sortOrder
        );
        setItems(sortedItems as TimelineItem[]);
      } else {
        setError(response?.error?.message || "載入項目失敗");
        setItems([]);
      }
    } catch (err) {
      console.error("載入項目時發生錯誤:", err);
      setError("載入項目時發生錯誤");
      setItems([]);
    } finally {
      setIsLoadingItems(false);
    }
  };

  // 在客戶端載入資料
  useEffect(() => {
    setIsClient(true);
    loadTimelines();
  }, []);

  // 當選擇的時間軸改變時，載入對應的項目
  useEffect(() => {
    if (!isClient || !selectedTimelineId) {
      setItems([]);
      return;
    }
    loadItems(selectedTimelineId);
  }, [selectedTimelineId, isClient]);

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const handleOpenTimelineModal = (timeline: Timeline | null = null) => {
    setEditingTimeline(timeline);
    setTimelineModalOpen(true);
  };

  const handleCloseTimelineModal = () => {
    setTimelineModalOpen(false);
    setEditingTimeline(null);
  };

  const handleSubmitTimeline = async (formData: Partial<Timeline>) => {
    try {
      setError(null);

      if (editingTimeline) {
        // 更新時間軸
        const response = await API_UpdateTimeline(editingTimeline.id, {
          name: formData.name,
          description: formData.description,
        });

        if (response?.success) {
          // 重新載入時間軸列表
          await loadTimelines();
        } else {
          setError(response?.error?.message || "更新時間軸失敗");
        }
      } else {
        // 新增時間軸
        const response = await API_CreateTimeline({
          name: formData.name || "",
          description: formData.description || "",
        });

        if (response?.success) {
          // 重新載入時間軸列表
          await loadTimelines();
          // 選擇新建立的時間軸
          if (response.data?.id) {
            setSelectedTimelineId(response.data.id);
          }
        } else {
          setError(response?.error?.message || "創建時間軸失敗");
        }
      }

      handleCloseTimelineModal();
    } catch (err) {
      console.error("提交時間軸時發生錯誤:", err);
      setError("提交時間軸時發生錯誤");
    }
  };

  const handleDeleteTimeline = async (id: string) => {
    if (confirm("確定要刪除此時間軸？相關項目也會一併刪除。")) {
      try {
        setError(null);

        const response = await API_DeleteTimeline(id);

        if (response?.success) {
          // 重新載入時間軸列表
          await loadTimelines();

          if (selectedTimelineId === id) {
            setSelectedTimelineId(null);
            setItems([]);
          }
        } else {
          setError(response?.error?.message || "刪除時間軸失敗");
        }
      } catch (err) {
        console.error("刪除時間軸時發生錯誤:", err);
        setError("刪除時間軸時發生錯誤");
      }
    }
  };

  const handleOpenItemModal = (item: TimelineItem | null = null) => {
    setEditingItem(item);
    setItemModalOpen(true);
  };

  const handleCloseItemModal = () => {
    setItemModalOpen(false);
    setEditingItem(null);
  };

  const handleSubmitItem = async (formData: Partial<TimelineItem>) => {
    if (!selectedTimelineId) return;

    try {
      setError(null);

      if (editingItem) {
        // 更新項目
        const response = await API_UpdateTimelineItem(
          selectedTimelineId,
          editingItem.id,
          {
            title: formData.title,
            description: formData.description,
            date: formData.year,
            image: formData.image || undefined,
            sortOrder: formData.sortOrder,
          }
        );

        if (response?.success) {
          // 重新載入項目
          await loadItems(selectedTimelineId);
        } else {
          setError(response?.error?.message || "更新項目失敗");
        }
      } else {
        // 新增項目
        const response = await API_CreateTimelineItem(selectedTimelineId, {
          title: formData.title || "",
          description: formData.description || "",
          date: formData.year || "",
          image: formData.image || undefined,
          sortOrder: items.length,
        });

        if (response?.success) {
          // 重新載入項目
          await loadItems(selectedTimelineId);
        } else {
          setError(response?.error?.message || "新增項目失敗");
        }
      }

      handleCloseItemModal();
    } catch (err) {
      console.error("提交項目時發生錯誤:", err);
      setError("提交項目時發生錯誤");
    }
  };

  const handleDeleteItem = async (id: string) => {
    if (!selectedTimelineId) return;

    try {
      setError(null);

      const response = await API_DeleteTimelineItem(selectedTimelineId, id);

      if (response?.success) {
        // 重新載入項目
        await loadItems(selectedTimelineId);
      } else {
        setError(response?.error?.message || "刪除項目失敗");
      }
    } catch (err) {
      console.error("刪除項目時發生錯誤:", err);
      setError("刪除項目時發生錯誤");
    }
  };

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;

    if (over && active.id !== over.id && selectedTimelineId) {
      const oldIndex = items.findIndex((item) => item.id === active.id);
      const newIndex = items.findIndex((item) => item.id === over.id);

      const reorderedItems = arrayMove(items, oldIndex, newIndex).map(
        (item, index) => ({
          ...item,
          sortOrder: index,
        })
      );

      setItems(reorderedItems);

      // 更新排序到 API
      try {
        // 這裡可能需要批量更新排序，或者重新載入
        await loadItems(selectedTimelineId);
      } catch (err) {
        console.error("更新排序時發生錯誤:", err);
        setError("更新排序時發生錯誤");
      }
    }
  };

  const selectedTimeline = timelines.find((t) => t.id === selectedTimelineId);

  return (
    <div className={styles.timelineManager}>
      {/* Header */}
      <div className={adminStyles.header}>
        <div className={adminStyles.headerContent}>
          <div>
            <h1 className={adminStyles.title}>時間軸管理</h1>
            <p className={adminStyles.subtitle}>建立與管理多個時間軸</p>
          </div>
          <button
            className={adminStyles.addButton}
            onClick={() => handleOpenTimelineModal(null)}
          >
            <FiPlus size={20} />
            <span>新增時間軸</span>
          </button>
        </div>
      </div>

      <div className={adminStyles.demoReadOnlyOverlayWrap}>
        {isDemoMode && (
          <div
            className={adminStyles.demoReadOnlyOverlay}
            onClick={showDemoReadOnlyToast}
            role="button"
            tabIndex={0}
            aria-label="此頁面僅供檢視"
          />
        )}
      <div className={styles.contentGrid}>
        {/* Timeline List */}
        <div className={styles.timelineList}>
          <h3 className={styles.listTitle}>時間軸列表</h3>
          {isLoadingTimelines ? (
            <div className={styles.loading}>
              <FiLoader className={styles.spinner} size={24} />
              <span>載入中...</span>
            </div>
          ) : timelines.length === 0 ? (
            <div className={styles.emptyState}>尚無時間軸</div>
          ) : (
            <div className={styles.timelineCards}>
              {timelines.map((timeline) => (
                <div
                  key={timeline.id}
                  className={`${styles.timelineCard} ${
                    selectedTimelineId === timeline.id
                      ? styles.timelineCardActive
                      : ""
                  }`}
                  onClick={() => setSelectedTimelineId(timeline.id)}
                >
                  <div className={styles.timelineCardContent}>
                    <h4 className={styles.timelineCardTitle}>
                      {timeline.name}
                    </h4>
                    {timeline.description && (
                      <p className={styles.timelineCardDescription}>
                        {timeline.description}
                      </p>
                    )}
                  </div>
                  <div className={styles.timelineCardActions}>
                    <button
                      className={styles.cardActionButton}
                      onClick={(e) => {
                        e.stopPropagation();
                        handleOpenTimelineModal(timeline);
                      }}
                      title="編輯"
                    >
                      <FiEdit size={12} />
                    </button>
                    <button
                      className={`${styles.cardActionButton} ${styles.cardActionButtonDelete}`}
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDeleteTimeline(timeline.id);
                      }}
                      title="刪除"
                    >
                      <FiTrash2 size={12} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Timeline Items */}
        <div className={styles.timelineItems}>
          {error && (
            <div className={styles.errorMessage}>
              <p>{error}</p>
              <button
                onClick={() => {
                  if (selectedTimelineId) {
                    loadItems(selectedTimelineId);
                  }
                }}
                className={styles.retryButton}
              >
                重試
              </button>
            </div>
          )}
          {selectedTimelineId ? (
            <>
              <div className={styles.itemsHeader}>
                <h3 className={styles.itemsTitle}>
                  {selectedTimeline?.name} - 項目
                </h3>
                <button
                  className={styles.addItemButton}
                  onClick={() => handleOpenItemModal(null)}
                >
                  <FiPlus size={18} />
                  <span>新增項目</span>
                </button>
              </div>

              <DndContext
                sensors={sensors}
                collisionDetection={closestCenter}
                onDragEnd={handleDragEnd}
              >
                <SortableContext
                  items={items.map((item) => item.id)}
                  strategy={verticalListSortingStrategy}
                >
                  <div className={styles.timelineContainer}>
                    <div className={styles.timelineLine} />
                    <div className={styles.itemsList}>
                      {items.length === 0 ? (
                        <div className={styles.emptyState}>
                          此時間軸尚無項目，點擊上方按鈕新增
                        </div>
                      ) : (
                        items.map((item) => (
                          <SortableItem
                            key={item.id}
                            item={item}
                            onEdit={handleOpenItemModal}
                            onDelete={handleDeleteItem}
                          />
                        ))
                      )}
                    </div>
                  </div>
                </SortableContext>
              </DndContext>
            </>
          ) : (
            <div className={styles.emptyState}>
              <FiClock size={48} className={styles.emptyIcon} />
              <p>請選擇左側的時間軸來管理項目</p>
            </div>
          )}
        </div>
      </div>
      </div>

      {/* Modals */}
      <TimelineModal
        open={timelineModalOpen}
        onClose={handleCloseTimelineModal}
        onSubmit={handleSubmitTimeline}
        editingTimeline={editingTimeline}
      />

      <TimelineItemModal
        open={itemModalOpen}
        onClose={handleCloseItemModal}
        onSubmit={handleSubmitItem}
        editingItem={editingItem}
      />
    </div>
  );
};

export default TimelineManager;
