"use client";
import React from "react";
import { cn } from "@/utils/cn";
import styles from "./ClipPathBtn.module.scss";
import { Link } from "@/navigation";

interface ClipPathBtnProps
  extends Omit<React.AnchorHTMLAttributes<HTMLAnchorElement>, "href"> {
  children: React.ReactNode;
  showArrow?: boolean;
  href?: string;
}

const ClipPathBtn = ({
  children,
  showArrow = true,
  className,
  href = "#",
  ...props
}: ClipPathBtnProps) => {
  return (
    <Link href={href} className={cn(styles.clipPathBtn, className)} {...props}>
      {children}
      {showArrow && (
        <svg
          className={styles.btnArrow}
          width="24"
          height="24"
          viewBox="0 0 67 65"
          stroke="currentColor"
          strokeWidth="2"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            d="M43.804 49.0942H39.772V47.9422C39.772 40.2622 43.74 35.7822 50.076 33.9262V33.2222C46.684 33.6702 42.844 33.9262 38.3 33.9262H4.89197V29.7022H38.3C42.844 29.7022 46.684 29.9582 50.076 30.4062V29.7022C43.74 27.8462 39.772 23.3662 39.772 15.6862V14.5342H43.804V15.4302C43.804 24.0702 49.564 30.2782 60.444 30.2782H61.212V33.3502H60.444C49.564 33.3502 43.804 39.6222 43.804 48.2622V49.0942Z"
            fill="currentColor"
          />
        </svg>
      )}
    </Link>
  );
};

export default ClipPathBtn;
