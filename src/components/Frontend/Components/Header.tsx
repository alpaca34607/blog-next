"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import styles from "./Header.module.scss";
import Navigation from "./Header/Navigation";
import LanguageToggle from "./Header/LanguageToggle";
import TopUtils from "./Header/TopUtils";
import MobileMenu from "./Header/MobileMenu";
import {
  API_GetLanguagePreference,
  API_SetLanguagePreference,
  API_GetNavigationItem,
  API_GetProducts,
} from "@/app/api/public_api";

interface NavigationItem {
  id: string;
  title: string;
  slug: string;
  parentId?: string | null;
  sortOrder: number;
  type: "internal" | "external";
  url?: string | null;
  isVisible: boolean;
  hasChildren?: boolean;
  productCategory?: string;
}

interface Product {
  id: string;
  title: string;
  slug: string;
  category?: string | null;
  isPublished: boolean;
}

// 舊導航項目資料格式
interface OldNavItem {
  id: number;
  text: string;
  link: string;

  dropdown?: Array<{
    text: string;
    link: string;

    submenu?: Array<{
      text: string;
      link: string;
    }>;
  }>;
}

// 舊導航項目備用資料
const oldNavItemsData: OldNavItem[] = [
  {
    id: 1,
    text: "關於布創",
    link: "#",
  },

  {
    id: 2,
    text: "服務項目",
    link: "javascript:;",
    dropdown: [
      {
        text: "模組化網站架構",
        link: "javascript:;",
        submenu: [
          {
            text: "部落格式形象網頁",
            link: "#",
          },

          {
            text: "通用網站模板",
            link: "#",
          },
        ],
      },

      {
        text: "客製化設計與開發",
        link: "javascript:;",
        submenu: [
          {
            text: "品牌形象網站設計",
            link: "#",
          },
        ],
      },
    ],
  },

  {
    id: 3,
    text: "最新消息",
    link: "/news",
  },
  {
    id: 4,
    text: "範例展示",
    link: "#",
  },
];

// 將舊格式轉換為新格式（導覽項目）
const convertOldNavToNew = (oldItems: OldNavItem[]): NavigationItem[] => {
  const newItems: NavigationItem[] = [];
  let orderCounter = 0;

  oldItems.forEach((oldItem) => {
    // 解析 link 判斷是否為外部連結
    const isExternal =
      oldItem.link.startsWith("http") || oldItem.link.startsWith("https");
    const slug =
      oldItem.link === "#" || oldItem.link === "javascript:;"
        ? ""
        : oldItem.link.replace(/^\/+/, "").replace(/^https?:\/\/[^\/]+/, "");

    // 建立主項目
    const parentItem: NavigationItem = {
      id: oldItem.id.toString(),
      title: oldItem.text,
      slug: isExternal ? "" : slug,
      sortOrder: orderCounter++,
      type: isExternal ? "external" : "internal",
      url: isExternal ? oldItem.link : undefined,
      isVisible: true,
      hasChildren: !!oldItem.dropdown && oldItem.dropdown.length > 0,
    };

    newItems.push(parentItem);

    // 處理子項目（dropdown）
    if (oldItem.dropdown && oldItem.dropdown.length > 0) {
      let childOrderCounter = 0;

      oldItem.dropdown.forEach((dropdownItem) => {
        const isChildExternal =
          dropdownItem.link.startsWith("http") ||
          dropdownItem.link.startsWith("https");
        const childSlug =
          dropdownItem.link === "#" || dropdownItem.link === "javascript:;"
            ? ""
            : dropdownItem.link
                .replace(/^\/+/, "")
                .replace(/^https?:\/\/[^\/]+/, "");

        const childItem: NavigationItem = {
          id: `${oldItem.id}-${childOrderCounter}`,
          title: dropdownItem.text,
          slug: isChildExternal ? "" : childSlug,
          parentId: parentItem.id,
          sortOrder: childOrderCounter++,
          type: isChildExternal ? "external" : "internal",
          url: isChildExternal ? dropdownItem.link : undefined,
          isVisible: true,
          hasChildren:
            !!dropdownItem.submenu && dropdownItem.submenu.length > 0,
          // 設定 productCategory 為子項目名稱，用於匹配產品分類
          productCategory: dropdownItem.text,
        };

        newItems.push(childItem);
      });
    }
  });

  return newItems;
};

// 將舊格式的 submenu 轉換為產品資料
const convertOldSubmenuToProducts = (oldItems: OldNavItem[]): Product[] => {
  const products: Product[] = [];
  let productIdCounter = 1000; // 從 1000 開始避免與真實產品 ID 衝突

  oldItems.forEach((oldItem) => {
    if (oldItem.dropdown && oldItem.dropdown.length > 0) {
      oldItem.dropdown.forEach((dropdownItem) => {
        if (dropdownItem.submenu && dropdownItem.submenu.length > 0) {
          dropdownItem.submenu.forEach((submenuItem) => {
            // 從外部連結提取 slug
            let slug = "";

            if (submenuItem.link.startsWith("http")) {
              // 從 URL 提取路徑作為 slug
              try {
                const url = new URL(submenuItem.link);

                slug =
                  url.pathname.replace(/^\//, "") ||
                  `product-${productIdCounter}`;
              } catch {
                slug = `product-${productIdCounter}`;
              }
            } else {
              slug =
                submenuItem.link.replace(/^\/+/, "") ||
                `product-${productIdCounter}`;
            }

            const product: Product = {
              id: (productIdCounter++).toString(),
              title: submenuItem.text,
              slug: slug,
              category: dropdownItem.text, // 使用 dropdown 項目的名稱作為分類
              isPublished: true,
            };

            products.push(product);
          });
        }
      });
    }
  });

  return products;
};

const Header = () => {
  const [lang, setLang] = useState("zh");
  const [navItems, setNavItems] = useState<NavigationItem[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    let cancelled = false;

    // 載入語系偏好（cookie）
    const loadLanguage = async () => {
      const res = await API_GetLanguagePreference();
      if (cancelled) return;
      if (res?.success && res.data?.lang) {
        const next = res.data.lang;
        if (next === "en" || next === "zh") setLang(next);
      }
    };

    // 載入導覽資料（API）
    const loadNavigation = async () => {
      const res = await API_GetNavigationItem();
      if (cancelled) return;

      if (res?.success) {
        const items: any[] = Array.isArray(res.data) ? res.data : [];
        // 後端回傳為「頂層 + children」結構；前台 Navigation 元件使用 parentId 的扁平結構
        const flattened: NavigationItem[] = [];
        items.forEach((parent: any) => {
          flattened.push({
            id: parent.id,
            title: parent.title,
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
        setNavItems(
          visible.length > 0 ? visible : convertOldNavToNew(oldNavItemsData)
        );
        return;
      }

      // API 失敗時使用備用資料
      setNavItems(convertOldNavToNew(oldNavItemsData));
    };

    // 載入產品資料（API）
    const loadProducts = async () => {
      const res = await API_GetProducts();
      if (cancelled) return;

      if (res?.success) {
        const items: any[] = Array.isArray(res.data) ? res.data : [];
        const mapped: Product[] = items.map((p: any) => ({
          id: p.id,
          title: p.title,
          slug: p.slug,
          category: p.category ?? null,
          isPublished: !!p.isPublished,
        }));
        const published = mapped.filter((p) => p.isPublished);
        setProducts(
          published.length > 0
            ? published
            : convertOldSubmenuToProducts(oldNavItemsData)
        );
        return;
      }

      // API 失敗時使用備用資料
      setProducts(convertOldSubmenuToProducts(oldNavItemsData));
    };

    loadLanguage();
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
  }, []);

  const handleLangClick = (nextLang: string) => {
    setLang(nextLang);
    if (nextLang === "zh" || nextLang === "en") {
      // 透過 API 寫入 cookie，避免依賴 localStorage
      API_SetLanguagePreference(nextLang).catch(() => {});
    }
  };

  return (
    <>
      <header className={styles.wrapper}>
        <Link href="/" className={styles.brandLogo}>
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
