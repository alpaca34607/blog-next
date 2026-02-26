"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { NextIntlClientProvider } from "next-intl";
import { routing } from "@/routing";
import {
  FiLayout,
  FiNavigation,
  FiFileText,
  FiFile,
  FiUsers,
  FiDownload,
  FiClock,
  FiCheckSquare,
  FiSettings,
  FiMenu,
  FiX,
  FiChevronLeft,
  FiLogOut,
} from "react-icons/fi";
import styles from "./AdminLayout.module.scss";
import { clearAuthToken } from "@/utils/common";

interface AdminLayoutProps {
  children: React.ReactNode;
}

type AdminPermissionDeniedDetail = {
  code?: string;
  message?: string;
  status?: number;
  url?: string;
};

const AdminLayout = ({ children }: AdminLayoutProps) => {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [mobileOpen, setMobileOpen] = useState(false);
  const pathname = usePathname();
  const router = useRouter();
  const [isRedirectingPermissionDenied, setIsRedirectingPermissionDenied] =
    useState(false);

  const navItems = [
    { name: "Dashboard", page: "/admin/dashboard", icon: FiLayout },
    { name: "導覽選單", page: "/admin/NavigationManager", icon: FiNavigation },
    { name: "頁面管理", page: "/admin/PageManager", icon: FiFileText },
    { name: "產品管理", page: "/admin/ProductsManager", icon: FiUsers },
    { name: "最新消息", page: "/admin/NewsManager", icon: FiFile },
    // { name: "下載專區", page: "/admin/DownloadManager", icon: FiDownload },
    { name: "時間軸管理", page: "/admin/TimelineManager", icon: FiClock },
    { name: "表格管理", page: "/admin/TableManager", icon: FiCheckSquare },
    { name: "管理員帳號", page: "/admin/AdminManager", icon: FiUsers },
    { name: "網站設定", page: "/admin/SiteSettingsManager", icon: FiSettings },
  ];

  const handleLogout = () => {
    // 登出：清除前端保存的 token，並導回登入頁
    // 注意：目前採用 JWT Bearer Token（存於 cookie），因此只要移除 token 即可視為登出
    clearAuthToken();
    setMobileOpen(false);
    router.replace("/login");
  };

  useEffect(() => {
    // 換頁時重置狀態，避免重複觸發導頁
    setIsRedirectingPermissionDenied(false);
  }, [pathname]);

  useEffect(() => {
    const handler = (event: Event) => {
      // 若已在「權限不足」頁面，就交由該頁面顯示 SweetAlert
      if (pathname === "/admin/permission-denied") return;
      if (isRedirectingPermissionDenied) return;
      setIsRedirectingPermissionDenied(true);

      const detail =
        (event as CustomEvent<AdminPermissionDeniedDetail>)?.detail || {};

      // 注意：跳頁後 CustomEvent 的 detail 會消失，因此用 sessionStorage 暫存
      try {
        sessionStorage.setItem(
          "admin:permissionDeniedDetail",
          JSON.stringify(detail)
        );
      } catch {
        // 忽略：sessionStorage 不可用時，仍可跳頁並顯示預設訊息
      }

      setMobileOpen(false);
      router.replace("/admin/permission-denied");
    };

    window.addEventListener("admin:permissionDenied", handler as EventListener);
    return () => {
      window.removeEventListener(
        "admin:permissionDenied",
        handler as EventListener
      );
    };
  }, [isRedirectingPermissionDenied, pathname, router]);

  return (
    <div className={styles.adminLayout}>
      {/* Mobile Header */}
      <div className={styles.mobileHeader}>
        <div className={styles.mobileHeaderContent}>
          <button
            onClick={() => setMobileOpen(!mobileOpen)}
            className={styles.mobileMenuButton}
          >
            {mobileOpen ? <FiX size={24} /> : <FiMenu size={24} />}
          </button>
          <span className={styles.mobileTitle}>CMS Dashboard</span>
        </div>
      </div>

      {/* Mobile Sidebar Overlay */}
      {mobileOpen && (
        <div
          className={styles.mobileOverlay}
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`${styles.sidebar} ${
          sidebarOpen ? styles.sidebarOpen : styles.sidebarClosed
        } ${
          mobileOpen ? styles.mobileSidebarOpen : styles.mobileSidebarClosed
        }`}
      >
        {/* Logo */}
        <div className={styles.sidebarHeader}>
          {sidebarOpen && <span className={styles.sidebarTitle}>CMS</span>}
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className={styles.sidebarToggle}
          >
            <FiChevronLeft
              className={`${styles.chevronIcon} ${
                sidebarOpen ? styles.chevronRotated : ""
              }`}
              size={20}
            />
          </button>
        </div>

        {/* Navigation */}
        <nav className={styles.nav}>
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.page;
            return (
              <Link
                key={item.page}
                href={item.page}
                onClick={() => setMobileOpen(false)}
                className={`${styles.navItem} ${
                  isActive ? styles.navItemActive : ""
                }`}
              >
                <Icon size={20} />
                {sidebarOpen && (
                  <span className={styles.navItemText}>{item.name}</span>
                )}
              </Link>
            );
          })}
        </nav>

        {/* Logout */}
        <div className={styles.logoutSection}>
          <button
            onClick={handleLogout}
            className={`${styles.logoutButton} ${
              sidebarOpen ? styles.logoutButtonExpanded : ""
            }`}
          >
            <FiLogOut size={20} />
            {sidebarOpen && <span>登出</span>}
          </button>
        </div>
      </aside>

      {/* Main Content */}
      {/* NextIntlClientProvider 提供預設語系，讓後台預覽頁面中的 section 元件（含 locale-aware Link）不會因缺少 intl context 而報錯 */}
      <NextIntlClientProvider locale={routing.defaultLocale} messages={{}}>
        <main
          className={`${styles.mainContent} ${
            sidebarOpen ? styles.mainContentExpanded : styles.mainContentCollapsed
          }`}
        >
          <div className={styles.contentWrapper}>
            {children}
          </div>
        </main>
      </NextIntlClientProvider>
    </div>
  );
};

export default AdminLayout;
