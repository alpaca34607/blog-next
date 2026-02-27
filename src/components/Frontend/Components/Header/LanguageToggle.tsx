"use client";

import { cn } from "@/utils/cn";
import styles from "./LanguageToggle.module.scss";

interface LanguageToggleProps {
  /** 當前語言 */
  lang: string;
  /** 語言切換處理函數 */
  onLangChange: (lang: string) => void;
}

const LanguageToggle = ({ lang, onLangChange }: LanguageToggleProps) => {
  const isZhActive = lang === "zh";
  const isEnActive = lang === "en";

  const handleLangClick = (targetLang: string) => {
    // 防止重複點擊當前語言，避免出現 /en/en 等重複路徑
    if (targetLang === lang) return;
    onLangChange(targetLang);
  };

  return (
    //  ::before 偽元素滑塊，CSS :has() 自動跟隨 active 狀態與 hover 移動
    <div className={styles.langToggleGroup}>
      <button
        type="button"
        className={cn(styles.langToggleBtn, isZhActive && styles.active)}
        onClick={() => handleLangClick("zh")}
        disabled={isZhActive}
      >
        <span>中文</span>
      </button>
      <button
        type="button"
        className={cn(styles.langToggleBtn, isEnActive && styles.active)}
        onClick={() => handleLangClick("en")}
        disabled={isEnActive}
      >
        <span>EN</span>
      </button>
    </div>
  );
};

export default LanguageToggle;
