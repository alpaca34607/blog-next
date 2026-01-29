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
  return (
    <div className={styles.langToggleGroup} data-lang={lang}>
      <button
        type="button"
        className={cn(styles.langToggleBtn, lang === "zh" && styles.active)}
        onClick={() => onLangChange("zh")}
      >
        <span>中文</span>
      </button>
      <button
        type="button"
        className={cn(styles.langToggleBtn, lang === "en" && styles.active)}
        onClick={() => onLangChange("en")}
      >
        <span>EN</span>
      </button>
      <div className={styles.langToggleSlider} />
    </div>
  );
};

export default LanguageToggle;
