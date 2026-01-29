"use client";

import { useState, useEffect } from "react";
import { FiX, FiUpload } from "react-icons/fi";
import formStyles from "../PageManager/SectionModal.module.scss";
import ImageUploader from "@/components/forms/ImageUploader";

export interface BgSettings {
  backgroundImage?: string;
  backgroundColor?: string;
}

interface BgSettingsFormProps {
  value: BgSettings;
  onChange: (settings: BgSettings) => void;
  showImageUpload?: boolean; // 是否顯示背景圖片上傳（預設為 true）
  imageHelpText?: string; // 自定義圖片說明文字
}

const BgSettingsForm = ({
  value,
  onChange,
  showImageUpload = true,
  imageHelpText,
}: BgSettingsFormProps) => {
  const [hasTransparentBg, setHasTransparentBg] = useState(false);
  const [previousBgColor, setPreviousBgColor] = useState("#ffffff");

  // 初始化透明背景狀態
  useEffect(() => {
    const bgColor = value.backgroundColor || "#ffffff";
    const isTransparent =
      !bgColor || bgColor === "transparent" || bgColor === "";

    setHasTransparentBg(isTransparent);
    setPreviousBgColor(isTransparent ? "#ffffff" : bgColor);
  }, [value.backgroundColor]);

  // 移除背景圖片
  const handleRemoveImage = () => {
    onChange({
      ...value,
      backgroundImage: "",
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
      // 儲存當前顏色，然後設為透明
      setPreviousBgColor(value.backgroundColor || "#ffffff");
      onChange({
        ...value,
        backgroundColor: "transparent",
      });
    } else {
      // 恢復之前儲存的顏色
      onChange({
        ...value,
        backgroundColor: previousBgColor,
      });
    }
  };

  return (
    <div className={formStyles.formSection}>
      <h3 className={formStyles.sectionTitle}>背景設定</h3>

      {/* 背景圖片上傳 */}
      {showImageUpload && (
        <div className={formStyles.formGroup}>
          <label className={formStyles.label}>背景圖片</label>
          {value.backgroundImage ? (
            <div className={formStyles.imagePreview}>
              <img src={value.backgroundImage} alt="背景圖片預覽" />
              <button
                type="button"
                className={formStyles.removeImage}
                onClick={handleRemoveImage}
              >
                <FiX size={16} />
              </button>
            </div>
          ) : (
            <ImageUploader
              buttonLabel=""
              className={formStyles.uploadArea}
              maxSize={10 * 1024 * 1024}
              onUpload={(url) => {
                onChange({
                  ...value,
                  backgroundImage: url,
                });
              }}
            >
              <>
                <FiUpload size={24} /> <span>上傳背景圖片</span>
              </>
            </ImageUploader>
          )}
          <p className={formStyles.helpText}>
            {imageHelpText ||
              "背景圖片會覆蓋背景顏色設定（建議尺寸：1920x600，建議格式：PNG、JPG、JPEG、WEBP）"}
          </p>
        </div>
      )}

      {/* 背景顏色 */}
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
    </div>
  );
};

export default BgSettingsForm;
