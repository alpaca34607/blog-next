/**
 * Section 背景樣式工具函數
 * 統一處理所有 section 的背景顏色和背景圖片樣式
 */

import {
  CSSProperties
}

from "react";

interface SectionStyleOptions {
  backgroundColor?: string;
  backgroundImage?: string;
  defaultBgColor?: string;
}

interface SectionStyleResult {
  style: CSSProperties;
  className: string;
}

/**
 * 取得 section 的背景樣式和類名
 * @param options 樣式選項
 * @returns 包含樣式對象和類名的結果
 */
export function getSectionStyle( {
    backgroundColor,
    backgroundImage,
    defaultBgColor="#ffffff",
  }

  : SectionStyleOptions): SectionStyleResult {
  // 處理背景顏色（處理 transparent 情況）
  const bgColor=backgroundColor==="transparent"|| !backgroundColor ? "transparent"
  : backgroundColor || defaultBgColor;

  // 建立背景樣式
  const style: CSSProperties= {
    backgroundColor: backgroundImage ? "transparent": bgColor,
  }

  ;

  // 如果有背景圖片，設置背景圖片相關樣式
  const hasBgImage= ! !backgroundImage;
  const className=hasBgImage ? "hasBgImage" : "";

  if (backgroundImage) {
    // 只設置動態的背景圖片 URL，其他樣式交給 SCSS 控制
    style.backgroundImage=`url(${backgroundImage})`;
  }

  return {
    style,
    className,
  }

  ;
}