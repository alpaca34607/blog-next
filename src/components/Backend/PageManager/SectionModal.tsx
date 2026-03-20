"use client";

import { useState, useEffect, useRef } from "react";

import { FiX, FiUpload, FiTrash2, FiPlus, FiFileText } from "react-icons/fi";
import RichTextEditor from "@/components/forms/RichTextEditor";
import ImageUploader from "@/components/forms/ImageUploader";
import { tryFetch } from "@/app/api/api_client";
import {
  BgSettingsForm,
  BgSettings,
  HeroSectionForm,
  HeroSectionFormValue,
  ButtonSettingsForm,
} from "../PageSectionSettingsForm";
import { SectionSettings } from "@/types/section";
import styles from "./SectionModal.module.scss";
import { API_GetTablesAdmin, API_GetTimelinesAdmin } from "@/app/api/admin_api";
import Swal from "sweetalert2";
import { accentOrange } from "@/styles/theme";
import { fa } from "zod/v4/locales";

interface Section {
  id?: string;
  sectionType: string;
  title?: string;
  titleEn?: string;
  subtitle?: string;
  subtitleEn?: string;
  content?: string;
  contentEn?: string;
  sortOrder?: number;
  settings?: (SectionSettings & Record<string, any>) | Record<string, any>;
}

interface SectionModalProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (data: Partial<Section>) => void;
  editingSection: Section | null;

  sectionTypes: Array<{
    value: string;
    label: string;
  }>;
}

const SectionModal = ({
  open,
  onClose,
  onSubmit,
  editingSection,
  sectionTypes,
}: SectionModalProps) => {
  const [formData, setFormData] = useState<Partial<Section>>({
    sectionType: "content_block",
    title: "",
    titleEn: "",
    subtitle: "",
    subtitleEn: "",
    content: "",
    contentEn: "",
    settings: {
      templateVariant: "default",
      backgroundColor: "#ffffff",
      backgroundImage: "",
      isVisible: true,
      image: "",
      images: [],
      link: "",
      video: "",
    },
  });

  const [isTypeMenuOpen, setIsTypeMenuOpen] = useState(false);
  const [isVariantMenuOpen, setIsVariantMenuOpen] = useState(false);
  const [tables, setTables] = useState<any[]>([]);
  const [timelines, setTimelines] = useState<any[]>([]);
  const [isClient, setIsClient] = useState(false);
  const [uploadingDownloadIndex, setUploadingDownloadIndex] = useState<
    number | null
  >(null);
  const typeMenuRef = useRef<HTMLDivElement>(null);
  const variantMenuRef = useRef<HTMLDivElement>(null);
  const tableMenuRef = useRef<HTMLDivElement>(null);
  const timelineMenuRef = useRef<HTMLDivElement>(null);
  const [isTableMenuOpen, setIsTableMenuOpen] = useState(false);
  const [isTimelineMenuOpen, setIsTimelineMenuOpen] = useState(false);

  useEffect(() => {
    if (editingSection) {
      const currentSettings = (editingSection.settings || {}) as Record<
        string,
        any
      >;
      const bgColor = currentSettings.backgroundColor || "#ffffff";
      const isTransparent =
        !bgColor || bgColor === "transparent" || bgColor === "";

      setFormData({
        sectionType: editingSection.sectionType || "content_block",
        title: editingSection.title || "",
        titleEn: editingSection.titleEn || "",
        subtitle: editingSection.subtitle || "",
        subtitleEn: editingSection.subtitleEn || "",
        content: editingSection.content || "",
        contentEn: editingSection.contentEn || "",
        sortOrder: editingSection.sortOrder,
        settings: {
          ...currentSettings,
          templateVariant: currentSettings.templateVariant || "default",
          backgroundColor: isTransparent ? "transparent" : bgColor,
          backgroundImage: currentSettings.backgroundImage || "",
          isVisible: currentSettings.isVisible !== false,
          image: currentSettings.image || "",
          images: currentSettings.images || [],
          link: currentSettings.link || "",
          video: currentSettings.video || "",
        },
      });
    } else {
      setFormData({
        sectionType: "content_block",
        title: "",
        titleEn: "",
        subtitle: "",
        subtitleEn: "",
        content: "",
        contentEn: "",
        settings: {
          templateVariant: "default",
          backgroundColor: "#ffffff",
          backgroundImage: "",
          isVisible: true,
          image: "",
          images: [],
          link: "",
          video: "",
        },
      });
    }
  }, [editingSection, open]);

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

  // 載入表格與時間軸列表
  useEffect(() => {
    setIsClient(true);

    const load = async () => {
      try {
        const [tablesRes, timelinesRes] = await Promise.all([
          API_GetTablesAdmin({ limit: 1000 }),
          API_GetTimelinesAdmin({ limit: 1000 }),
        ]);

        if (tablesRes?.success) {
          const data: any[] = Array.isArray(tablesRes.data)
            ? tablesRes.data
            : [];
          setTables(data);
        } else {
          setTables([]);
        }

        if (timelinesRes?.success) {
          const data: any[] = Array.isArray(timelinesRes.data)
            ? timelinesRes.data
            : [];
          setTimelines(data);
        } else {
          setTimelines([]);
        }
      } catch (e) {
        console.error("載入表格/時間軸列表時發生錯誤:", e);
        setTables([]);
        setTimelines([]);
      }
    };

    if (open) load();
  }, [open]);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      const target = e.target as HTMLElement;

      if (typeMenuRef.current && !typeMenuRef.current.contains(target)) {
        setIsTypeMenuOpen(false);
      }

      if (variantMenuRef.current && !variantMenuRef.current.contains(target)) {
        setIsVariantMenuOpen(false);
      }

      if (tableMenuRef.current && !tableMenuRef.current.contains(target)) {
        setIsTableMenuOpen(false);
      }

      if (
        timelineMenuRef.current &&
        !timelineMenuRef.current.contains(target)
      ) {
        setIsTimelineMenuOpen(false);
      }
    };

    if (open) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [open]);

  const getTemplateVariants = (sectionType: string) => {
    const baseVariants: Record<string, string[]> = {
      hero: ["default", "centered", "left-aligned"],
      icon_features: ["grid-2", "grid-3", "grid-4", "grid-5", "list"],
      faq_section: ["default"],
      card_grid: ["grid-3", "grid-4", "list"],
      image_text: ["left-image", "right-image", "vertical"],
      video_text: ["left-video", "right-video", "vertical"],
      gallery: ["carousel", "single", "double"],
      product_specs: ["default"],
      content_block: ["default"],
      cta: ["centered", "left-aligned", "right-aligned"],
      downloads: ["default"],
      table: ["default"],
      timeline: ["default"],
    };

    return (baseVariants[sectionType] || ["default"]).map((v) => ({
      value: v,
      label: v,
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  const handleSectionTypeChange = (type: string) => {
    const variants = getTemplateVariants(type);
    const prevSettings = (formData.settings || {}) as Record<string, any>;
    const baseSettings = {
      templateVariant: variants[0]?.value || "default",
      backgroundColor: prevSettings.backgroundColor || "#ffffff",
      backgroundImage: prevSettings.backgroundImage || "",
      isVisible: prevSettings.isVisible !== false,
      image: "",
      images: [],
      link: "",
      video: "",
    };

    setFormData({
      ...formData,
      sectionType: type,
      // 卡片區塊預設使用自定義資料來源（custom），並保留既有設定
      settings:
        type === "card_grid"
          ? {
              ...prevSettings,
              ...baseSettings,
              dataSource: prevSettings.dataSource || "custom",
            }
          : baseSettings, // 其他類型重置成基礎設定
    });
  };

  const removeImage = (index: number) => {
    const newImages = [
      ...(((formData.settings as any)?.images as any[]) || []),
    ];
    newImages.splice(index, 1);

    setFormData({
      ...formData,
      settings: {
        ...(formData.settings as any),
        images: newImages,
      },
    });
  };

  // 格式化檔案大小
  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + " " + sizes[i];
  };

  // 處理檔案上傳（改用 /api/upload，上傳至 S3 相容服務）
  const handleFileUpload = async (
    e: React.ChangeEvent<HTMLInputElement>,
    downloadIndex: number,
  ) => {
    const inputEl = e.currentTarget;
    const file = inputEl.files?.[0];
    if (!file) return;

    // 重置 input，以便可以再次選擇同一檔案
    const resetInput = () => {
      try {
        inputEl.value = "";
      } catch {
        // ignore
      }
    };

    // 基本大小檢查（後端也會再驗一次）
    const maxSize = 10 * 1024 * 1024; // 10MB
    if (file.size > maxSize) {
      Swal.fire({
        icon: "warning",
        title: "檔案過大",
        text: `檔案大小不能超過 ${(maxSize / 1024 / 1024).toFixed(0)}MB`,
        confirmButtonText: "確定",
        confirmButtonColor: accentOrange,
      });
      resetInput();
      return;
    }

    const fileSize = formatFileSize(file.size);

    setUploadingDownloadIndex(downloadIndex);
    try {
      Swal.fire({
        title: "檔案上傳中...",
        text: "請稍候",
        allowOutsideClick: false,
        allowEscapeKey: false,
        didOpen: () => Swal.showLoading(),
      });

      const uploadFormData = new FormData();
      uploadFormData.append("file", file);

      const res = await tryFetch<{
        filename: string;
        url: string;
        size: number;
        mimeType: string;
      }>("/api/upload", {
        method: "POST",
        body: uploadFormData,
        withAuth: true,
      });

      Swal.close();

      if (!res.success) {
        throw new Error((res.error as any)?.message || "上傳失敗");
      }

      const url = (res.data as any)?.url;
      if (typeof url !== "string" || !url) {
        throw new Error("上傳回應格式不正確");
      }

      setFormData((prev) => {
        const prevSettings = (prev.settings || {}) as Record<string, any>;
        const downloads = [...(prevSettings.downloads || [])];
        downloads[downloadIndex] = {
          ...downloads[downloadIndex],
          fileUrl: url,
          fileName: file.name,
          fileSize,
          fileType: file.type,
        };

        return {
          ...prev,
          settings: {
            ...prevSettings,
            downloads,
          },
        };
      });
    } catch (err) {
      const message = err instanceof Error ? err.message : "請重試";
      Swal.fire({
        icon: "error",
        title: "檔案上傳失敗",
        text: message,
        confirmButtonText: "確定",
        confirmButtonColor: accentOrange,
      });
    } finally {
      setUploadingDownloadIndex(null);
      resetInput();
    }
  };

  /* icon 圖文項目 */
  const addFeatureItem = () => {
    const features = formData.settings?.features || [];

    setFormData({
      ...formData,
      settings: {
        ...formData.settings,
        features: [
          ...features,
          {
            iconImage: "",
            title: "",
            titleEn: "",
            description: "",
            descriptionEn: "",
          },
        ],
      },
    });
  };

  const removeFeatureItem = (index: number) => {
    const features = [...(formData.settings?.features || [])];
    features.splice(index, 1);

    setFormData({
      ...formData,
      settings: {
        ...formData.settings,
        features,
      },
    });
  };

  const updateFeatureItem = (
    index: number,
    field:
      | "icon"
      | "iconImage"
      | "title"
      | "titleEn"
      | "description"
      | "descriptionEn",
    value: string,
  ) => {
    // 使用 functional setState，避免同一事件內連續更新導致狀態被舊資料覆蓋
    setFormData((prev) => {
      const features = [...((prev.settings as any)?.features || [])];

      features[index] = {
        ...features[index],
        [field]: value,
      };

      return {
        ...prev,
        settings: {
          ...(prev.settings as any),
          features,
        },
      };
    });
  };

  const updateFeatureItemBatch = (
    index: number,
    updates: Partial<
      Record<
        | "icon"
        | "iconImage"
        | "title"
        | "titleEn"
        | "description"
        | "descriptionEn",
        string
      >
    >,
  ) => {
    setFormData((prev) => {
      const features = [...((prev.settings as any)?.features || [])];

      features[index] = {
        ...features[index],
        ...updates,
      };

      return {
        ...prev,
        settings: {
          ...(prev.settings as any),
          features,
        },
      };
    });
  };

  /* 產品規格項目 */
  const addSpecItem = () => {
    const specs = formData.settings?.specs || [];

    setFormData({
      ...formData,
      settings: {
        ...formData.settings,
        specs: [
          ...specs,
          {
            name: "",
            nameEn: "",
            value: "",
            valueEn: "",
          },
        ],
      },
    });
  };

  const removeSpecItem = (index: number) => {
    const specs = [...(formData.settings?.specs || [])];
    specs.splice(index, 1);

    setFormData({
      ...formData,
      settings: {
        ...formData.settings,
        specs,
      },
    });
  };

  const updateSpecItem = (
    index: number,
    field: "name" | "nameEn" | "value" | "valueEn",
    value: string,
  ) => {
    const specs = [...(formData.settings?.specs || [])];

    specs[index] = {
      ...specs[index],
      [field]: value,
    };

    setFormData({
      ...formData,
      settings: {
        ...formData.settings,
        specs,
      },
    });
  };

  /* faq項目 */
  const addFaqItem = () => {
    const faqs = [...(formData.settings?.faqs || [])];
    setFormData({
      ...formData,
      settings: {
        ...formData.settings,
        faqs: [
          ...faqs,
          {
            question: "",
            questionEn: "",
            answer: "",
            answerEn: "",
          },
        ],
      },
    });
  };

  const removeFaqItem = (index: number) => {
    const faqs = [...(formData.settings?.faqs || [])];
    faqs.splice(index, 1);
    setFormData({
      ...formData,
      settings: {
        ...formData.settings,
        faqs,
      },
    });
  };

  const updateFaqItem = (
    index: number,
    field: "question" | "questionEn" | "answer" | "answerEn",
    value: string,
  ) => {
    const faqs = [...(formData.settings?.faqs || [])];

    faqs[index] = {
      ...faqs[index],
      [field]: value,
    };
    setFormData({
      ...formData,
      settings: {
        ...formData.settings,
        faqs,
      },
    });
  };

  // 將 YouTube URL 轉換為 embed URL
  const convertYouTubeUrlToEmbed = (url: string): string => {
    if (!url) return "";

    // 如果已經是 embed URL，直接返回
    if (url.includes("youtube.com/embed/")) {
      return url;
    }

    // 提取 YouTube 影片 ID
    let videoId = "";

    // 處理各種 YouTube URL 格式
    const patterns = [
      /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([^&\n?#]+)/,
      /youtube\.com\/watch\?.*v=([^&\n?#]+)/,
    ];

    for (const pattern of patterns) {
      const match = url.match(pattern);
      if (match && match[1]) {
        videoId = match[1];
        break;
      }
    }

    if (videoId) {
      return `https://www.youtube.com/embed/${videoId}`;
    }

    // 如果無法解析，返回原始 URL（讓使用者知道格式可能有問題）
    return url;
  };

  // 驗證是否為有效的 YouTube URL
  const isValidYouTubeUrl = (url: string): boolean => {
    if (!url) return false;
    const youtubePattern = /^(https?:\/\/)?(www\.)?(youtube\.com|youtu\.be)/;
    return youtubePattern.test(url);
  };

  if (!open) return null;

  const selectedType = sectionTypes.find(
    (t) => t.value === formData.sectionType,
  );
  const variants = getTemplateVariants(formData.sectionType || "");
  const selectedVariant = variants.find(
    (v) => v.value === (formData.settings as any)?.templateVariant,
  );

  return (
    <div
      className={styles.modalOverlay}

      // onClick= {
      //   onClose
      // }
    >
      <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
        <div className={styles.modalHeader}>
          <h2 className={styles.modalTitle}>
            {editingSection ? "編輯區塊" : "新增區塊"}
          </h2>
          <button className={styles.closeButton} onClick={onClose}>
            <FiX size={24} />
          </button>
        </div>
        <form onSubmit={handleSubmit} className={styles.form}>
          {/* 區塊類型與樣式 */}
          <div className={styles.formGrid}>
            <div className={styles.formGroup}>
              <label className={styles.label}>
                區塊類型 <span className={styles.required}>*</span>
              </label>
              <div className={styles.selectWrapper} ref={typeMenuRef}>
                <button
                  type="button"
                  className={styles.select}
                  onClick={() => setIsTypeMenuOpen(!isTypeMenuOpen)}
                >
                  <span> {selectedType?.label || "選擇類型"}</span>
                  <span className={styles.chevron}>▼</span>
                </button>
                {isTypeMenuOpen && (
                  <div className={styles.selectMenu}>
                    {sectionTypes.map((type) => (
                      <button
                        key={type.value}
                        type="button"
                        className={`${styles.selectItem}

                ${
                  formData.sectionType === type.value
                    ? styles.selectItemActive
                    : ""
                }

                `}
                        onClick={() => {
                          handleSectionTypeChange(type.value);
                          setIsTypeMenuOpen(false);
                        }}
                      >
                        {type.label}
                        {formData.sectionType === type.value && (
                          <span className={styles.checkmark}>✓</span>
                        )}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>
            <div className={styles.formGroup}>
              <label className={styles.label}>顯示樣式</label>
              {formData.sectionType === "table" ? (
                <div className={styles.selectWrapper} ref={tableMenuRef}>
                  <button
                    type="button"
                    className={styles.select}
                    onClick={() => setIsTableMenuOpen(!isTableMenuOpen)}
                  >
                    <span>
                      {tables.find(
                        (t) => t.id === (formData.settings as any)?.tableId,
                      )?.name || "選擇表格"}
                    </span>
                    <span className={styles.chevron}>▼</span>
                  </button>
                  {isTableMenuOpen && (
                    <div className={styles.selectMenu}>
                      {tables.length === 0 ? (
                        <div
                          className={styles.selectItem}
                          style={{ cursor: "default" }}
                        >
                          尚無表格，請先到表格管理新增
                        </div>
                      ) : (
                        tables.map((table) => (
                          <button
                            key={table.id}
                            type="button"
                            className={`${styles.selectItem} ${
                              (formData.settings as any)?.tableId === table.id
                                ? styles.selectItemActive
                                : ""
                            }`}
                            onClick={() => {
                              setFormData({
                                ...formData,
                                settings: {
                                  ...(formData.settings as any),
                                  tableId: table.id,
                                  templateVariant: "default",
                                },
                              });
                              setIsTableMenuOpen(false);
                            }}
                          >
                            {table.name}
                            {(formData.settings as any)?.tableId ===
                              table.id && (
                              <span className={styles.checkmark}>✓</span>
                            )}
                          </button>
                        ))
                      )}
                    </div>
                  )}
                </div>
              ) : formData.sectionType === "timeline" ? (
                <div className={styles.selectWrapper} ref={timelineMenuRef}>
                  <button
                    type="button"
                    className={styles.select}
                    onClick={() => setIsTimelineMenuOpen(!isTimelineMenuOpen)}
                  >
                    <span>
                      {timelines.find(
                        (t) => t.id === (formData.settings as any)?.timelineId,
                      )?.name || "選擇時間軸"}
                    </span>
                    <span className={styles.chevron}>▼</span>
                  </button>
                  {isTimelineMenuOpen && (
                    <div className={styles.selectMenu}>
                      {timelines.length === 0 ? (
                        <div
                          className={styles.selectItem}
                          style={{ cursor: "default" }}
                        >
                          尚無時間軸，請先到時間軸管理新增
                        </div>
                      ) : (
                        timelines.map((timeline) => (
                          <button
                            key={timeline.id}
                            type="button"
                            className={`${styles.selectItem} ${
                              (formData.settings as any)?.timelineId ===
                              timeline.id
                                ? styles.selectItemActive
                                : ""
                            }`}
                            onClick={() => {
                              setFormData({
                                ...formData,
                                settings: {
                                  ...(formData.settings as any),
                                  timelineId: timeline.id,
                                  templateVariant: "default",
                                },
                              });
                              setIsTimelineMenuOpen(false);
                            }}
                          >
                            {timeline.name}
                            {(formData.settings as any)?.timelineId ===
                              timeline.id && (
                              <span className={styles.checkmark}>✓</span>
                            )}
                          </button>
                        ))
                      )}
                    </div>
                  )}
                </div>
              ) : (
                <div className={styles.selectWrapper} ref={variantMenuRef}>
                  <button
                    type="button"
                    className={styles.select}
                    onClick={() => setIsVariantMenuOpen(!isVariantMenuOpen)}
                  >
                    <span> {selectedVariant?.label || "default"}</span>
                    <span className={styles.chevron}>▼</span>
                  </button>
                  {isVariantMenuOpen && (
                    <div className={styles.selectMenu}>
                      {variants.map((variant) => (
                        <button
                          key={variant.value}
                          type="button"
                          className={`${styles.selectItem}

                ${
                  (formData.settings as any)?.templateVariant === variant.value
                    ? styles.selectItemActive
                    : ""
                }

                `}
                          onClick={() => {
                            setFormData({
                              ...formData,
                              settings: {
                                ...(formData.settings as any),
                                templateVariant: variant.value,
                              },
                            });
                            setIsVariantMenuOpen(false);
                          }}
                        >
                          {variant.label}
                          {(formData.settings as any)?.templateVariant ===
                            variant.value && (
                            <span className={styles.checkmark}>✓</span>
                          )}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
          {/* 區塊標題與副標題 */}
          <div className={styles.formGrid}>
            <div className={styles.formGroup}>
              <label className={styles.label}>區塊標題</label>
              <input
                type="text"
                className={styles.input}
                value={formData.title || ""}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    title: e.target.value,
                  })
                }
                placeholder="區塊標題（可選）"
              />
            </div>
            <div className={styles.formGroup}>
              <label className={styles.label}>區塊標題（英文）</label>
              <input
                type="text"
                className={styles.input}
                value={formData.titleEn || ""}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    titleEn: e.target.value,
                  })
                }
                placeholder="例如：About Us"
              />
            </div>
            <div className={styles.formGroup}>
              <label className={styles.label}>區塊副標題</label>
              <input
                type="text"
                className={styles.input}
                value={formData.subtitle || ""}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    subtitle: e.target.value,
                  })
                }
                placeholder="區塊副標題（可選）"
              />
            </div>
            <div className={styles.formGroup}>
              <label className={styles.label}>區塊副標題（英文）</label>
              <input
                type="text"
                className={styles.input}
                value={formData.subtitleEn || ""}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    subtitleEn: e.target.value,
                  })
                }
                placeholder="例如：About Us"
              />
            </div>
          </div>
          {/* Banner 橫幅設定 */}
          {formData.sectionType === "hero" && (
            <HeroSectionForm
              value={{
                title: formData.title,
                titleEn: formData.titleEn,
                subtitle: formData.subtitle,
                subtitleEn: formData.subtitleEn,
                heroImages: (formData.settings as any)?.heroImages,
              }}
              onChange={(heroValue: HeroSectionFormValue) => {
                setFormData({
                  ...formData,
                  title: heroValue.title,
                  titleEn: heroValue.titleEn,
                  subtitle: heroValue.subtitle,
                  subtitleEn: heroValue.subtitleEn,
                  settings: {
                    ...formData.settings,
                    heroImages: heroValue.heroImages,
                  },
                });
              }}
              sectionTitle="Banner 圖片（可多張）"
              titleLabel="標題"
              subtitleLabel="副標題"
              imagesLabel="Banner 圖片（可多張）"
            />
          )}
          {/* Icon 圖文設定 */}
          {formData.sectionType === "icon_features" && (
            <div className={styles.formSection}>
              <h3 className={styles.sectionTitle}>icon項目</h3>
              {(formData.settings?.features || []).map(
                (feature: any, index: number) => (
                  <div key={index} className={styles.featureItem}>
                    <div className={styles.featureItemHeader}>
                      <span className={styles.featureItemNumber}>
                        項目 {index + 1}
                      </span>
                      <button
                        type="button"
                        className={styles.deleteButton}
                        onClick={() => removeFeatureItem(index)}
                      >
                        <FiTrash2 size={16} />
                      </button>
                    </div>
                    <div className={styles.formGroup}>
                      <label className={styles.label}>圖標類型</label>
                      <select
                        className={styles.input}
                        value={
                          feature.iconImage
                            ? "custom"
                            : feature.icon || "shield"
                        }
                        onChange={(e) => {
                          if (e.target.value === "custom") {
                            // 保持現狀，不改變
                            return;
                          } else {
                            // 清除自定義圖片，使用預設圖標
                            updateFeatureItemBatch(index, {
                              iconImage: "",
                              icon: e.target.value,
                            });
                          }
                        }}
                      >
                        <option value="custom">自定義圖片</option>
                        <option value="shield">盾牌 (Shield)</option>
                        <option value="zap">閃電 (Zap)</option>
                        <option value="users">用戶 (Users)</option>
                        <option value="award">獎盃 (Award)</option>
                        <option value="check">勾選 (Check)</option>
                        <option value="star">星星 (Star)</option>
                      </select>
                      <p className={styles.helpText}>
                        選擇預設圖標或使用自定義圖片
                      </p>
                    </div>
                    <div className={styles.formGroup}>
                      <label className={styles.label}>Icon 圖片（可選）</label>
                      {feature.iconImage ? (
                        <div className={styles.imagePreview}>
                          <img src={feature.iconImage} alt="Icon 預覽" />
                          <button
                            type="button"
                            className={styles.removeImage}
                            onClick={() => {
                              // 清除自定義圖片並恢復預設圖標
                              updateFeatureItemBatch(index, {
                                iconImage: "",
                                icon: feature.icon || "shield",
                              });
                            }}
                          >
                            <FiX size={16} />
                          </button>
                        </div>
                      ) : (
                        <ImageUploader
                          buttonLabel=""
                          className={styles.uploadArea}
                          onUpload={(url) =>
                            updateFeatureItem(index, "iconImage", url)
                          }
                        >
                          <>
                            <FiUpload size={24} /> <span>上傳自定義圖片</span>
                          </>
                        </ImageUploader>
                      )}
                      <p className={styles.helpText}>
                        上傳自定義圖片後，將優先顯示自定義圖片而非預設圖標
                      </p>
                    </div>
                    <div className={styles.formGrid}>
                      <div className={styles.formGroup}>
                        <label className={styles.label}>標題</label>
                        <input
                          type="text"
                          className={styles.input}
                          value={feature.title || ""}
                          onChange={(e) =>
                            updateFeatureItem(index, "title", e.target.value)
                          }
                          placeholder="功能標題"
                        />
                      </div>
                      <div className={styles.formGroup}>
                        <label className={styles.label}>標題（英文）</label>
                        <input
                          type="text"
                          className={styles.input}
                          value={feature.titleEn || ""}
                          onChange={(e) =>
                            updateFeatureItem(index, "titleEn", e.target.value)
                          }
                          placeholder="功能標題（英文）"
                        />
                      </div>
                      <div className={styles.formGroup}>
                        <label className={styles.label}>說明</label>
                        <textarea
                          className={styles.textarea}
                          value={feature.description || ""}
                          onChange={(e) =>
                            updateFeatureItem(
                              index,
                              "description",
                              e.target.value,
                            )
                          }
                          placeholder="功能說明"
                          rows={2}
                        />
                      </div>
                      <div className={styles.formGroup}>
                        <label className={styles.label}>說明（英文）</label>
                        <textarea
                          className={styles.textarea}
                          value={feature.descriptionEn || ""}
                          onChange={(e) =>
                            updateFeatureItem(
                              index,
                              "descriptionEn",
                              e.target.value,
                            )
                          }
                          placeholder="功能說明（英文）"
                          rows={2}
                        />
                      </div>
                    </div>
                  </div>
                ),
              )}
              <button
                type="button"
                className={styles.addItemButton}
                onClick={addFeatureItem}
              >
                <FiPlus size={20} /> <span>新增項目</span>
              </button>
            </div>
          )}
          {/* 圖文說明設定 */}
          {formData.sectionType === "image_text" && (
            <div className={styles.formSection}>
              <h3 className={styles.sectionTitle}>圖片與內容</h3>
              <div className={styles.formGroup}>
                <label className={styles.label}>圖片</label>
                {(formData.settings as any)?.image ? (
                  <div className={styles.imagePreview}>
                    <img
                      src={(formData.settings as any)?.image as string}
                      alt="圖片預覽"
                    />
                    <button
                      type="button"
                      className={styles.removeImage}
                      onClick={() =>
                        setFormData({
                          ...formData,
                          settings: {
                            ...formData.settings,
                            image: "",
                          },
                        })
                      }
                    >
                      <FiX size={16} />
                    </button>
                  </div>
                ) : (
                  <ImageUploader
                    buttonLabel=""
                    className={styles.uploadArea}
                    onUpload={(url) =>
                      setFormData({
                        ...formData,
                        settings: {
                          ...formData.settings,
                          image: url,
                        },
                      })
                    }
                  >
                    <>
                      <FiUpload size={24} /> <span>上傳圖片</span>
                    </>
                  </ImageUploader>
                )}
              </div>

              <div className={styles.formGroup}>
                <label className={styles.label}>說明文字</label>
                <RichTextEditor
                  value={formData.content || ""}
                  onChange={(value) =>
                    setFormData({
                      ...formData,
                      content: value,
                    })
                  }
                  placeholder="輸入說明文字..."
                />
              </div>
              <div className={styles.formGroup}>
                <label className={styles.label}>說明文字（英文）</label>
                <RichTextEditor
                  value={formData.contentEn || ""}
                  onChange={(value) =>
                    setFormData({
                      ...formData,
                      contentEn: value,
                    })
                  }
                  placeholder="輸入說明文字（英文）..."
                />
              </div>
              <ButtonSettingsForm
                value={{
                  buttonText: (formData.settings as any)?.buttonText,
                  buttonTextEn: (formData.settings as any)?.buttonTextEn,
                  buttonLink: (formData.settings as any)?.buttonLink,
                }}
                onChange={(values) =>
                  setFormData({
                    ...formData,
                    settings: { ...formData.settings, ...values },
                  })
                }
              />
            </div>
          )}
          {/* 影片說明設定 */}
          {formData.sectionType === "video_text" && (
            <div className={styles.formSection}>
              <h3 className={styles.sectionTitle}>影片與內容</h3>
              <div className={styles.formGroup}>
                <label className={styles.label}>YouTube 網址</label>
                {(formData.settings as any)?.video ? (
                  <div className={styles.imagePreview}>
                    <iframe
                      src={convertYouTubeUrlToEmbed(
                        ((formData.settings as any)?.video as string) || "",
                      )}
                      style={{
                        position: "absolute",
                        top: 0,
                        left: 0,
                        width: "100%",
                        height: "100%",
                        border: "none",
                      }}
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                      allowFullScreen
                    />
                    <button
                      type="button"
                      className={styles.removeImage}
                      onClick={() =>
                        setFormData({
                          ...formData,
                          settings: {
                            ...formData.settings,
                            video: "",
                          },
                        })
                      }
                    >
                      <FiX size={16} />
                    </button>
                  </div>
                ) : null}
                <input
                  type="text"
                  className={styles.input}
                  value={((formData.settings as any)?.video as string) || ""}
                  onChange={(e) => {
                    const url = e.target.value;
                    const embedUrl = convertYouTubeUrlToEmbed(url);
                    setFormData({
                      ...formData,
                      settings: {
                        ...formData.settings,
                        video: url,
                      },
                    });
                  }}
                  placeholder="例如：https://www.youtube.com/watch?v=VIDEO_ID 或 https://youtu.be/VIDEO_ID"
                />
                <p className={styles.helpText}>
                  請貼上 YouTube 影片網址，系統會自動轉換為嵌入格式
                </p>
                {(formData.settings as any)?.video
                  ? !isValidYouTubeUrl(
                      ((formData.settings as any)?.video as string) || "",
                    ) && (
                      <p
                        className={styles.helpText}
                        style={{ color: "#ff4444", marginTop: "4px" }}
                      >
                        警告：此網址可能不是有效的 YouTube 網址
                      </p>
                    )
                  : null}
              </div>
              <div className={styles.formGroup}>
                <label className={styles.label}>說明文字</label>
                <RichTextEditor
                  value={formData.content || ""}
                  onChange={(value) =>
                    setFormData({
                      ...formData,
                      content: value,
                    })
                  }
                  placeholder="輸入說明文字..."
                />
              </div>
              <div className={styles.formGroup}>
                <label className={styles.label}>說明文字（英文）</label>
                <RichTextEditor
                  value={formData.contentEn || ""}
                  onChange={(value) =>
                    setFormData({
                      ...formData,
                      contentEn: value,
                    })
                  }
                  placeholder="輸入說明文字..."
                />
              </div>
              <ButtonSettingsForm
                value={{
                  buttonText: (formData.settings as any)?.buttonText,
                  buttonTextEn: (formData.settings as any)?.buttonTextEn,
                  buttonLink: (formData.settings as any)?.buttonLink,
                }}
                onChange={(values) =>
                  setFormData({
                    ...formData,
                    settings: { ...formData.settings, ...values },
                  })
                }
              />
            </div>
          )}
          {/* 卡片區塊設定 */}
          {formData.sectionType === "card_grid" && (
            <div className={styles.formSection}>
              <h3 className={styles.sectionTitle}>資料設定</h3>
              <div className={styles.formGrid}>
                <div className={styles.formGroup}>
                  <label className={styles.label}>資料來源</label>
                  <select
                    className={styles.input}
                    value={(formData.settings as any)?.dataSource || "custom"}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        settings: {
                          ...formData.settings,
                          dataSource: e.target.value,
                        },
                      })
                    }
                  >
                    <option value="news">新聞文章</option>
                    <option value="custom">自定義</option>
                  </select>
                  <p className={styles.helpText}>選擇卡片資料的來源類型</p>
                </div>
                <div className={styles.formGroup}>
                  <label className={styles.label}>顯示數量</label>
                  <input
                    type="number"
                    className={styles.input}
                    value={formData.settings?.limit || 6}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        settings: {
                          ...formData.settings,
                          limit: parseInt(e.target.value) || 6,
                        },
                      })
                    }
                    min="1"
                    max="20"
                    placeholder="6"
                  />
                  <p className={styles.helpText}>最多顯示的卡片數量（1-20）</p>
                </div>
              </div>
              <div className={styles.formGrid}>
                <div className={styles.formGroup}>
                  <label className={styles.label}>排序方式</label>
                  <select
                    className={styles.input}
                    value={(formData.settings as any)?.sortBy || "date"}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        settings: {
                          ...formData.settings,
                          sortBy: e.target.value,
                        },
                      })
                    }
                  >
                    <option value="date">日期（最新優先）</option>
                    <option value="date_asc">日期（最舊優先）</option>
                    <option value="title">標題（A-Z）</option>
                    <option value="title_desc">標題（Z-A）</option>
                  </select>
                </div>
                <div className={styles.formGroup}>
                  <label className={styles.label}>篩選條件</label>
                  <input
                    type="text"
                    className={styles.input}
                    value={formData.settings?.filter || ""}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        settings: {
                          ...formData.settings,
                          filter: e.target.value,
                        },
                      })
                    }
                    placeholder="例如：category=技術分享"
                  />
                  <p className={styles.helpText}>
                    可選：設定篩選條件（格式：key=value），若啟用分類篩選則此選項無效
                  </p>
                </div>
              </div>
              {/* 分類篩選設定 */}
              {((formData.settings as any)?.dataSource === "news" ||
                (formData.settings as any)?.dataSource === "custom") && (
                <div className={styles.formGroup}>
                  <div className={styles.switchGroup}>
                    <label className={styles.label}>啟用分類篩選</label>
                    <label className={styles.switch}>
                      <input
                        type="checkbox"
                        checked={
                          (formData.settings as any)?.enableCategoryFilter ||
                          false
                        }
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            settings: {
                              ...formData.settings,
                              enableCategoryFilter: e.target.checked,
                            },
                          })
                        }
                      />
                      <span className={styles.slider}></span>
                    </label>
                  </div>
                  <p className={styles.helpText}>
                    啟用後將顯示 TabBar 分類篩選器，可讓使用者依分類篩選卡片
                  </p>
                </div>
              )}
              {(formData.settings as any)?.enableCategoryFilter && (
                <div className={styles.formGroup}>
                  <label className={styles.label}>分類列表（可選）</label>
                  <textarea
                    className={styles.textarea}
                    value={
                      Array.isArray(formData.settings?.categories)
                        ? formData.settings.categories.join("\n")
                        : ""
                    }
                    onChange={(e) => {
                      const categories = e.target.value
                        .split("\n")
                        .map((cat) => cat.trim())
                        .filter((cat) => cat.length > 0);
                      setFormData({
                        ...formData,
                        settings: {
                          ...formData.settings,
                          categories,
                        },
                      });
                    }}
                    placeholder="每行一個分類名稱，例如：&#10;技術文章&#10;媒體報導&#10;活動訊息&#10;&#10;留空則自動從資料中提取分類"
                    rows={5}
                  />
                  <p className={styles.helpText}>
                    自定義分類列表，每行一個。留空則自動從資料中提取所有分類
                  </p>
                </div>
              )}
              {/* 自定義卡片項目：預設（未設定資料來源）或選擇 custom 時都顯示 */}
              {(!(formData.settings as any)?.dataSource ||
                (formData.settings as any)?.dataSource === "custom") && (
                <div className={styles.formGroup}>
                  <label className={styles.label}>自定義卡片項目</label>
                  {(formData.settings?.cards || []).map(
                    (card: any, index: number) => (
                      <div key={index} className={styles.featureItem}>
                        <div className={styles.featureItemHeader}>
                          <span className={styles.featureItemNumber}>
                            卡片 {index + 1}
                          </span>
                          <button
                            type="button"
                            className={styles.deleteButton}
                            onClick={() => {
                              const cards = [
                                ...(formData.settings?.cards || []),
                              ];
                              cards.splice(index, 1);

                              setFormData({
                                ...formData,
                                settings: {
                                  ...formData.settings,
                                  cards,
                                },
                              });
                            }}
                          >
                            <FiTrash2 size={16} />
                          </button>
                        </div>
                        <div className={styles.formGrid}>
                          <div className={styles.formGroup}>
                            <label className={styles.label}>標題</label>
                            <input
                              type="text"
                              className={styles.input}
                              value={card.title || ""}
                              onChange={(e) => {
                                const cards = [
                                  ...(formData.settings?.cards || []),
                                ];

                                cards[index] = {
                                  ...cards[index],
                                  title: e.target.value,
                                };

                                setFormData({
                                  ...formData,
                                  settings: {
                                    ...formData.settings,
                                    cards,
                                  },
                                });
                              }}
                              placeholder="卡片標題"
                            />
                          </div>
                          <div className={styles.formGroup}>
                            <label className={styles.label}>標題（英文）</label>
                            <input
                              type="text"
                              className={styles.input}
                              value={card.titleEn || ""}
                              onChange={(e) => {
                                const cards = [
                                  ...(formData.settings?.cards || []),
                                ];

                                cards[index] = {
                                  ...cards[index],
                                  titleEn: e.target.value,
                                };

                                setFormData({
                                  ...formData,
                                  settings: {
                                    ...formData.settings,
                                    cards,
                                  },
                                });
                              }}
                              placeholder="Card Title"
                            />
                          </div>
                        </div>
                        <div className={styles.formGrid}>
                          <div className={styles.formGroup}>
                            <label className={styles.label}>摘要</label>
                            <textarea
                              className={styles.textarea}
                              value={card.excerpt || ""}
                              onChange={(e) => {
                                const cards = [
                                  ...(formData.settings?.cards || []),
                                ];

                                cards[index] = {
                                  ...cards[index],
                                  excerpt: e.target.value,
                                };

                                setFormData({
                                  ...formData,
                                  settings: {
                                    ...formData.settings,
                                    cards,
                                  },
                                });
                              }}
                              placeholder="卡片摘要"
                              rows={2}
                            />
                          </div>
                          <div className={styles.formGroup}>
                            <label className={styles.label}>摘要（英文）</label>
                            <textarea
                              className={styles.textarea}
                              value={card.excerptEn || ""}
                              onChange={(e) => {
                                const cards = [
                                  ...(formData.settings?.cards || []),
                                ];

                                cards[index] = {
                                  ...cards[index],
                                  excerptEn: e.target.value,
                                };

                                setFormData({
                                  ...formData,
                                  settings: {
                                    ...formData.settings,
                                    cards,
                                  },
                                });
                              }}
                              placeholder="Card Excerpt"
                              rows={2}
                            />
                          </div>
                        </div>
                        <div className={styles.formGrid}>
                          <div className={styles.formGroup}>
                            <label className={styles.label}>分類</label>
                            <input
                              type="text"
                              className={styles.input}
                              value={card.category || ""}
                              onChange={(e) => {
                                const cards = [
                                  ...(formData.settings?.cards || []),
                                ];

                                cards[index] = {
                                  ...cards[index],
                                  category: e.target.value,
                                };

                                setFormData({
                                  ...formData,
                                  settings: {
                                    ...formData.settings,
                                    cards,
                                  },
                                });
                              }}
                              placeholder="例如：媒體報導"
                            />
                          </div>
                          <div className={styles.formGroup}>
                            <label className={styles.label}>分類（英文）</label>
                            <input
                              type="text"
                              className={styles.input}
                              value={card.categoryEn || ""}
                              onChange={(e) => {
                                const cards = [
                                  ...(formData.settings?.cards || []),
                                ];

                                cards[index] = {
                                  ...cards[index],
                                  categoryEn: e.target.value,
                                };

                                setFormData({
                                  ...formData,
                                  settings: {
                                    ...formData.settings,
                                    cards,
                                  },
                                });
                              }}
                              placeholder="例如：媒體報導"
                            />
                          </div>
                          <div className={styles.formGroup}>
                            <label className={styles.label}>發布日期</label>
                            <input
                              type="date"
                              className={styles.input}
                              value={card.publishDate || ""}
                              onChange={(e) => {
                                const cards = [
                                  ...(formData.settings?.cards || []),
                                ];

                                cards[index] = {
                                  ...cards[index],
                                  publishDate: e.target.value,
                                };

                                setFormData({
                                  ...formData,
                                  settings: {
                                    ...formData.settings,
                                    cards,
                                  },
                                });
                              }}
                            />
                          </div>
                        </div>
                        <div className={styles.formGroup}>
                          <label className={styles.label}>特色圖片</label>
                          {card.featuredImage ? (
                            <div className={styles.imagePreview}>
                              <img src={card.featuredImage} alt="圖片預覽" />
                              <button
                                type="button"
                                className={styles.removeImage}
                                onClick={() => {
                                  const cards = [
                                    ...(formData.settings?.cards || []),
                                  ];

                                  cards[index] = {
                                    ...cards[index],
                                    featuredImage: "",
                                  };

                                  setFormData({
                                    ...formData,
                                    settings: {
                                      ...formData.settings,
                                      cards,
                                    },
                                  });
                                }}
                              >
                                <FiX size={16} />
                              </button>
                            </div>
                          ) : (
                            <ImageUploader
                              buttonLabel=""
                              className={styles.uploadArea}
                              onUpload={(url) => {
                                const cards = [
                                  ...(formData.settings?.cards || []),
                                ];

                                cards[index] = {
                                  ...cards[index],
                                  featuredImage: url,
                                };

                                setFormData({
                                  ...formData,
                                  settings: {
                                    ...formData.settings,
                                    cards,
                                  },
                                });
                              }}
                            >
                              <>
                                <FiUpload size={24} /> <span>上傳圖片</span>
                              </>
                            </ImageUploader>
                          )}
                        </div>
                        <div className={styles.formGroup}>
                          <label className={styles.label}>連結網址</label>
                          <input
                            type="text"
                            className={styles.input}
                            value={card.link || ""}
                            onChange={(e) => {
                              const cards = [
                                ...(formData.settings?.cards || []),
                              ];

                              cards[index] = {
                                ...cards[index],
                                link: e.target.value,
                              };

                              setFormData({
                                ...formData,
                                settings: {
                                  ...formData.settings,
                                  cards,
                                },
                              });
                            }}
                            placeholder="例如：/news/1 或 https://example.com"
                          />
                        </div>
                      </div>
                    ),
                  )}
                  <button
                    type="button"
                    className={styles.addItemButton}
                    onClick={() => {
                      const cards = formData.settings?.cards || [];

                      setFormData({
                        ...formData,
                        settings: {
                          ...formData.settings,
                          cards: [
                            ...cards,
                            {
                              title: "",
                              titleEn: "",
                              excerpt: "",
                              excerptEn: "",
                              category: "",
                              categoryEn: "",
                              publishDate: "",
                              featuredImage: "",
                              link: "",
                            },
                          ],
                        },
                      });
                    }}
                  >
                    <FiPlus size={20} /> <span>新增卡片</span>
                  </button>
                </div>
              )}
            </div>
          )}
          {/* 畫廊設定 */}
          {formData.sectionType === "gallery" && (
            <div className={styles.formSection}>
              <h3 className={styles.sectionTitle}>圖片管理</h3>
              <div className={styles.formGroup}>
                <label className={styles.label}>圖片網址（每行一個）</label>
                <textarea
                  className={styles.textarea}
                  value={(formData.settings as any)?.images?.join("\n") || ""}
                  onChange={(e) => {
                    const urls = e.target.value
                      .split("\n")
                      .filter((url) => url.trim());

                    setFormData({
                      ...formData,
                      settings: {
                        ...formData.settings,
                        images: urls,
                      },
                    });
                  }}
                  placeholder="輸入圖片網址，每行一個"
                  rows={5}
                />
                <p className={styles.helpText}>
                  或使用下方上傳功能批量上傳圖片
                </p>
              </div>
              <div className={styles.formGroup}>
                <label className={styles.label}>批量上傳圖片</label>
                <ImageUploader
                  multiple
                  buttonLabel=""
                  className={styles.uploadArea}
                  onUpload={() => {
                    // multiple 情境下不會使用到此 callback
                  }}
                  onMultipleUpload={(urls) => {
                    const prev = ((formData.settings as any)?.images ||
                      []) as string[];

                    setFormData({
                      ...formData,
                      settings: {
                        ...formData.settings,
                        images: [...prev, ...urls],
                      },
                    });
                  }}
                >
                  <>
                    <FiUpload size={24} /> <span>選擇多張圖片</span>
                  </>
                </ImageUploader>
              </div>
              {((formData.settings as any)?.images?.length ?? 0) > 0 && (
                <div className={styles.imageGrid}>
                  {((formData.settings as any)?.images || []).map(
                    (img: string, index: number) => (
                      <div key={index} className={styles.imageGridItem}>
                        <img
                          src={img}
                          alt={`圖片 ${index + 1}

                    `}
                        />
                        <button
                          type="button"
                          className={styles.removeImage}
                          onClick={() => removeImage(index)}
                        >
                          <FiX size={16} />
                        </button>
                      </div>
                    ),
                  )}
                </div>
              )}
            </div>
          )}
          {/* 內容區塊專用 */}
          {formData.sectionType === "content_block" && (
            <div className={styles.formSection}>
              <div className={styles.formGroup}>
                <label className={styles.label}>內容</label>
                <RichTextEditor
                  value={formData.content || ""}
                  onChange={(value) =>
                    setFormData({
                      ...formData,
                      content: value,
                    })
                  }
                  placeholder="輸入內容..."
                />
              </div>
              <div className={styles.formGroup}>
                <label className={styles.label}>內容（英文）</label>
                <RichTextEditor
                  value={formData.contentEn || ""}
                  onChange={(value) =>
                    setFormData({
                      ...formData,
                      contentEn: value,
                    })
                  }
                  placeholder="輸入內容（英文）..."
                />
              </div>
            </div>
          )}
          {/* CTA 區塊專用設定 */}
          {formData.sectionType === "cta" && (
            <div className={styles.formSection}>
              <h3 className={styles.sectionTitle}>呼籲內容</h3>
              <div className={styles.formGroup}>
                <label className={styles.label}>內容說明</label>
                <RichTextEditor
                  value={(formData.settings as any)?.ctaContent || ""}
                  onChange={(value) =>
                    setFormData({
                      ...formData,
                      settings: {
                        ...formData.settings,
                        ctaContent: value,
                      },
                    })
                  }
                  placeholder="輸入呼籲內容說明..."
                />
                <p className={styles.helpText}>
                  可使用文字編輯器設定呼籲內容的格式
                </p>
              </div>
              <div className={styles.formGroup}>
                <label className={styles.label}>內容說明（英文）</label>
                <RichTextEditor
                  value={(formData.settings as any)?.ctaContentEn || ""}
                  onChange={(value) =>
                    setFormData({
                      ...formData,
                      settings: {
                        ...formData.settings,
                        ctaContentEn: value,
                      },
                    })
                  }
                  placeholder="輸入呼籲內容說明（英文）..."
                />
              </div>
              <ButtonSettingsForm
                value={{
                  buttonText: (formData.settings as any)?.buttonText,
                  buttonTextEn: (formData.settings as any)?.buttonTextEn,
                  buttonLink: (formData.settings as any)?.buttonLink,
                  buttonColor: (formData.settings as any)?.buttonColor,
                  buttonTextColor: (formData.settings as any)?.buttonTextColor,
                }}
                onChange={(values) =>
                  setFormData({
                    ...formData,
                    settings: { ...formData.settings, ...values },
                  })
                }
                showColorSettings
              />
              <div className={styles.formGroup}>
                <label className={styles.label}></label>
                <div className={styles.switchGroup}>
                  <span className={styles.label}>
                    {formData.content ? "顯示按鈕" : "隱藏按鈕"}
                  </span>
                  <label className={styles.switch}>
                    <input
                      type="checkbox"
                      checked={!!formData.content}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          content: e.target.checked ? "show" : "",
                        })
                      }
                    />
                    <span className={styles.slider}></span>
                  </label>
                </div>
                <p className={styles.helpText}>開啟此選項以顯示行動呼籲按鈕</p>
              </div>
            </div>
          )}
          {/* 下載專區設定 */}
          {formData.sectionType === "downloads" && (
            <div className={styles.formSection}>
              <h3 className={styles.sectionTitle}>下載項目</h3>
              {(formData.settings?.downloads || []).map(
                (download: any, index: number) => (
                  <div key={index} className={styles.featureItem}>
                    <div className={styles.featureItemHeader}>
                      <span className={styles.featureItemNumber}>
                        項目 {index + 1}
                      </span>
                      <button
                        type="button"
                        className={styles.deleteButton}
                        onClick={() => {
                          const downloads = [
                            ...(formData.settings?.downloads || []),
                          ];
                          downloads.splice(index, 1);

                          setFormData({
                            ...formData,
                            settings: {
                              ...formData.settings,
                              downloads,
                            },
                          });
                        }}
                      >
                        <FiTrash2 size={16} />
                      </button>
                    </div>

                    <div className={styles.formGrid}>
                      <div className={styles.formGroup}>
                        <label className={styles.label}>標題</label>
                        <input
                          type="text"
                          className={styles.input}
                          value={download.title || ""}
                          onChange={(e) => {
                            const downloads = [
                              ...(formData.settings?.downloads || []),
                            ];

                            downloads[index] = {
                              ...downloads[index],
                              title: e.target.value,
                            };

                            setFormData({
                              ...formData,
                              settings: {
                                ...formData.settings,
                                downloads,
                              },
                            });
                          }}
                          placeholder="下載項目標題"
                        />
                      </div>
                      <div className={styles.formGroup}>
                        <label className={styles.label}>標題（英文）</label>
                        <input
                          type="text"
                          className={styles.input}
                          value={download.titleEn || ""}
                          onChange={(e) => {
                            const downloads = [
                              ...(formData.settings?.downloads || []),
                            ];

                            downloads[index] = {
                              ...downloads[index],
                              titleEn: e.target.value,
                            };

                            setFormData({
                              ...formData,
                              settings: {
                                ...formData.settings,
                                downloads,
                              },
                            });
                          }}
                          placeholder="下載項目標題"
                        />
                      </div>
                      <div className={styles.formGroup}>
                        <label className={styles.label}>分類</label>
                        <input
                          type="text"
                          className={styles.input}
                          value={download.category || ""}
                          onChange={(e) => {
                            const downloads = [
                              ...(formData.settings?.downloads || []),
                            ];

                            downloads[index] = {
                              ...downloads[index],
                              category: e.target.value,
                            };

                            setFormData({
                              ...formData,
                              settings: {
                                ...formData.settings,
                                downloads,
                              },
                            });
                          }}
                          placeholder="例如：產品手冊"
                        />
                      </div>
                      <div className={styles.formGroup}>
                        <label className={styles.label}>分類（英文）</label>
                        <input
                          type="text"
                          className={styles.input}
                          value={download.categoryEn || ""}
                          onChange={(e) => {
                            const downloads = [
                              ...(formData.settings?.downloads || []),
                            ];

                            downloads[index] = {
                              ...downloads[index],
                              categoryEn: e.target.value,
                            };

                            setFormData({
                              ...formData,
                              settings: {
                                ...formData.settings,
                                downloads,
                              },
                            });
                          }}
                          placeholder="例如：產品手冊"
                        />
                      </div>
                      <div className={styles.formGroup}>
                        <label className={styles.label}>發布日期</label>
                        <input
                          type="date"
                          className={styles.input}
                          value={download.publishDate || ""}
                          onChange={(e) => {
                            const downloads = [
                              ...(formData.settings?.downloads || []),
                            ];

                            downloads[index] = {
                              ...downloads[index],
                              publishDate: e.target.value,
                            };

                            setFormData({
                              ...formData,
                              settings: {
                                ...formData.settings,
                                downloads,
                              },
                            });
                          }}
                        />
                      </div>
                    </div>
                    <div className={styles.formGroup}>
                      <label className={styles.label}>檔案上傳</label>
                      {download.fileUrl && download.fileName ? (
                        <div className={styles.filePreview}>
                          <div className={styles.fileInfo}>
                            <FiFileText size={20} className={styles.fileIcon} />
                            <div className={styles.fileDetails}>
                              <span className={styles.fileName}>
                                {download.fileName}
                              </span>
                              {download.fileSize && (
                                <span className={styles.fileSize}>
                                  {download.fileSize}
                                </span>
                              )}
                            </div>
                          </div>
                          <button
                            type="button"
                            className={styles.removeFileButton}
                            onClick={() => {
                              const downloads = [
                                ...(formData.settings?.downloads || []),
                              ];

                              downloads[index] = {
                                ...downloads[index],
                                fileUrl: "",
                                fileName: "",
                                fileSize: "",
                                fileType: "",
                              };

                              setFormData({
                                ...formData,
                                settings: {
                                  ...formData.settings,
                                  downloads,
                                },
                              });
                            }}
                          >
                            <FiX size={16} />
                          </button>
                        </div>
                      ) : download.fileUrl && !download.fileName ? (
                        <div className={styles.filePreview}>
                          <div className={styles.fileInfo}>
                            <FiFileText size={20} className={styles.fileIcon} />
                            <div className={styles.fileDetails}>
                              <span className={styles.fileName}>
                                {download.fileName || "已上傳的檔案"}
                              </span>
                              {download.fileSize ? (
                                <span className={styles.fileSize}>
                                  {download.fileSize}
                                </span>
                              ) : (
                                <span className={styles.fileSize}>
                                  {download.fileUrl}
                                </span>
                              )}
                            </div>
                          </div>
                          <button
                            type="button"
                            className={styles.removeFileButton}
                            onClick={() => {
                              const downloads = [
                                ...(formData.settings?.downloads || []),
                              ];

                              downloads[index] = {
                                ...downloads[index],
                                fileUrl: "",
                              };

                              setFormData({
                                ...formData,
                                settings: {
                                  ...formData.settings,
                                  downloads,
                                },
                              });
                            }}
                          >
                            <FiX size={16} />
                          </button>
                        </div>
                      ) : (
                        <label className={styles.uploadArea}>
                          <input
                            type="file"
                            className={styles.fileInput}
                            onChange={(e) => handleFileUpload(e, index)}
                            accept=".pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.zip,.rar,.txt,.jpg,.jpeg,.png,.gif"
                            disabled={uploadingDownloadIndex === index}
                          />
                          <FiUpload size={24} />{" "}
                          <span>
                            {uploadingDownloadIndex === index
                              ? "上傳中..."
                              : "選擇檔案上傳"}
                          </span>
                          <p className={styles.helpText}>
                            支援
                            PDF、Word、Excel、PowerPoint、壓縮檔、圖片等格式
                          </p>
                        </label>
                      )}
                    </div>
                    <div className={styles.formGrid}>
                      <div className={styles.formGroup}>
                        <label className={styles.label}>檔案大小</label>
                        <input
                          type="text"
                          className={styles.input}
                          value={download.fileSize || ""}
                          onChange={(e) => {
                            const downloads = [
                              ...(formData.settings?.downloads || []),
                            ];

                            downloads[index] = {
                              ...downloads[index],
                              fileSize: e.target.value,
                            };

                            setFormData({
                              ...formData,
                              settings: {
                                ...formData.settings,
                                downloads,
                              },
                            });
                          }}
                          placeholder="自動計算（或手動輸入）"
                          readOnly={
                            !!download.fileUrl &&
                            !!download.fileSize &&
                            !!download.fileName
                          }
                        />
                        <p className={styles.helpText}>
                          上傳檔案後會自動計算，也可手動修改
                        </p>
                      </div>
                      <div className={styles.formGroup}>
                        <label className={styles.label}>檔案網址（可選）</label>
                        <input
                          type="text"
                          className={styles.input}
                          value={
                            download.fileUrl && !download.fileName
                              ? download.fileUrl
                              : ""
                          }
                          onChange={(e) => {
                            const downloads = [
                              ...(formData.settings?.downloads || []),
                            ];

                            downloads[index] = {
                              ...downloads[index],
                              fileUrl: e.target.value,
                            };

                            setFormData({
                              ...formData,
                              settings: {
                                ...formData.settings,
                                downloads,
                              },
                            });
                          }}
                          placeholder="或直接輸入外部檔案網址"
                        />
                        <p className={styles.helpText}>
                          如果已上傳檔案，此欄位可留空；或直接輸入外部檔案網址
                        </p>
                      </div>
                    </div>
                  </div>
                ),
              )}
              <button
                type="button"
                className={styles.addItemButton}
                onClick={() => {
                  const downloads = formData.settings?.downloads || [];

                  setFormData({
                    ...formData,
                    settings: {
                      ...formData.settings,
                      downloads: [
                        ...downloads,
                        {
                          title: "",
                          titleEn: "",
                          category: "",
                          categoryEn: "",
                          publishDate: "",
                          fileSize: "",
                          fileUrl: "",
                          fileName: "",
                          fileType: "",
                        },
                      ],
                    },
                  });
                }}
              >
                <FiPlus size={20} /> <span>新增下載項目</span>
              </button>
            </div>
          )}
          {/* 產品規格表設定 */}
          {formData.sectionType === "product_specs" && (
            <div className={styles.formSection}>
              <h3 className={styles.sectionTitle}>產品圖片</h3>
              <div className={styles.formGroup}>
                <label className={styles.label}>產品圖片（可多張）</label>
                {formData.settings?.images &&
                formData.settings.images.length > 0 ? (
                  <div className={styles.imageGrid}>
                    {formData.settings.images.map(
                      (image: string, index: number) => (
                        <div key={index} className={styles.imagePreview}>
                          <img
                            src={image}
                            alt={`產品圖片 ${index + 1}

                    `}
                          />
                          <button
                            type="button"
                            className={styles.removeImage}
                            onClick={() => {
                              const images = [
                                ...(formData.settings?.images || []),
                              ];
                              images.splice(index, 1);

                              setFormData({
                                ...formData,
                                settings: {
                                  ...formData.settings,
                                  images,
                                },
                              });
                            }}
                          >
                            <FiX size={16} />
                          </button>
                        </div>
                      ),
                    )}
                  </div>
                ) : null}
                <ImageUploader
                  multiple
                  buttonLabel=""
                  className={styles.uploadArea}
                  onUpload={() => {
                    // multiple 情境下不會使用到此 callback
                  }}
                  onMultipleUpload={(urls) => {
                    setFormData({
                      ...formData,
                      settings: {
                        ...formData.settings,
                        images: [...(formData.settings?.images || []), ...urls],
                      },
                    });
                  }}
                >
                  <>
                    <FiUpload size={24} /> <span>上傳圖片（可多選）</span>
                  </>
                </ImageUploader>
              </div>
              <h3
                className={styles.sectionTitle}
                style={{
                  marginTop: "32px",
                }}
              >
                規格項目
              </h3>
              {(formData.settings?.specs || []).map(
                (spec: any, index: number) => (
                  <div key={index} className={styles.featureItem}>
                    <div className={styles.featureItemHeader}>
                      <span className={styles.featureItemNumber}>
                        項目 {index + 1}
                      </span>
                      <button
                        type="button"
                        className={styles.deleteButton}
                        onClick={() => removeSpecItem(index)}
                      >
                        <FiTrash2 size={16} />
                      </button>
                    </div>
                    <div className={styles.formGrid}>
                      <div className={styles.formGroup}>
                        <label className={styles.label}>規格名稱</label>
                        <input
                          type="text"
                          className={styles.input}
                          value={spec.name || ""}
                          onChange={(e) =>
                            updateSpecItem(index, "name", e.target.value)
                          }
                          placeholder="例如：GPU"
                        />
                      </div>
                      <div className={styles.formGroup}>
                        <label className={styles.label}>規格名稱（英文）</label>
                        <input
                          type="text"
                          className={styles.input}
                          value={spec.nameEn || ""}
                          onChange={(e) =>
                            updateSpecItem(index, "nameEn", e.target.value)
                          }
                          placeholder="例如：GPU"
                        />
                      </div>
                      <div className={styles.formGroup}>
                        <label className={styles.label}>規格值</label>
                        <textarea
                          className={styles.textarea}
                          value={spec.value || ""}
                          onChange={(e) =>
                            updateSpecItem(index, "value", e.target.value)
                          }
                          placeholder="例如：NVIDIA RTX 4090"
                          rows={3}
                        />
                      </div>
                      <div className={styles.formGroup}>
                        <label className={styles.label}>規格值（英文）</label>
                        <textarea
                          className={styles.textarea}
                          value={spec.valueEn || ""}
                          onChange={(e) =>
                            updateSpecItem(index, "valueEn", e.target.value)
                          }
                          placeholder="例如：NVIDIA RTX 4090"
                          rows={3}
                        />
                      </div>
                    </div>
                  </div>
                ),
              )}
              <button
                type="button"
                className={styles.addItemButton}
                onClick={addSpecItem}
              >
                <FiPlus size={20} /> <span>新增規格項目</span>
              </button>
            </div>
          )}
          {/* FAQ 區塊設定 */}
          {formData.sectionType === "faq_section" && (
            <div className={styles.formSection}>
              <h3 className={styles.sectionTitle}>問答項目</h3>
              {(formData.settings?.faqs || []).map(
                (faq: any, index: number) => (
                  <div key={index} className={styles.featureItem}>
                    <div className={styles.featureItemHeader}>
                      <span className={styles.featureItemNumber}>
                        項目{index + 1}
                      </span>
                      <button
                        type="button"
                        className={styles.deleteButton}
                        onClick={() => removeFaqItem(index)}
                      >
                        <FiTrash2 size={16} />
                      </button>
                    </div>
                    <div className={styles.formGrid}>
                      <div className={styles.formGroup}>
                        <label className={styles.label}>問題</label>
                        <input
                          type="text"
                          className={styles.input}
                          value={faq.question || ""}
                          onChange={(e) =>
                            updateFaqItem(index, "question", e.target.value)
                          }
                          placeholder="例如：我有既有網站想要翻新，你們可以幫我嗎？"
                        />
                      </div>
                      <div className={styles.formGroup}>
                        <label className={styles.label}>問題（英文）</label>
                        <input
                          type="text"
                          className={styles.input}
                          value={faq.questionEn || ""}
                          onChange={(e) =>
                            updateFaqItem(index, "questionEn", e.target.value)
                          }
                          placeholder="例如：I have an existing website that I want to update, can you help me?"
                        />
                      </div>
                      <div className={styles.formGroup}>
                        <label className={styles.label}>答案</label>
                        <textarea
                          className={styles.textarea}
                          value={faq.answer || ""}
                          onChange={(e) =>
                            updateFaqItem(index, "answer", e.target.value)
                          }
                          placeholder="例如：我們可以幫你翻新網站，請聯繫我們。"
                          rows={3}
                        />
                      </div>
                      <div className={styles.formGroup}>
                        <label className={styles.label}>答案（英文）</label>
                        <textarea
                          className={styles.textarea}
                          value={faq.answerEn || ""}
                          onChange={(e) =>
                            updateFaqItem(index, "answerEn", e.target.value)
                          }
                          placeholder="例如：We can help you update your website, please contact us."
                          rows={3}
                        />
                      </div>
                    </div>
                  </div>
                ),
              )}
              <button
                type="button"
                className={styles.addItemButton}
                onClick={addFaqItem}
              >
                <FiPlus size={20} /> <span>新增問答項目</span>
              </button>
            </div>
          )}
          {/* 背景設定 */}
          <BgSettingsForm
            value={{
              backgroundImage: (formData.settings as any)?.backgroundImage,
              backgroundColor: (formData.settings as any)?.backgroundColor,
            }}
            onChange={(settings: BgSettings) => {
              setFormData({
                ...formData,
                settings: {
                  ...(formData.settings as any),
                  backgroundImage: (settings as any).backgroundImage,
                  backgroundColor: (settings as any).backgroundColor,
                },
              });
            }}
          />
          <div className={styles.formGroup}>
            <div className={styles.switchGroup}>
              <label className={styles.label}>顯示此區塊</label>
              <label className={styles.switch}>
                <input
                  type="checkbox"
                  checked={(formData.settings as any)?.isVisible !== false}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      settings: {
                        ...(formData.settings as any),
                        isVisible: e.target.checked,
                      },
                    })
                  }
                />
                <span className={styles.slider}></span>
              </label>
            </div>
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

export default SectionModal;
