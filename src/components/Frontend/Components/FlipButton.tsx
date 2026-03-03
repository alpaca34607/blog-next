"use client";

import { ReactNode } from "react";
import { Link } from "@/navigation";
import { useDemoHref } from "@/hooks/useDemoHref";

import { cn } from "@/utils/cn";
import styles from "./FlipButton.module.scss";

export interface FlipButtonProps {
  text: string;
  href?: string;
  onClick?: () => void;
  className?: string;
  active?: boolean;
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
  const appendDemoUuid = useDemoHref();
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
      <Link href={appendDemoUuid(href)} className={buttonClasses} onClick={onClick}>
        {content}
      </Link>
    );
  } else {
    return (
      <a href={appendDemoUuid(href)} className={buttonClasses} onClick={onClick}>
        {content}
      </a>
    );
  }
};

export default FlipButton;
