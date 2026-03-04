"use client";

import { useState } from "react";
import { useLocale } from "next-intl";
import { Link } from "@/navigation";
import { useDemoHref } from "@/hooks/useDemoHref";
import FlipButton from "../FlipButton";
import styles from "./Navigation.module.scss";
import { FiChevronDown } from "react-icons/fi";
import type { NavigationItem, Product } from "@/types/navigation";

interface NavigationProps {
  navItems: NavigationItem[];
  products: Product[];
  isMobile?: boolean;
}

const Navigation = ({
  navItems,
  products,
  isMobile = false,
}: NavigationProps) => {
  const locale = useLocale();
  const appendDemoUuid = useDemoHref();
  // 依當前語系取得顯示標題
  const getTitle = (item: NavigationItem) =>
    locale === "en" && item.titleEn ? item.titleEn : item.title;
  const getProductTitle = (item: Product) =>
    locale === "en" && item.titleEn ? item.titleEn : item.title;
 

  const getCategoryLabel = (item: NavigationItem) => {
    const categoryKey = item.productCategory || item.title;
    if (locale !== "en") return categoryKey;

    const categoryEn = products.find(
      (p) => (p.category?.trim() || "") === categoryKey
    )?.categoryEn;

    return categoryEn || item.titleEn || item.title;
  };

  // 移動端：追蹤哪些項目是展開的
  const [expandedItems, setExpandedItems] = useState<Set<string>>(new Set());

  // 切換展開/收合狀態
  const toggleExpand = (itemId: string) => {
    setExpandedItems((prev) => {
      const newSet = new Set(prev);

      if (newSet.has(itemId)) {
        newSet.delete(itemId);
      } else {
        newSet.add(itemId);
      }

      return newSet;
    });
  };

  // 依 parentId 建立階層結構
  const parentItems = navItems
    .filter((item) => !item.parentId)
    .sort((a, b) => a.sortOrder - b.sortOrder);

  const childrenByParent: Record<string, NavigationItem[]> = {};

  navItems
    .filter((item) => item.parentId)
    .forEach((item) => {
      if (!item.parentId) return;

      if (!childrenByParent[item.parentId]) {
        childrenByParent[item.parentId] = [];
      }

      childrenByParent[item.parentId].push(item);
    });

  Object.values(childrenByParent).forEach((list) =>
    list.sort((a, b) => a.sortOrder - b.sortOrder),
  );

  // 外部連結直接回傳，站內路徑不附加 UUID（已經在初次以DEMO模式載入中添加過）
  // FlipButton 已內建呼叫 appendDemoUuid，普通 Link 則在使用時明確呼叫
  const buildRawPath = (item: NavigationItem): string => {
    if (item.type === "external" && item.url) return item.url;
    return item.slug ? `/${item.slug}` : "#";
  };

  return (
    <div className={isMobile ? styles.mobileNavContainer : styles.navContainer}>
      <ul className={styles.navBar}>
        {parentItems.map((parent) => {
          const children = childrenByParent[parent.id] || [];
          const hasDropdown = children.length > 0;
          const isExpanded = expandedItems.has(parent.id);

          return (
            <li key={parent.id} className={styles.navItemWrapper}>
              {/* 桌面端：使用 FlipButton */}
              {!isMobile && (
                <FlipButton
                  text={getTitle(parent)}
                  href={buildRawPath(parent)}
                  as="Link"
                />
              )}
              {/* 移動端：有子選單時顯示可展開按鈕，否則顯示 Link */}
              {isMobile && (
                <>
                  {hasDropdown ? (
                    <button
                      className={styles.mobileNavLink}
                      onClick={() => toggleExpand(parent.id)}
                      aria-expanded={isExpanded}
                      aria-label={isExpanded ? "收合選單" : "展開選單"}
                    >
                      {getTitle(parent)}
                      <div className={styles.expandBtn}>
                        <span
                          className={`${styles.expandIcon}

                      ${isExpanded ? styles.expanded : ""}

                      `}
                        >
                          <FiChevronDown fontSize={16} />
                        </span>
                      </div>
                    </button>
                  ) : (
                    <Link
                      href={appendDemoUuid(buildRawPath(parent))}
                      className={styles.mobileNavLink}
                    >
                      {getTitle(parent)}
                    </Link>
                  )}
                </>
              )}
              {hasDropdown && (
                <div
                  className={`${styles.navDropdown}

                  ${isMobile && isExpanded ? styles.expanded : ""}

                  `}
                >
                  <ul>
                    {children.map((child) => {
                      // 依產品分類產生子選單
                      const childProducts = products.filter((product) => {
                        const cat = product.category?.trim();
                        if (!cat) return false;

                        if (child.productCategory) {
                          return cat === child.productCategory;
                        }

                        // 若未設定 productCategory，預設以導覽名稱比對
                        return cat === child.title;
                      });

                      const hasProductSubmenu = childProducts.length > 0;
                      const isChildExpanded = expandedItems.has(child.id);

                      return (
                        <li key={child.id}>
                          {isMobile && hasProductSubmenu ? (
                            <button
                              type="button"
                              className={styles.mobileNavItem}
                              onClick={() => toggleExpand(child.id)}
                              aria-expanded={isChildExpanded}
                              aria-label={
                                isChildExpanded ? "收合選單" : "展開選單"
                              }
                            >
                              <div className={styles.mobileSubmenuLink}>
                                {getCategoryLabel(child)}
                              </div>
                              <span
                                className={`${styles.expandIcon}

                              ${isChildExpanded ? styles.expanded : ""}

                              `}
                              >
                                <FiChevronDown
                                  fontSize={16}
                                  color={"#666666"}
                                />
                              </span>
                            </button>
                          ) : (
                            <Link href={appendDemoUuid(buildRawPath(child))}>
                              {hasProductSubmenu
                                ? getCategoryLabel(child)
                                : getTitle(child)}
                            </Link>
                          )}
                          {hasProductSubmenu && (
                            <div
                              className={`${styles.navSubmenu}

                              ${
                                isMobile && isChildExpanded
                                  ? styles.expanded
                                  : ""
                              }`}
                            >
                              <ul>
                                {childProducts.map((product) => (
                                  <li key={product.id}>
                                    <Link href={appendDemoUuid(`/${product.slug}`)}>
                                      {getProductTitle(product)}
                                    </Link>
                                  </li>
                                ))}
                              </ul>
                            </div>
                          )}
                        </li>
                      );
                    })}
                  </ul>
                </div>
              )}
            </li>
          );
        })}
      </ul>
    </div>
  );
};

export default Navigation;
