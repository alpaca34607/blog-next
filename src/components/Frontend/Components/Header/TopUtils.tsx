"use client";

import { Link } from "@/navigation";
import styles from "./TopUtils.module.scss";
import { useTranslations } from "next-intl";
const TopUtils = ({ isMobile }: { isMobile: boolean }) => {
  const t = useTranslations("topUtils");
  return (
    <div className={`${styles.topUtils} ${isMobile ? styles.topUtilsMobile : ""}`}>
      <Link className={styles.topUtilsItem} href="/contact">
        <span>  {t("contact")}</span>
      </Link>
      <Link className={styles.topUtilsItem} href="/download">
        <span> {t("download")}</span>
      </Link>
      {/* 登入頁已支援 i18n，使用 locale-aware Link 產生路由 */}
      <Link className={styles.topUtilsItem} href="/login">
        <span> {t("login")}</span>
      </Link>
    </div>
  );
};

export default TopUtils;
