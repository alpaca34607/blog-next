"use client";
import { useEffect, useState } from "react";
import { cn } from "@/utils/cn";
import styles from "./Loading.module.scss";

interface LoadingProps {
  onLoadingComplete?: () => void;
  /**
   * 外部資料是否已載入完成
   */
  isDone?: boolean;
}

const HIDE_ANIMATION_DURATION = 800;

const Loading = ({ onLoadingComplete, isDone = false }: LoadingProps) => {
  const [isVisible, setIsVisible] = useState(true);
  const [shouldRender, setShouldRender] = useState(true);

  useEffect(() => {
    if (typeof document === "undefined") return;
    document.body.classList.add("loading");

    return () => {
      document.body.classList.remove("loading");
    };
  }, []);

  useEffect(() => {
    if (!isDone || !shouldRender) return;

    setIsVisible(false);

    const timer = setTimeout(() => {
      setShouldRender(false);
      if (typeof document !== "undefined") {
        document.body.classList.remove("loading");
      }
      if (onLoadingComplete) {
        onLoadingComplete();
      }
    }, HIDE_ANIMATION_DURATION);

    return () => {
      clearTimeout(timer);
    };
  }, [isDone, onLoadingComplete, shouldRender]);

  if (!shouldRender) {
    return null;
  }

  return (
    <div className={cn(styles.loadingLayer, !isVisible && styles.hidden)}>
      <div className={styles.loaderContent}>
        <div className={styles.loaderText}>BLOGCRAFT</div>
        <div className={styles.loaderBar}>
          <div className={styles.loaderProgress} />
        </div>
      </div>
    </div>
  );
};

export default Loading;
