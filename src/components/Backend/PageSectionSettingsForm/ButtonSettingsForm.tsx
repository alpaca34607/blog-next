"use client";

import formStyles from "../PageManager/SectionModal.module.scss";

export interface ButtonSettings {
  buttonText?: string;
  buttonTextEn?: string;
  buttonLink?: string;
  buttonColor?: string;
  buttonTextColor?: string;
}

interface ButtonSettingsFormProps {
  value: ButtonSettings;
  onChange: (values: ButtonSettings) => void;
  textPlaceholder?: string;
  textPlaceholderEn?: string;
  linkPlaceholder?: string;
  /** 是否顯示按鈕顏色與文字顏色設定（預設 false） */
  showColorSettings?: boolean;
  /** 區塊標題，不傳則不顯示 */
  sectionTitle?: string;
}

const ButtonSettingsForm = ({
  value,
  onChange,
  textPlaceholder = "例如：瞭解更多",
  textPlaceholderEn = "例如：Learn more",
  linkPlaceholder = "例如：/about",
  showColorSettings = false,
  sectionTitle = "按鈕設定",
}: ButtonSettingsFormProps) => {
  return (
    <>
      {sectionTitle && (
        <h3 className={formStyles.sectionTitle}>{sectionTitle}</h3>
      )}
      <div className={formStyles.formGrid}>
        <div className={formStyles.formGroup}>
          <label className={formStyles.label}>按鈕文字</label>
          <input
            type="text"
            className={formStyles.input}
            value={value.buttonText ?? ""}
            onChange={(e) =>
              onChange({ ...value, buttonText: e.target.value })
            }
            placeholder={textPlaceholder}
          />
        </div>
        <div className={formStyles.formGroup}>
          <label className={formStyles.label}>按鈕文字（英文）</label>
          <input
            type="text"
            className={formStyles.input}
            value={value.buttonTextEn ?? ""}
            onChange={(e) =>
              onChange({ ...value, buttonTextEn: e.target.value })
            }
            placeholder={textPlaceholderEn}
          />
        </div>
        <div className={formStyles.formGroup}>
          <label className={formStyles.label}>按鈕連結</label>
          <input
            type="text"
            className={formStyles.input}
            value={value.buttonLink ?? ""}
            onChange={(e) =>
              onChange({ ...value, buttonLink: e.target.value })
            }
            placeholder={linkPlaceholder}
          />
        </div>
      </div>
      {showColorSettings && (
        <div className={formStyles.formGrid}>
          <div className={formStyles.formGroup}>
            <label className={formStyles.label}>按鈕顏色</label>
            <div className={formStyles.colorInputGroup}>
              <input
                type="color"
                value={value.buttonColor || "#faad3a"}
                onChange={(e) =>
                  onChange({ ...value, buttonColor: e.target.value })
                }
                className={formStyles.colorPicker}
              />
              <input
                type="text"
                className={formStyles.input}
                value={value.buttonColor || "#faad3a"}
                onChange={(e) =>
                  onChange({ ...value, buttonColor: e.target.value })
                }
                placeholder="#faad3a"
              />
            </div>
          </div>
          <div className={formStyles.formGroup}>
            <label className={formStyles.label}>文字顏色</label>
            <div className={formStyles.colorInputGroup}>
              <input
                type="color"
                value={value.buttonTextColor || "#fcfcfc"}
                onChange={(e) =>
                  onChange({ ...value, buttonTextColor: e.target.value })
                }
                className={formStyles.colorPicker}
              />
              <input
                type="text"
                className={formStyles.input}
                value={value.buttonTextColor || "#fcfcfc"}
                onChange={(e) =>
                  onChange({ ...value, buttonTextColor: e.target.value })
                }
                placeholder="#fcfcfc"
              />
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default ButtonSettingsForm;
