// 新聞資料基底型別（所有欄位 optional）
export interface NewsData {
  id?: string;
  title?: string;
  titleEn?: string;
  slug?: string;
  category?: string;
  categoryEn?: string;
  excerpt?: string;
  excerptEn?: string;
  content?: string;
  contentEn?: string;
  featuredImage?: string;
  publishDate?: string;
  isPublished?: boolean;
  isFeatured?: boolean;
}

// 表單用型別（新增/編輯，title/slug/content 必填）
export interface NewsFormData extends NewsData {
  title: string;
  titleEn: string;
  slug: string;
  category: string;
  categoryEn: string;
  excerpt: string;
  excerptEn: string;
  content: string;
  contentEn: string;
  featuredImage: string;
  publishDate: string;
  isPublished: boolean;
  isFeatured: boolean;
}

// API 回傳的完整新聞記錄（id 必填，含時間戳記）
export interface NewsRecord extends NewsData {
  id: string;
  title: string;
  titleEn: string;
  slug: string;
  category: string;
  categoryEn: string;
  content: string;
  contentEn: string;
  isPublished: boolean;
  isFeatured: boolean;
  createdAt?: string;
  updatedAt?: string;
}
