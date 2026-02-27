export interface NavigationItem {
  id: string;
  title: string;
  titleEn?: string;
  slug: string;
  parentId?: string | null;
  sortOrder: number;
  type: "internal" | "external";
  url?: string | null;
  isVisible: boolean;
  hasChildren?: boolean;
  productCategory?: string;
}

export interface Product {
  id: string;
  title: string;
  slug: string;
  category?: string | null;
  isPublished: boolean;
}
