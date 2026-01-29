"use client";

import { useState, useEffect } from "react";
import Layout from "@/components/Frontend/Layout";
import CardGridSection from "@/components/public/sections/CardGridSection";
import HeroSection from "@/components/public/sections/HeroSection";
import type { PageSectionSettings } from "@/components/Backend/PageSectionSettingsForm";
import styles from "./page.module.scss";
import { API_GetConfig } from "@/app/api/public_api";

// 預設設定（與 NewsManager 中的預設值保持一致）
const getDefaultSettings = (): PageSectionSettings => ({
  hero: {
    title: "",
    subtitle: "",
    settings: {
      backgroundColor: "transparent",
      heroImages: [],
    },
  },
  cardGrid: {
    title: "最新消息",
    subtitle: "掌握華生最新動態與產業資訊",
    settings: {
      backgroundColor: "transparent",
      templateVariant: "grid-3",
    },
  },
});

export default function NewsListPage() {
  const [settings, setSettings] = useState<PageSectionSettings>(
    getDefaultSettings()
  );
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);

    // 從 API 讀取設定（避免依賴 localStorage）
    const loadSettings = async () => {
      const res = await API_GetConfig("newsListPageSettings");
      const parsed = res?.success ? res.data : null;
      setSettings({
        hero: {
          ...getDefaultSettings().hero,
          ...(parsed?.hero || {}),
          settings: {
            ...getDefaultSettings().hero.settings,
            ...(parsed?.hero?.settings || {}),
          },
        },
        cardGrid: {
          ...getDefaultSettings().cardGrid,
          ...(parsed?.cardGrid || {}),
        },
      });
    };

    loadSettings().catch(() => {});

    // 監聽設定更新事件
    const handleSettingsUpdate = () => {
      loadSettings().catch(() => {});
    };

    window.addEventListener(
      "newsListPageSettingsUpdated",
      handleSettingsUpdate
    );

    return () => {
      window.removeEventListener(
        "newsListPageSettingsUpdated",
        handleSettingsUpdate
      );
    };
  }, []);

  // 檢查是否需要渲染 HeroSection
  const shouldRenderHero =
    settings.hero.title ||
    settings.hero.subtitle ||
    (settings.hero.settings?.heroImages &&
      settings.hero.settings.heroImages.length > 0);

  return (
    <Layout>
      <div className={styles.newsListPage}>
        {shouldRenderHero && <HeroSection section={settings.hero} />}
        <CardGridSection
          section={{
            settings: {
              ...settings.cardGrid.settings,
              dataSource: "news",
              limit: 1000, // 顯示所有新聞（設定較大值以顯示全部）
              sortBy: "date",
              enableCategoryFilter: true, // 啟用分類篩選
              categories: ["技術文章", "媒體報導", "活動訊息"], // 分類列表
            },
            title: settings.cardGrid.title,
            subtitle: settings.cardGrid.subtitle,
          }}
        />
      </div>
    </Layout>
  );
}
