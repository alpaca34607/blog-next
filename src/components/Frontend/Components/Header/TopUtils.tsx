"use client";

import { Link } from "@/navigation";
import styles from "./TopUtils.module.scss";

const TopUtils = ({ isMobile }: { isMobile: boolean }) => {
  return (
    <div className={`${styles.topUtils} ${isMobile ? styles.topUtilsMobile : ""}`}>
      <Link className={styles.topUtilsItem} href="/contact">
        <span>聯絡我們</span>
      </Link>
      <Link className={styles.topUtilsItem} href="/download">
        <span>下載專區</span>
      </Link>
      {/* /login 為後台路由，不套用語系前綴 */}
      <a className={styles.topUtilsItem} href="/login">
        <span>登入體驗</span>
      </a>
    </div>
  );
};

export default TopUtils;
