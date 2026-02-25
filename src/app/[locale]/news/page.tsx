"use client";

import { useState, useEffect } from "react";
import Layout from "@/components/Frontend/Layout";
import CardGridSection from "@/components/public/sections/CardGridSection";
import HeroSection from "@/components/public/sections/HeroSection";
import type { PageSectionSettings } from "@/components/Backend/PageSectionSettingsForm";
import styles from "./page.module.scss";
import { API_GetConfig } from "@/app/api/public_api";

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
    subtitle: "掌握最新動態與設計趨勢",
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
              limit: 1000,
              sortBy: "date",
              enableCategoryFilter: true,
              categories: ["技術文章", "媒體報導", "活動訊息"],
            },
            title: settings.cardGrid.title,
            subtitle: settings.cardGrid.subtitle,
          }}
        />
      </div>
    </Layout>
  );
}
