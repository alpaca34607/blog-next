"use client";

import { useState, useEffect } from "react";
import formStyles from "../PageManager/SectionModal.module.scss";
import BgSettingsForm from "./BgSettingsForm";
import HeroSectionForm, { HeroSectionFormValue } from "./HeroSectionForm";
// HeroSection 設定型別
export interface HeroSectionConfig {
  title?: string;
  titleEn?: string;
  subtitle?: string;
  subtitleEn?: string;
  settings?: {
    backgroundColor?: string;
    heroImages?: string[];
  };
}

// CardGridSection 設定型別
export interface CardGridSectionConfig {
  title?: string;
  titleEn?: string;
  subtitle?: string;
  subtitleEn?: string;
  settings?: {
    backgroundColor?: string;
    templateVariant?: "grid-3" | "grid-4" | "list";
  };
}

// 完整的頁面設定型別
export interface PageSectionSettings {
  hero: HeroSectionConfig;
  cardGrid: CardGridSectionConfig;
}

interface PageSectionSettingsFormProps {
  value: PageSectionSettings;
  onChange: (settings: PageSectionSettings) => void;
  onSave?: (settings: PageSectionSettings) => void; // 可選的儲存回調
  showSaveButton?: boolean; // 是否顯示儲存按鈕，預設為 true
}

const PageSectionSettingsForm = ({
  value,
  onChange,
  onSave,
  showSaveButton = true,
}: PageSectionSettingsFormProps) => {
  const [formData, setFormData] = useState<PageSectionSettings>(value);
  const [hasTransparentCardBg, setHasTransparentCardBg] = useState(false);
  const [previousCardBgColor, setPreviousCardBgColor] = useState("#ffffff");

  // 當外部 value 改變時更新內部狀態
  useEffect(() => {
    setFormData(value);

    // 檢查 CardGrid 背景是否為透明
    const cardBgColor = value.cardGrid.settings?.backgroundColor || "#ffffff";
    const isCardTransparent =
      !cardBgColor || cardBgColor === "transparent" || cardBgColor === "";
    setHasTransparentCardBg(isCardTransparent);
    setPreviousCardBgColor(isCardTransparent ? "#ffffff" : cardBgColor);
  }, [value]);

  // 更新表單資料（不自動觸發 onChange，只在點擊儲存時才觸發）
  const updateFormData = (updates: Partial<PageSectionSettings>) => {
    const newData = {
      ...formData,
      ...updates,
      hero: {
        ...formData.hero,
        ...updates.hero,
        settings: {
          ...formData.hero.settings,
          ...updates.hero?.settings,
        },
      },
      cardGrid: {
        ...formData.cardGrid,
        ...updates.cardGrid,
      },
    };
    setFormData(newData);
    // 如果沒有提供 onSave，則保持原有的自動更新行為
    if (!onSave) {
      onChange(newData);
    }
  };

  // 處理儲存按鈕點擊
  const handleSave = () => {
    if (onSave) {
      onSave(formData);
    } else {
      onChange(formData);
    }
  };

  // CardGrid templateVariant 選項
  const cardGridVariants = [
    { value: "grid-3", label: "grid-3" },
    { value: "grid-4", label: "grid-4" },
    { value: "list", label: "list" },
  ];

  return (
    <div className={formStyles.formSection}>
      {/* HeroSection 設定 */}
      <HeroSectionForm
        value={{
          title: formData.hero.title,
          titleEn: formData.hero.titleEn,
          subtitle: formData.hero.subtitle,
          subtitleEn: formData.hero.subtitleEn,
          heroImages: formData.hero.settings?.heroImages,
          backgroundColor: formData.hero.settings?.backgroundColor,
        }}
        onChange={(heroValue: HeroSectionFormValue) => {
          updateFormData({
            hero: {
              ...formData.hero,
              title: heroValue.title,
              titleEn: heroValue.titleEn,
              subtitle: heroValue.subtitle,
              subtitleEn: heroValue.subtitleEn,
              settings: {
                ...formData.hero.settings,
                backgroundColor: heroValue.backgroundColor,
                heroImages: heroValue.heroImages,
              },
            },
          });
        }}
        showBackgroundColor={true}
        sectionTitle="Hero 區塊設定"
        titleLabel="標題"
        subtitleLabel="副標題"
        imagesLabel="Banner 圖片（可多張）"
      />

      {/* CardGridSection 設定 */}
      <h3
        className={formStyles.sectionTitle}
        style={{
          marginTop: "32px",
        }}
      >
        卡片區塊設定
      </h3>

      {/* CardGrid 標題 */}
      <div className={formStyles.formGrid}>
      <div className={formStyles.formGroup}>
        <label className={formStyles.label}>標題</label>
        <input
          type="text"
          className={formStyles.input}
          value={formData.cardGrid.title || ""}
          onChange={(e) =>
            updateFormData({
              cardGrid: { ...formData.cardGrid, title: e.target.value },
            })
          }
          placeholder="卡片區塊標題（可選）"
        />
      </div>
      <div className={formStyles.formGroup}>
        <label className={formStyles.label}>標題（英文）</label>
        <input
          type="text"
          className={formStyles.input}
          value={formData.cardGrid.titleEn || ""}
          onChange={(e) =>
            updateFormData({
              cardGrid: { ...formData.cardGrid, titleEn: e.target.value },
            })
          }
          placeholder="卡片區塊標題（英文）（可選）"
        />
      </div>
      <div className={formStyles.formGroup}>
        <label className={formStyles.label}>副標題</label>
        <input
          type="text"
          className={formStyles.input}
          value={formData.cardGrid.subtitle || ""}
          onChange={(e) =>
            updateFormData({
              cardGrid: { ...formData.cardGrid, subtitle: e.target.value },
            })
          }
          placeholder="卡片區塊副標題（可選）"
        />
      </div>
      <div className={formStyles.formGroup}>
        <label className={formStyles.label}>副標題</label>
        <input
          type="text"
          className={formStyles.input}
          value={formData.cardGrid.subtitleEn || ""}
          onChange={(e) =>
            updateFormData({
              cardGrid: { ...formData.cardGrid, subtitleEn: e.target.value },
            })
          }
          placeholder="卡片區塊副標題（英文）（可選）"
        />
      </div>
      </div>
      {/* CardGrid 副標題 */}
      

      {/* CardGrid 顯示樣式 */}
      <div className={formStyles.formGroup}>
        <label className={formStyles.label}>顯示樣式</label>
        <select
          className={formStyles.input}
          value={formData.cardGrid.settings?.templateVariant || "grid-3"}
          onChange={(e) =>
            updateFormData({
              cardGrid: {
                ...formData.cardGrid,
                settings: {
                  ...formData.cardGrid.settings,
                  templateVariant: e.target.value as "grid-3" | "grid-4" | "list",
                },
              },
            })
          }
        >
          {cardGridVariants.map((variant) => (
            <option key={variant.value} value={variant.value}>
              {variant.label}
            </option>
          ))}
        </select>
        <p className={formStyles.helpText}>
          選擇卡片的排列方式：grid-3（三欄）、grid-4（四欄）、list（列表）
        </p>
      </div>

      {/* CardGrid 背景顏色 */}
      <div className={formStyles.formGroup}>
        <BgSettingsForm
          value={{
            backgroundColor: formData.cardGrid.settings?.backgroundColor || "#ffffff",
          }}
          onChange={(settings) =>
            updateFormData({
              cardGrid: {
                ...formData.cardGrid,
                settings: {
                  ...formData.cardGrid.settings,
                  backgroundColor: settings.backgroundColor,
                },
              },
            })
          }
          showImageUpload={false}
        />
      </div>

      {/* 儲存按鈕 */}
      {showSaveButton && (
        <div className={formStyles.formActions}>
          <button
            type="button"
            className={formStyles.saveButton}
            onClick={handleSave}
          >
            儲存設定
          </button>
        </div>
      )}
    </div>
  );
};

export default PageSectionSettingsForm;
