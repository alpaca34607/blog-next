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
  FiExternalLink,
  FiLock,
} from "react-icons/fi";
import Swal from "sweetalert2";
import styles from "./AdminLayout.module.scss";
import { accentOrange } from "@/styles/theme";
import { clearAuthToken, clearDemoToken, getAuthToken, getDemoToken, getDemoId } from "@/utils/common";

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

  // DEMO 訪客模式：僅在 client mount 後才判斷，避免 SSR 與 client 不一致導致 hydration 錯誤
  const [isDemoMode, setIsDemoMode] = useState(false);
  const [demoId, setDemoId] = useState<string | undefined>(undefined);
  useEffect(() => {
    const hasDemo = !!getDemoToken().token && !getAuthToken().token;
    setIsDemoMode(hasDemo);
    setDemoId(getDemoId());
  }, []);

  // DEMO 可編輯的頁面（其餘為唯讀展示）
  const demoEditablePages = [
    "/admin/NavigationManager",
    "/admin/PageManager",
    "/admin/NewsManager",
  ];

  const allNavItems = [
    { name: "Dashboard", page: "/admin/dashboard", icon: FiLayout },
    { name: "導覽選單", page: "/admin/NavigationManager", icon: FiNavigation },
    { name: "頁面管理", page: "/admin/PageManager", icon: FiFileText },
    { name: "產品管理", page: "/admin/ProductsManager", icon: FiUsers },
    { name: "最新消息", page: "/admin/NewsManager", icon: FiFile },
    { name: "時間軸管理", page: "/admin/TimelineManager", icon: FiClock },
    { name: "表格管理", page: "/admin/TableManager", icon: FiCheckSquare },
    { name: "管理員帳號", page: "/admin/AdminManager", icon: FiUsers },
    { name: "網站設定", page: "/admin/SiteSettingsManager", icon: FiSettings },
  ];

  // DEMO 可存取所有後台路徑（含子路徑），唯讀頁面僅能 GET
  const demoNavBases = allNavItems.map((i) => i.page);
  const isDemoAllowedPath = (path: string) =>
    demoNavBases.some((base) => path === base || path.startsWith(base + "/"));

  const navItems = allNavItems;

  const handleLogout = () => {
    clearAuthToken();
    clearDemoToken();
    setMobileOpen(false);
    router.replace("/login");
  };

  useEffect(() => {
    // 換頁時重置狀態，避免重複觸發導頁
    setIsRedirectingPermissionDenied(false);
  }, [pathname]);

  // DEMO 訪客若手動輸入非允許路徑，導回 dashboard（允許 PageManager/NewsManager 子路徑如預覽、編輯區塊）
  useEffect(() => {
    if (isDemoMode && pathname.startsWith("/admin") && !isDemoAllowedPath(pathname)) {
      router.replace("/admin/dashboard");
    }
  }, [isDemoMode, pathname, router]);

  useEffect(() => {
    const handler = (event: Event) => {
      // 若已在「權限不足」頁面，就交由該頁面顯示 SweetAlert
      if (pathname === "/admin/permission-denied") return;
      if (isRedirectingPermissionDenied) return;

      const detail =
        (event as CustomEvent<AdminPermissionDeniedDetail>)?.detail || {};

      // DEMO 訪客：僅顯示 SweetAlert、不導向登入或首頁，確認後關閉即可
      const isDemo =
        !!getDemoToken().token && !getAuthToken().token;
      if (isDemo) {
        setMobileOpen(false);
        Swal.fire({
          icon: "warning",
          title: "您無權限執行此操作",
          confirmButtonText: "確定",
          confirmButtonColor: accentOrange,
        });
        return;
      }

      setIsRedirectingPermissionDenied(true);
      try {
        sessionStorage.setItem(
          "admin:permissionDeniedDetail",
          JSON.stringify(detail)
        );
      } catch {
        /* 忽略 */
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
    <div
      className={`${styles.adminLayout} ${
        isDemoMode ? styles.adminLayoutWithDemoFooter : ""
      }`}
    >
      {/* Mobile Header */}
      <div className={styles.mobileHeader}>
        <div className={styles.mobileHeaderContent}>
          <button
            onClick={() => setMobileOpen(!mobileOpen)}
            className={styles.mobileMenuButton}
          >
            {mobileOpen ? <FiX size={24} /> : <FiMenu size={24} />}
          </button>
          <span className={styles.mobileTitle}>
            CMS{isDemoMode ? "(Demo)" : ""} Dashboard
          </span>
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
          {sidebarOpen && (
            <span className={styles.sidebarTitle}>
              CMS{isDemoMode ? "(Demo)" : ""}
            </span>
          )}
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
            const isActive =
              pathname === item.page || pathname.startsWith(item.page + "/");
            const isDemoReadOnly =
              isDemoMode && !demoEditablePages.includes(item.page);
            return (
              <Link
                key={item.page}
                href={item.page}
                onClick={() => setMobileOpen(false)}
                className={`${styles.navItem} ${
                  isActive ? styles.navItemActive : ""
                } ${isDemoReadOnly ? styles.navItemReadOnly : ""}`}
                title={isDemoReadOnly ? "僅供檢視，無法編輯" : undefined}
              >
                <Icon size={20} />
                {sidebarOpen && (
                  <>
                    <span className={styles.navItemText}>{item.name}</span>
                    {isDemoReadOnly && (
                      <FiLock size={14} className={styles.navItemLock} />
                    )}
                  </>
                )}
              </Link>
            );
          })}
        </nav>

        {/* 前往前台（DEMO 模式） */}
        {isDemoMode && demoId && (
          <div className={styles.demoSection}>
            <a
              href={`/?UUID=${demoId}`}
              target="_blank"
              rel="noopener noreferrer"
              className={`${styles.demoLink} ${
                sidebarOpen ? styles.demoLinkExpanded : ""
              }`}
            >
              <FiExternalLink size={20} />
              {sidebarOpen && <span>前往前台頁面</span>}
            </a>
          </div>
        )}

        {/* Logout */}
        <div className={styles.logoutSection}>
          <button
            onClick={handleLogout}
            className={`${styles.logoutButton} ${
              sidebarOpen ? styles.logoutButtonExpanded : ""
            }`}
          >
            <FiLogOut size={20} />
            {sidebarOpen && <span>{isDemoMode ? "結束體驗" : "登出"}</span>}
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

      {/* DEMO 模式：底部固定說明 */}
      {isDemoMode && (
        <div className={styles.demoFooter}>
          系統資料僅供檢視參考，儲存無效，僅導覽選單、頁面管理、最新消息供操作體驗
        </div>
      )}
    </div>
  );
};

export default AdminLayout;
