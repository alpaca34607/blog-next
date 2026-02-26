"use client";
import { useState, useEffect } from "react";
import { FiX } from "react-icons/fi";
import PageSectionSettingsForm, {
  PageSectionSettings,
} from "../PageSectionSettingsForm";
import styles from "./NewsModal.module.scss";
import formStyles from "../PageManager/SectionModal.module.scss";
import { API_GetConfig } from "@/app/api/public_api";
import { API_PutConfig } from "@/app/api/admin_api";

interface PageSettingsModalProps {
  open: boolean;
  onClose: () => void;
}

// 預設的新聞列表頁面設定
const getDefaultPageSettings = (): PageSectionSettings => ({
  hero: {
    title: "",
    titleEn: "",
    subtitle: "",
    subtitleEn: "",
    settings: {
      backgroundColor: "transparent",
      heroImages: [],
    },
  },
  cardGrid: {
    title: "最新消息",
    titleEn: "News",
    subtitle: "掌握最新動態與設計趨勢",
    subtitleEn: " latest news and design trends",
    settings: {
      backgroundColor: "transparent",
      templateVariant: "grid-3",
    },
  },
});

// 從 API 讀取頁面設定（避免依賴 localStorage）
const loadPageSettingsFromApi = async (): Promise<PageSectionSettings> => {
  const res = await API_GetConfig("newsListPageSettings");
  const parsed = res?.success ? res.data : null;

  // 合併預設值與儲存的設定，確保結構完整
  return {
    hero: {
      ...getDefaultPageSettings().hero,
      ...(parsed?.hero || {}),
      settings: {
        ...getDefaultPageSettings().hero.settings,
        ...(parsed?.hero?.settings || {}),
      },
    },
    cardGrid: {
      ...getDefaultPageSettings().cardGrid,
      ...(parsed?.cardGrid || {}),
    },
  };
};

const PageSettingsModal = ({ open, onClose }: PageSettingsModalProps) => {
  const [pageSettings, setPageSettings] = useState<PageSectionSettings>(
    getDefaultPageSettings()
  );

  // 載入儲存的設定
  useEffect(() => {
    if (open) {
      loadPageSettingsFromApi()
        .then((settings) => setPageSettings(settings))
        .catch(() => setPageSettings(getDefaultPageSettings()));
    }
  }, [open]);

  // 處理 body overflow
  useEffect(() => {
    if (open) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  const handleSave = (settings: PageSectionSettings) => {
    setPageSettings(settings);
    // 透過 API 儲存（需要登入）並通知前台更新
    API_PutConfig("newsListPageSettings", settings)
      .then(() => {
        window.dispatchEvent(new Event("newsListPageSettingsUpdated"));
        onClose();
      })
      .catch(() => {
        alert("儲存失敗，請稍後再試");
      });
  };

  if (!open) return null;

  return (
    <div className={styles.modalOverlay} onClick={onClose}>
      <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
        <div className={styles.modalHeader}>
          <h2 className={styles.modalTitle}>新聞列表頁面設置</h2>
          <button className={styles.closeButton} onClick={onClose}>
            <FiX size={24} />
          </button>
        </div>

        <div className={styles.form}>
          <PageSectionSettingsForm
            value={pageSettings}
            onChange={(settings) => {
              setPageSettings(settings);
            }}
            onSave={handleSave}
            showSaveButton={true}
          />
        </div>
      </div>
    </div>
  );
};

export default PageSettingsModal;
