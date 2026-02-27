"use client";

import { useEffect } from "react";
import Navigation from "./Navigation";
import LanguageToggle from "./LanguageToggle";
import TopUtils from "./TopUtils";
import styles from "./MobileMenu.module.scss";
import type { NavigationItem, Product } from "@/types/navigation";

interface MobileMenuProps {
  /** 是否顯示選單 */
  isOpen: boolean;
  /** 關閉選單的處理函數 */
  onClose: () => void;
  /** 導航項目列表 */
  navItems: NavigationItem[];
  /** 產品列表 */
  products: Product[];
  /** 當前語言 */
  lang: string;
  /** 語言切換處理函數 */
  onLangChange: (lang: string) => void;
}

const MobileMenu = ({
  isOpen,
  onClose,
  navItems,
  products,
  lang,
  onLangChange,
}: MobileMenuProps) => {
  // 當選單打開時，禁止背景滾動
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }

    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  return (
    <>
      {/* 背景遮罩 */}
      <div
        className={`${styles.overlay} ${isOpen ? styles.open : ""}`}
        onClick={onClose}
        aria-hidden="true"
      />
      {/* 側邊選單 */}
      <div className={`${styles.menu} ${isOpen ? styles.open : ""}`}>
        <div className={styles.menuHeader}>
          <div className={styles.langSection}>
            <LanguageToggle lang={lang} onLangChange={onLangChange} />
          </div>
          <button
            type="button"
            className={styles.closeBtn}
            onClick={onClose}
            aria-label="關閉選單"
          >
            <span></span>
            <span></span>
          </button>
        </div>
        <div className={styles.menuContent}>
          <div className={styles.menuSection}>
            <Navigation
              navItems={navItems}
              products={products}
              isMobile={true}
            />
          </div>
          <div className={styles.menuSection}>
            <TopUtils isMobile={true} />
          </div>
        </div>
      </div>
    </>
  );
};

export default MobileMenu;
