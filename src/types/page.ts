// 頁面/產品資料的基底型別（所有欄位 optional）
export interface PageData {
  id?: string;
  title?: string;
  titleEn?: string;
  slug?: string;
  type?: "page" | "product";
  content?: string;
  metaTitle?: string;
  metaTitleEn?: string;
  metaDescription?: string;
  metaDescriptionEn?: string;
  isPublished?: boolean;
  logo?: string;
  videoUrl?: string;
  introImage?: string;
  introImageEn?: string;
  isFeatured?: boolean;
  externalUrl?: string;
  category?: string;
  categoryEn?: string;
  sortOrder?: number;
  heroTitle?: string;
  heroTitleEn?: string;
  heroSubtitle?: string;
  heroSubtitleEn?: string;
  heroImages?: string[];
}

// 新增時 title 與 slug 為必填
export type CreatePageData = PageData & {
  title: string;
  slug: string;
};

// 更新時全部 optional
export type UpdatePageData = PageData;

// 前台/後台通用的頁面型別
export interface Page extends PageData {
  title: string;
  slug: string;
}

// 產品額外欄位
export interface Product extends Page {
  navOrder?: number;
}

// API 回傳的完整頁面記錄（id 與 isPublished 為必填，含時間戳記與關聯計數）
export interface PageRecord extends Page {
  id: string;
  isPublished: boolean;
  /** 空字串為正式資料；DEMO 模式下正式資料為唯讀 */
  demoWorkspaceId?: string;
  createdAt?: string;
  updatedAt?: string;
  _count?: {
    sections: number;
  };
}

// API 回傳的完整產品記錄
export interface ProductRecord extends PageRecord {
  videoUrl?: string;
  introImage?: string;
  introImageEn?: string;
  isFeatured?: boolean;
}
