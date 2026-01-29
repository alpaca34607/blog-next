"use client";
import { useEffect, useState } from "react";
import { cn } from "@/utils/cn";
import styles from "./Loading.module.scss";

interface LoadingProps {
  onLoadingComplete?: () => void;
}

const Loading = ({ onLoadingComplete }: LoadingProps) => {
  const [isVisible, setIsVisible] = useState(true);
  const [shouldRender, setShouldRender] = useState(true);

  useEffect(() => {
    if (typeof document === "undefined") return;
    
    document.body.classList.add("loading");

    const timer1 = setTimeout(() => {
      setIsVisible(false);
    }, 2000);

    const timer2 = setTimeout(() => {
      setShouldRender(false);
      document.body.classList.remove("loading");
      if (onLoadingComplete) {
        onLoadingComplete();
      }
    }, 3000);

    return () => {
      clearTimeout(timer1);
      clearTimeout(timer2);
      document.body.classList.remove("loading");
    };
  }, [onLoadingComplete]);

  if (!shouldRender) {
    return null;
  }

  return (
    <div className={cn(styles.loadingLayer, !isVisible && styles.hidden)}>
      <div className={styles.loaderContent}>
        <div className={styles.loaderText}>WATCHSENSE</div>
        <div className={styles.loaderBar}>
          <div className={styles.loaderProgress} />
        </div>
      </div>
    </div>
  );
};

export default Loading;

