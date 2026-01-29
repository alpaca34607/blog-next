"use client";

import { ReactNode } from "react";
import Link from "next/link";

import { cn } from "@/utils/cn";
import styles from "./FlipButton.module.scss";

export interface FlipButtonProps {
  /** 按鈕文字 */
  text: string;
  /** 連結網址 */
  href?: string;
  /** 點擊事件處理函數 */
  onClick?: () => void;
  /** 自訂類別名稱 */
  className?: string;
  /** 是否啟用狀態 */
  active?: boolean;
  /** 自訂子元素（可選，用於覆蓋預設文字） */
  children?: ReactNode;
  /** 按鈕類型：link 或 button */
  as?: "Link" | "a" | "button";
}

const FlipButton = ({
  text,
  href = "#",
  onClick,
  className,
  active = false,
  children,
  as = "Link",
}: FlipButtonProps) => {
  const buttonClasses = cn(
    styles.flipButton,
    active && styles.active,
    className
  );

  const content = children || (
    <>
      <div className={styles.flipButtonBg} />
      <span className={styles.flipButtonText}>
        <span className={styles.flipButtonTextInner}> {text}</span>
        <span className={styles.flipButtonTextInner}> {text}</span>
      </span>
    </>
  );

  if (as === "button") {
    return (
      <button type="button" className={buttonClasses} onClick={onClick}>
        {content}
      </button>
    );
  } else if (as === "Link") {
    return (
      <Link href={href} className={buttonClasses} onClick={onClick}>
        {content}
      </Link>
    );
  } else {
    return (
      <a href={href} className={buttonClasses} onClick={onClick}>
        {content}
      </a>
    );
  }
};

export default FlipButton;
