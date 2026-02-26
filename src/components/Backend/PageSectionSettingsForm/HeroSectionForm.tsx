"use client";

import { useState, useEffect } from "react";
import { FiX, FiUpload } from "react-icons/fi";
import formStyles from "../PageManager/SectionModal.module.scss";
import ImageUploader from "@/components/forms/ImageUploader";

export interface HeroSectionFormValue {
  title?: string; // 可以是 hero_title 或 title
  titleEn?: string; // 英文標題
  subtitle?: string; // 可以是 hero_subtitle 或 subtitle
  subtitleEn?: string; // 英文副標題
  heroImages?: string[]; // 圖片陣列
  backgroundColor?: string; // 背景顏色（可選）
}

interface HeroSectionFormProps {
  value: HeroSectionFormValue;
  onChange: (value: HeroSectionFormValue) => void;
  showBackgroundColor?: boolean; // 是否顯示背景顏色設定（預設為 false）
  titleLabel?: string; // 標題欄位標籤（預設為 "Hero 標題"）
  titleEnLabel?: string; // 英文標題欄位標籤（預設為 "英文 Hero 標題"）
  subtitleLabel?: string; // 副標題欄位標籤（預設為 "Hero 副標題"）
  subtitleEnLabel?: string; // 英文副標題欄位標籤（預設為 "英文 Hero 副標題"）
  imagesLabel?: string; // 圖片欄位標籤（預設為 "Hero 背景圖（可多張）"）
  sectionTitle?: string; // 區塊標題（預設為 "頁首區塊"）
}

const HeroSectionForm = ({
  value,
  onChange,
  showBackgroundColor = false,
  titleLabel = "Hero 標題",
  titleEnLabel = "英文 Hero 標題",
  subtitleLabel = "Hero 副標題",
  subtitleEnLabel = "英文 Hero 副標題",
  imagesLabel = "Banner 圖片（可多張）",
  sectionTitle = "頁首區塊",
}: HeroSectionFormProps) => {
  const [hasTransparentBg, setHasTransparentBg] = useState(false);
  const [previousBgColor, setPreviousBgColor] = useState("#ffffff");

  // 只在 mount 時初始化透明背景狀態，避免使用者操作顏色選擇器時 previousBgColor 被覆蓋
  useEffect(() => {
    if (showBackgroundColor) {
      const bgColor = value.backgroundColor || "#ffffff";
      const isTransparent =
        !bgColor || bgColor === "transparent" || bgColor === "";
      setHasTransparentBg(isTransparent);
      setPreviousBgColor(isTransparent ? "#ffffff" : bgColor);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // 移除圖片
  const removeImage = (index: number) => {
    const images = [...(value.heroImages || [])];
    images.splice(index, 1);
    onChange({
      ...value,
      heroImages: images.length > 0 ? images : [],
    });
  };

  // 更新背景顏色
  const handleColorChange = (color: string) => {
    onChange({
      ...value,
      backgroundColor: color,
    });
    setPreviousBgColor(color);
  };

  // 切換透明背景
  const handleTransparentToggle = (isTransparent: boolean) => {
    setHasTransparentBg(isTransparent);

    if (isTransparent) {
      setPreviousBgColor(value.backgroundColor || "#ffffff");
      onChange({
        ...value,
        backgroundColor: "transparent",
      });
    } else {
      onChange({
        ...value,
        backgroundColor: previousBgColor,
      });
    }
  };

  return (
    <div className={formStyles.formSection}>
      <h3 className={formStyles.sectionTitle}>{sectionTitle}</h3>

      {/* 標題 */}
      <div className={formStyles.formGrid}>
      <div className={formStyles.formGroup}>
        <label className={formStyles.label}>{titleLabel}</label>
        <input
          type="text"
          className={formStyles.input}
          value={value.title || ""}
          onChange={(e) =>
            onChange({
              ...value,
              title: e.target.value,
            })
          }
          placeholder="頁面頂部大標題"
        />
      </div>
      <div className={formStyles.formGroup}>
        <label className={formStyles.label}>{titleEnLabel}</label>
        <input
          type="text"
          className={formStyles.input}
          value={value.titleEn || ""}
          onChange={(e) =>
            onChange({ ...value, titleEn: e.target.value })
          }
          placeholder="頁面頂部大標題 (英文)"
        />
      </div>
      </div>
      {/* 副標題 */}
      <div className={formStyles.formGrid}>
      <div className={formStyles.formGroup}>
        <label className={formStyles.label}>{subtitleLabel}</label>
        <input
          type="text"
          className={formStyles.input}
          value={value.subtitle || ""}
          onChange={(e) =>
            onChange({
              ...value,
              subtitle: e.target.value,
            })
          }
          placeholder="頁面頂部副標題"
        />
      </div>
      <div className={formStyles.formGroup}>
        <label className={formStyles.label}>{subtitleEnLabel}</label>
        <input
          type="text"
          className={formStyles.input}
          value={value.subtitleEn || ""}
          onChange={(e) =>
            onChange({ ...value, subtitleEn: e.target.value })
          }
          placeholder="頁面頂部副標題 (英文)"
        />
      </div>
      </div>

      {/* Banner 圖片（可多張） */}
      <div className={formStyles.formGroup}>
        <label className={formStyles.label}>{imagesLabel}</label>
        <div className={formStyles.imageUploader}>
          {value.heroImages && value.heroImages.length > 0 ? (
            <div className={formStyles.imageGrid}>
              {value.heroImages.map((img: string, index: number) => (
                <div key={index} className={formStyles.imageGridItem}>
                  <img src={img} alt={`Banner 圖片 ${index + 1}`} />
                  <button
                    type="button"
                    className={formStyles.removeImage}
                    onClick={() => removeImage(index)}
                  >
                    <FiX size={16} />
                  </button>
                </div>
              ))}
            </div>
          ) : null}
          <ImageUploader
            multiple
            buttonLabel=""
            className={formStyles.uploadArea}
            onUpload={() => {
              // multiple 情境下不會使用到此 callback
            }}
            onMultipleUpload={(urls) => {
              const currentImages = value.heroImages || [];
              onChange({
                ...value,
                heroImages: [...currentImages, ...urls],
              });
            }}
          >
            <>
              <FiUpload size={24} /> <span>上傳圖片（可多選）</span>
            </>
          </ImageUploader>
          <p className={formStyles.helpText}>
            上傳多張圖片將以輪播方式顯示，單張圖片則顯示為靜態背景
          </p>
        </div>
      </div>

      {/* 背景顏色（可選） */}
      {showBackgroundColor && (
        <div className={formStyles.formGroup}>
          <label className={formStyles.label}>背景顏色</label>
          <div className={formStyles.formGrid}>
            <div className={formStyles.formGroup}>
              {!hasTransparentBg && (
                <div className={formStyles.colorInputGroup}>
                  <input
                    type="color"
                    value={value.backgroundColor || "#ffffff"}
                    onChange={(e) => handleColorChange(e.target.value)}
                    className={formStyles.colorPicker}
                  />
                  <input
                    type="text"
                    className={formStyles.input}
                    value={value.backgroundColor || "#ffffff"}
                    onChange={(e) => handleColorChange(e.target.value)}
                    placeholder="#ffffff"
                  />
                </div>
              )}
              {hasTransparentBg && (
                <p
                  className={formStyles.helpText}
                  style={{
                    marginTop: "8px",
                    color: "#666",
                  }}
                >
                  背景將設為透明
                </p>
              )}
            </div>
            <div
              className={formStyles.switchGroup}
              style={{
                marginBottom: "12px",
              }}
            >
              <label className={formStyles.label}>透明背景</label>
              <label className={formStyles.switch}>
                <input
                  type="checkbox"
                  checked={hasTransparentBg}
                  onChange={(e) => handleTransparentToggle(e.target.checked)}
                />
                <span className={formStyles.slider}></span>
              </label>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default HeroSectionForm;
