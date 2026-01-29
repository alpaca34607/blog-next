"use client";
import { useEffect } from "react";
import { cn } from "@/utils/cn";
import styles from "./VideoModal.module.scss";

interface VideoModalProps {
  isOpen: boolean;
  videoUrl: string;
  onClose: () => void;
}

const VideoModal = ({ isOpen, videoUrl, onClose }: VideoModalProps) => {
  useEffect(() => {
    if (isOpen) {
      document.body.classList.add(styles.modalOpen);
      // 保存当前滚动位置
      const scrollPosition =
        window.pageYOffset || document.documentElement.scrollTop;
      document.body.style.top = `-${scrollPosition}px`;
    } else {
      document.body.classList.remove(styles.modalOpen);
      document.body.style.top = "";
    }

    return () => {
      document.body.classList.remove(styles.modalOpen);
      document.body.style.top = "";
    };
  }, [isOpen]);

  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isOpen) {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener("keydown", handleEscape);
    }

    return () => {
      document.removeEventListener("keydown", handleEscape);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div
      className={cn(styles.videoModal, isOpen && styles.active)}
      onClick={onClose}
    >
      <div className={styles.overlay} />
      <div className={styles.container} onClick={(e) => e.stopPropagation()}>
        <button className={styles.close} onClick={onClose} aria-label="關閉">
          <i className="fa-solid fa-times" />
        </button>
        <div className={styles.content}>
          <div className={styles.videoWrapper}>
            <iframe
              src={videoUrl}
              title="YouTube video player"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
              referrerPolicy="strict-origin-when-cross-origin"
              allowFullScreen
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default VideoModal;
