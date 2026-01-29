"use client";

import {
  useState,
  useEffect
}

from "react";
import Image from "next/image";

import {
  FiCalendar,
  FiTag
}

from "react-icons/fi";

import {
  getSectionStyle
}

from "@/utils/sectionStyles";
import styles from "./CardGridSection.module.scss";
import Link from "next/link";

import TabBar,
  {
  TabItem
}

from "@/components/public/TabBar";

import {
  API_GetNewsWithParams,
  API_GetProducts
}

from "@/app/api/public_api";

interface CardGridSectionProps {
  section: {
    title?: string;
    subtitle?: string;

    settings?: {
      backgroundColor?: string;
      backgroundImage?: string;
      templateVariant?: string;
      dataSource?: string;
      limit?: number;
      sortBy?: string;
      filter?: string;
      cards?: CardItem[];
      enableCategoryFilter?: boolean; // 是否啟用分類篩選
      categories?: string[]; // 自定義分類列表
    }

    ;
  }

  ;
}

interface CardItem {
  id?: string;
  title: string;
  excerpt?: string;
  category?: string;
  publishDate?: string;
  featuredImage?: string;
  link?: string;
  isFeatured?: boolean; // 是否為精選
}

interface NewsArticle {
  id: string;
  title: string;
  slug: string;
  category?: string | null;
  excerpt?: string | null;
  content?: string | null;
  featuredImage?: string | null;
  publishDate?: string | null;
  isPublished: boolean;
  isFeatured: boolean;
}

interface ProductItem {
  id: string;
  title: string;
  slug: string;
  category?: string | null;
  isPublished: boolean;
}

const CardGridSection=( {
    section
  }

  : CardGridSectionProps)=> {

  // 使用共用的背景樣式工具函數
  const {
    style: sectionStyle, className: backgroundImageClass
  }

  =getSectionStyle( {
      backgroundColor: section.settings?.backgroundColor,
      backgroundImage: section.settings?.backgroundImage,
    }

  );
  const variant=section.settings?.templateVariant || "grid-3";
  const dataSource=section.settings?.dataSource || "custom";
  const limit=section.settings?.limit || 6;
  const sortBy=section.settings?.sortBy || "date";
  const filter=section.settings?.filter || "";
  const enableCategoryFilter=section.settings?.enableCategoryFilter || false;
  const customCategories=section.settings?.categories || [];

  const [newsArticles,
  setNewsArticles]=useState<NewsArticle[]>([]);
  const [products,
  setProducts]=useState<ProductItem[]>([]);
  const [isClient,
  setIsClient]=useState(false);
  const [activeCategory,
  setActiveCategory]=useState<string | null>(null);

  // 從 API 讀取資料（避免依賴 localStorage）
  useEffect(()=> {
      setIsClient(true);

      const fetchData=async ()=> {
        if (dataSource==="news") {
          const res=await API_GetNewsWithParams();

          if (res?.success) {
            const items: any[]=Array.isArray(res.data) ? res.data : [];

            setNewsArticles(items.map((n: any)=> ( {
                    id: n.id,
                    title: n.title,
                    slug: n.slug,
                    category: n.category ?? null,
                    excerpt: n.excerpt ?? null,
                    content: n.content ?? null,
                    featuredImage: n.featuredImage ?? null,
                    publishDate: n.publishDate ?? null,
                    isPublished: ! !n.isPublished,
                    isFeatured: ! !n.isFeatured,
                  }

                )));
          }

          else {
            setNewsArticles([]);
          }

          return;
        }

        if (dataSource==="products") {
          const res=await API_GetProducts();

          if (res?.success) {
            const items: any[]=Array.isArray(res.data) ? res.data : [];

            setProducts(items.map((p: any)=> ( {
                    id: p.id,
                    title: p.title,
                    slug: p.slug,
                    category: p.category ?? null,
                    isPublished: ! !p.isPublished,
                  }

                )));
          }

          else {
            setProducts([]);
          }

          return;
        }
      }

      ;

      fetchData().catch((error)=> {
          console.error("載入卡片資料時發生錯誤:", error);
          setNewsArticles([]);
          setProducts([]);
        }

      );
    }

    , [dataSource]);

  // 獲取所有可用的分類
  const getAvailableCategories=(): string[]=> {
    if (customCategories.length > 0) {
      return customCategories;
    }

    if (dataSource==="news"&& newsArticles.length > 0) {
      const categories=new Set<string>();

      newsArticles.forEach((article)=> {
          if (article.isPublished && article.category) {
            categories.add(article.category);
          }
        }

      );
      return Array.from(categories);
    }

    if (dataSource==="custom"&& section.settings?.cards) {
      const categories=new Set<string>();

      section.settings.cards.forEach((card)=> {
          if (card.category) {
            categories.add(card.category);
          }
        }

      );
      return Array.from(categories);
    }

    return [];
  }

  ;

  // 從設定中獲取卡片資料
  const getCards=(): CardItem[]=> {

    // 如果有自定義卡片，使用自定義卡片
    if (dataSource==="custom") {
      let customCards=section.settings?.cards || [];

      // 套用分類篩選
      if (enableCategoryFilter && activeCategory !==null) {
        customCards=customCards.filter((card)=> card.category===activeCategory);
      }

      if (customCards.length > 0) {
        return customCards .filter((card)=> card.title) // 只顯示有標題的卡片

        .slice(0, limit) .map((card, index)=> ( {

              ...card,
              id: card.id || `card-${
                index
              }

              `,
            }

          ));
      }

      // 如果選擇自定義但沒有卡片，返回空陣列
      return [];
    }

    // 從 localStorage 獲取新聞資料
    if (dataSource==="news") {
      // 只顯示已發布的新聞
      let filteredNews=newsArticles.filter((article)=> article.isPublished);

      // 套用分類篩選
      if (enableCategoryFilter && activeCategory !==null) {
        filteredNews=filteredNews.filter((article)=> article.category===activeCategory);
      }

      // 套用篩選條件（例如：category=技術文章）
      if (filter && ( !enableCategoryFilter || activeCategory===null)) {
        const [filterKey,
        filterValue]=filter.split("=");

        if (filterKey && filterValue) {
          filteredNews=filteredNews.filter((article)=> {
              const key=filterKey.trim() as keyof NewsArticle;
              const value=filterValue.trim();
              return String(article[key])===value;
            }

          );
        }
      }

      // 排序
      filteredNews.sort((a, b)=> {
          switch (sortBy) {
            case "date": return (new Date(b.publishDate || 0).getTime() - new Date(a.publishDate || 0).getTime());
            case "date_asc": return (new Date(a.publishDate || 0).getTime() - new Date(b.publishDate || 0).getTime());
            case "title": return a.title.localeCompare(b.title);
            case "title_desc": return b.title.localeCompare(a.title);
            default: return (new Date(b.publishDate || 0).getTime() - new Date(a.publishDate || 0).getTime());
          }
        }

      );

      // 限制數量並轉換為 CardItem 格式
      return filteredNews.slice(0, limit).map((article)=> ( {

            id: article.id,
            title: article.title,
            excerpt: article.excerpt || undefined,
            category: article.category || undefined,
            publishDate: article.publishDate || undefined,
            featuredImage: article.featuredImage || undefined,
            link: `/news/${
              article.slug
            }

            `, // 生成新聞頁面路由
            isFeatured: article.isFeatured, // 保留精選標記
          }

        ));
    }

    if (dataSource==="products") {
      let filtered=products.filter((p)=> p.isPublished);

      // 套用分類篩選
      if (enableCategoryFilter && activeCategory !==null) {
        filtered=filtered.filter((p)=> p.category===activeCategory);
      }

      // 套用 filter（例如：category=xxx）
      if (filter && ( !enableCategoryFilter || activeCategory===null)) {
        const [filterKey,
        filterValue]=filter.split("=");

        if (filterKey && filterValue && filterKey.trim()==="category") {
          filtered=filtered.filter((p)=> String(p.category || "")===filterValue.trim());
        }
      }

      // 產品沒有 publishDate，僅支援標題排序
      if (sortBy==="title_desc") filtered.sort((a, b)=> b.title.localeCompare(a.title));
      else if (sortBy==="title") filtered.sort((a, b)=> a.title.localeCompare(b.title));

      return filtered.slice(0, limit).map((p)=> ( {

            id: p.id,
            title: p.title,
            category: p.category || undefined,
            link: `/${
              p.slug
            }

            `,
          }

        ));
    }

    // 如果沒有設定資料來源，返回空陣列（不顯示預設資料）
    return [];
  }

  ;

  const cards=isClient ? getCards() : [];
  const availableCategories=isClient ? getAvailableCategories() : [];

  const getGridClass=()=> {
    switch (variant) {
      case "grid-3":
        return styles.grid3;
      case "grid-4":
        return styles.grid4;
      case "list":
        return styles.list;
      default:
        return styles.grid3;
    }
  }

  ;

  const formatDate=(dateString?: string)=> {
    if ( !dateString) return "";

    try {
      const date=new Date(dateString);

      return date.toLocaleDateString("zh-TW", {
          year: "numeric",
          month: "2-digit",
          day: "2-digit",
        }

      );
    }

    catch {
      return dateString;
    }
  }

  ;

  // 建立 Tab 項目
  const getTabItems=(): TabItem[]=> {
    if ( !enableCategoryFilter || availableCategories.length===0) {
      return [];
    }

    const tabItems: TabItem[]=[ {
      id: "all",
        label: "全部",
        value: null,
    }

    ,
    ...availableCategories.map((category)=> ( {
          id: category,
          label: category,
          value: category,
        }

      )),
    ];

    return tabItems;
  }

  ;

  const tabItems=getTabItems();

  return (<section className= {
      `${
        styles.cardGridSection
      }

      ${
        backgroundImageClass ? styles.hasBgImage : ""
      }

      `
    }

    style= {
      sectionStyle
    }

    > <div className= {
      styles.container
    }

    > {
      section.title && (<div className= {
          styles.header
        }

        > <h2 className= {
          styles.title
        }

        > {
          section.title
        }

        </h2> {
          section.subtitle && (<p className= {
              styles.subtitle
            }

            > {
              section.subtitle
            }

            </p>)
        }

        </div>)
    }

      {
      /* TabBar 分類篩選 */
    }

      {
      enableCategoryFilter && tabItems.length > 0 && (<div className= {
          styles.filterSection
        }

        > <TabBar tabs= {
          tabItems
        }

        activeValue= {
          activeCategory
        }

        onTabChange= {
          (value)=> setActiveCategory(value as string | null)
        }

        /> </div>)
    }

    <div className= {
      `${
        styles.grid
      }

      ${
        getGridClass()
      }

      `
    }

    > {
      cards.length > 0 ? (cards.map((card)=> (<div key= {
              card.id
            }

            className= {
              styles.card
            }

            > {
              card.featuredImage && (<div className= {
                  styles.cardImage
                }

                > <Image src= {
                  card.featuredImage
                }

                alt= {
                  card.title
                }

                width= {
                  400
                }

                height= {
                  250
                }

                className= {
                  styles.image
                }

                /> </div>)
            }

            <div className= {
              styles.cardContent
            }

            > {
              (card.category || card.isFeatured || card.publishDate) && (<div className= {
                  styles.cardMeta
                }

                > {
                  card.category && (<span className= {
                      styles.badge
                    }

                    > <FiTag size= {
                      14
                    }

                    /> {
                      card.category
                    }

                    </span>)
                }

                  {
                  card.isFeatured && (<span className= {
                      styles.featured
                    }

                    >精選</span>)
                }

                  {
                  card.publishDate && (<span className= {
                      styles.date
                    }

                    > <FiCalendar size= {
                      14
                    }

                    /> {
                      formatDate(card.publishDate)
                    }

                    </span>)
                }

                </div>)
            }

            <h3 className= {
              styles.cardTitle
            }

            > {
              card.title
            }

            </h3> {
              card.excerpt && (<p className= {
                  styles.cardExcerpt
                }

                > {
                  card.excerpt
                }

                </p>)
            }

            </div> {
              card.link && (<Link href= {
                  card.link
                }

                className= {
                  styles.cardLink
                }

                > View More </Link>)
            }

            </div>))) : (<div className= {
          styles.emptyState
        }

        > <p> 目前沒有 {
          " "
        }

          {
          enableCategoryFilter && activeCategory !==null ? activeCategory : ""
        }

          {
          " "
        }

        資料 </p> </div>)
    }

    </div> </div> </section>);
}

;

export default CardGridSection;