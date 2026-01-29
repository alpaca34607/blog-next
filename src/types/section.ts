// Section Settings 相關類型定義

// Feature Item (用於 IconFeaturesSection)
export interface FeatureItem {
  icon?: string;
  iconImage?: string;
  title: string;
  description?: string;
}

// Card Item (用於 CardGridSection)
export interface CardItem {
  id?: string;
  title: string;
  excerpt?: string;
  category?: string;
  publishDate?: string;
  featuredImage?: string;
  link?: string;
  isFeatured?: boolean;
}

// Download Item (用於 DownloadsSection)
export interface DownloadItem {
  id?: string;
  title: string;
  category?: string;
  publishDate?: string;
  fileSize?: string;
  fileUrl?: string;
  fileName?: string;
  fileType?: string;
}

// Spec Item (用於 ProductSpecsSection)
export interface SpecItem {
  name: string;
  value: string;
}

// Section Settings 統一類型定義
// 包含所有 section 組件需要的參數，所有欄位設為 nullable（可選）以支援不同 case 的 section
export interface SectionSettings {
  // CTA Section 相關欄位
  ctaContent?: string;
  buttonText?: string;
  buttonLink?: string;
  buttonColor?: string;
  buttonTextColor?: string;

  // Card Grid Section 相關欄位
  dataSource?: string;
  limit?: number;
  sortBy?: string;
  filter?: string;
  cards?: CardItem[];
  enableCategoryFilter?: boolean;
  categories?: string[];

  // Hero Section 相關欄位
  image?: string;
  heroImage?: string;
  heroImages?: string[];

  // Icon Features Section 相關欄位
  features?: FeatureItem[];

  // Image Text Section 相關欄位 (image 已在 Hero Section 中定義)

  // Video Text Section 相關欄位
  video?: string;

  // Gallery Section 相關欄位
  images?: string[];

  // Downloads Section 相關欄位
  downloads?: DownloadItem[];

  // Product Specs Section 相關欄位 (images 已在 Gallery Section 中定義)
  specs?: SpecItem[];

  // Table Section 相關欄位
  tableId?: string;

  // Timeline Section 相關欄位
  timelineId?: string;

  // 通用背景設定（由後台區塊設定輸出）
  backgroundColor?: string;
  backgroundImage?: string;
  templateVariant?: string;
  isVisible?: boolean;
}
