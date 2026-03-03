"use client";

import { useEffect, useState, useTransition } from "react";
import { Link, useRouter, usePathname } from "@/navigation";
import { useLocale } from "next-intl";
import styles from "./Header.module.scss";
import Navigation from "./Header/Navigation";
import LanguageToggle from "./Header/LanguageToggle";
import TopUtils from "./Header/TopUtils";
import MobileMenu from "./Header/MobileMenu";
import { API_GetNavigationItem, API_GetProducts } from "@/app/api/public_api";
import type { NavigationItem, Product } from "@/types/navigation";
import { useDemoUuid } from "@/hooks/useDemoUuid";

// API 無資料或失敗時的新格式備用資料（不依賴舊格式）
const fallbackNavItems: NavigationItem[] = [
  {
    id: "about",
    title: "關於我們",
    titleEn: "About",
    slug: "about",
    parentId: null,
    sortOrder: 0,
    type: "internal",
    url: null,
    isVisible: true,
    hasChildren: false,
  },
  {
    id: "services",
    title: "服務項目",
    titleEn: "Services",
    slug: "",
    parentId: null,
    sortOrder: 1,
    type: "internal",
    url: null,
    isVisible: true,
    hasChildren: true,
  },
  {
    id: "library",
    title: "範例展示",
    titleEn: "Library",
    slug: "",
    parentId: null,
    sortOrder: 2,
    type: "internal",
    url: null,
    isVisible: true,
    hasChildren: true,
    productCategory: "模組化網站架構",
  },

  {
    id: "news",
    title: "最新消息",
    titleEn: "News",
    slug: "news",
    parentId: null,
    sortOrder: 3,
    type: "internal",
    url: null,
    isVisible: true,
    hasChildren: false,
  },
];

const fallbackProducts: Product[] = [
  {
    id: "fallback-product-1",
    title: "品牌部落格形象模板",
    titleEn: "Blog Template",
    slug: "blog-template",
    category: "網頁建構方案,",
    categoryEn: "Web Solutions",
    isPublished: true,
  },
  {
    id: "fallback-product-2",
    title: "風格化介面設計",
    titleEn: "Web Design",
    slug: "web-design",
    category: "網頁建構方案,",
    categoryEn: "Web Solutions",
    isPublished: true,
  },
  {
    id: "fallback-product-3",
    title: "客製化網站開發",
    titleEn: "Custom Development",
    slug: "development",
    category: "網頁建構方案,",
    categoryEn: "Web Solutions",
    isPublished: true,
  },
];

const Header = () => {
  const lang = useLocale();
  const router = useRouter();
  const pathname = usePathname();
  const demoUuid = useDemoUuid();
  const [isPending, startTransition] = useTransition();
  const [navItems, setNavItems] = useState<NavigationItem[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    let cancelled = false;

    // 載入導覽資料（API）
    const loadNavigation = async () => {
      const res = await API_GetNavigationItem(demoUuid);
      if (cancelled) return;

      if (res?.success) {
        const items: any[] = Array.isArray(res.data) ? res.data : [];
        // 後端回傳為「頂層 + children」結構；前台 Navigation 元件使用 parentId 的扁平結構
        const flattened: NavigationItem[] = [];
        items.forEach((parent: any) => {
          flattened.push({
            id: parent.id,
            title: parent.title,
            titleEn: parent.titleEn ?? undefined,
            slug: parent?.url ? String(parent.url).replace(/^\//, "") : "",
            parentId: parent.parentId ?? null,
            sortOrder: parent.sortOrder ?? 0,
            type: parent.type === "external" ? "external" : "internal",
            url: parent.url ?? null,
            isVisible: parent.isVisible !== false,
            hasChildren: Array.isArray(parent.children)
              ? parent.children.length > 0
              : false,
            productCategory: parent.productCategory ?? undefined,
          });

          const children: any[] = Array.isArray(parent.children)
            ? parent.children
            : [];
          children.forEach((child: any) => {
            flattened.push({
              id: child.id,
              title: child.title,
              titleEn: child.titleEn ?? undefined,
              slug: child?.url ? String(child.url).replace(/^\//, "") : "",
              parentId: child.parentId ?? parent.id ?? null,
              sortOrder: child.sortOrder ?? 0,
              type: child.type === "external" ? "external" : "internal",
              url: child.url ?? null,
              isVisible: child.isVisible !== false,
              hasChildren: Array.isArray(child.children)
                ? child.children.length > 0
                : false,
              productCategory: child.productCategory ?? undefined,
            });
          });
        });

        const visible = flattened.filter((i) => i.isVisible);
        setNavItems(visible.length > 0 ? visible : fallbackNavItems);
        return;
      }

      // API 失敗時不使用舊格式備援資料
      setNavItems(fallbackNavItems);
    };

    // 載入產品資料（API）
    const loadProducts = async () => {
      const res = await API_GetProducts(demoUuid);
      if (cancelled) return;

      if (res?.success) {
        const items: any[] = Array.isArray(res.data) ? res.data : [];
        const mapped: Product[] = items.map((p: any) => ({
          id: p.id,
          title: p.title,
          titleEn: p.titleEn ?? null,
          slug: p.slug,
          category: p.category ?? null,
          categoryEn: p.categoryEn ?? null,
          isPublished: !!p.isPublished,
        }));
        const published = mapped.filter((p) => p.isPublished);
        setProducts(published.length > 0 ? published : fallbackProducts);
        return;
      }

      // API 失敗時不使用舊格式備援資料
      setProducts(fallbackProducts);
    };

    loadNavigation();
    loadProducts();

    // 後台更新時仍可用自訂事件觸發前台重新抓取
    const handleNavigationUpdated = () => loadNavigation();
    const handleProductsUpdated = () => loadProducts();
    window.addEventListener("navigationUpdated", handleNavigationUpdated);
    window.addEventListener("productsUpdated", handleProductsUpdated);

    return () => {
      cancelled = true;
      window.removeEventListener("navigationUpdated", handleNavigationUpdated);
      window.removeEventListener("productsUpdated", handleProductsUpdated);
    };
  }, [demoUuid]);

  const handleLangClick = (nextLang: string) => {
    if (isPending) return;
    if (nextLang !== "zh" && nextLang !== "en") return;
    // 切換語系：保持目前路徑與查詢參數，只替換語系前綴
    // DEMO 模式下需保留 ?UUID=xxx，否則切換後 demo 資料會消失
    startTransition(() => {
      const href = demoUuid ? `${pathname}?UUID=${demoUuid}` : pathname;
      router.replace(href, { locale: nextLang });
    });
  };

  return (
    <>
      <header className={styles.wrapper}>
        <Link href={demoUuid ? `/?UUID=${demoUuid}` : "/"} className={styles.brandLogo}>
          <img src="/images/logo.png" alt="BLOGCRAFT Logo" />
        </Link>
        <Navigation navItems={navItems} products={products} />
        <div className={styles.navRight}>
          <LanguageToggle lang={lang} onLangChange={handleLangClick} />
        </div>
        <button
          type="button"
          className={styles.hamburgerBtn}
          onClick={() => setIsMobileMenuOpen(true)}
          aria-label="開啟選單"
        >
          <span></span>
          <span></span>
          <span></span>
        </button>
      </header>
      <TopUtils isMobile={false} />
      <MobileMenu
        isOpen={isMobileMenuOpen}
        onClose={() => setIsMobileMenuOpen(false)}
        navItems={navItems}
        products={products}
        lang={lang}
        onLangChange={handleLangClick}
      />
    </>
  );
};

export default Header;
