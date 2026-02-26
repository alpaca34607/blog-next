import { tryFetch, type RequestOptions } from "@/app/api/api_client";
import type { CreatePageData, UpdatePageData } from "@/types/page";

// ----------------------------- 後台 API -----------------------------

// ----------------------------- 管理用新聞API -----------------------------
export const API_GetNewsAdmin = async (params?: {
  page?: number;
  limit?: number;
  search?: string;
  sortBy?: string;
  sortOrder?: "asc" | "desc";
  filter?: Record<string, any>;
}) => {
  const queryParams = new URLSearchParams();
  if (params?.page) queryParams.append("page", params.page.toString());
  if (params?.limit) queryParams.append("limit", params.limit.toString());
  if (params?.search) queryParams.append("search", params.search);
  if (params?.sortBy) queryParams.append("sortBy", params.sortBy);
  if (params?.sortOrder) queryParams.append("sortOrder", params.sortOrder);
  if (params?.filter) {
    Object.entries(params.filter).forEach(([key, value]) => {
      queryParams.append(`filter[${key}]`, String(value));
    });
  }

  const path = `/api/news${
    queryParams.toString() ? `?${queryParams.toString()}` : ""
  }`;
  const requestOption: RequestOptions = { method: "GET" };
  return await tryFetch(path, requestOption);
};

export const API_GetNewsById = async (id: string) => {
  const path = `/api/news/${id}`;
  const requestOption: RequestOptions = { method: "GET" };
  return await tryFetch(path, requestOption);
};

export const API_CreateNews = async (data: {
  title: string;
  slug: string;
  excerpt?: string;
  content: string;
  category?: string;
  isPublished?: boolean;
  isFeatured?: boolean;
  featuredImage?: string;
  publishDate?: string;
}) => {
  const path = `/api/news`;
  const requestOption: RequestOptions = { method: "POST", body: data };
  return await tryFetch(path, requestOption);
};

export const API_UpdateNews = async (
  id: string,
  data: {
    title?: string;
    slug?: string;
    excerpt?: string;
    content?: string;
    category?: string;
    isPublished?: boolean;
    isFeatured?: boolean;
    featuredImage?: string;
    publishDate?: string;
  }
) => {
  const path = `/api/news/${id}`;
  const requestOption: RequestOptions = { method: "PUT", body: data };
  return await tryFetch(path, requestOption);
};

export const API_DeleteNews = async (id: string) => {
  const path = `/api/news/${id}`;
  const requestOption: RequestOptions = { method: "DELETE" };
  return await tryFetch(path, requestOption);
};

// ----------------------------- 管理用頁面/產品API -----------------------------
export const API_GetPagesAdmin = async (params?: {
  page?: number;
  limit?: number;
  search?: string;
  sortBy?: string;
  sortOrder?: "asc" | "desc";
  filter?: Record<string, any>;
}) => {
  const queryParams = new URLSearchParams();
  if (params?.page) queryParams.append("page", params.page.toString());
  if (params?.limit) queryParams.append("limit", params.limit.toString());
  if (params?.search) queryParams.append("search", params.search);
  if (params?.sortBy) queryParams.append("sortBy", params.sortBy);
  if (params?.sortOrder) queryParams.append("sortOrder", params.sortOrder);
  if (params?.filter) {
    Object.entries(params.filter).forEach(([key, value]) => {
      queryParams.append(`filter[${key}]`, String(value));
    });
  }

  const path = `/api/pages${
    queryParams.toString() ? `?${queryParams.toString()}` : ""
  }`;
  const requestOption: RequestOptions = { method: "GET" };
  return await tryFetch(path, requestOption);
};

export const API_GetPageById = async (id: string) => {
  const path = `/api/pages/${id}`;
  const requestOption: RequestOptions = { method: "GET" };
  return await tryFetch(path, requestOption);
};

// ----------------------------- 管理用頁面區塊 API -----------------------------
export const API_GetPageSectionsAdmin = async (pageId: string) => {
  const path = `/api/pages/${pageId}/sections`;
  const requestOption: RequestOptions = { method: "GET" };
  return await tryFetch(path, requestOption);
};

export const API_UpdatePageSectionsAdmin = async (
  pageId: string,
  sections: Array<{
    id?: string;
    sectionType: string;
    title?: string;
    subtitle?: string;
    content?: string;
    sortOrder: number;
    settings?: any;
  }>
) => {
  const path = `/api/pages/${pageId}/sections`;
  const requestOption: RequestOptions = { method: "PUT", body: sections };
  return await tryFetch(path, requestOption);
};

// ----------------------------- 管理用設定（AppConfig） -----------------------------
export const API_PutConfig = async (key: string, value: any) => {
  const path = `/api/config/${encodeURIComponent(key)}`;
  const requestOption: RequestOptions = { method: "PUT", body: value };
  return await tryFetch(path, requestOption);
};

export const API_CreatePage = async (data: CreatePageData) => {
  const path = `/api/pages`;
  const requestOption: RequestOptions = { method: "POST", body: data };
  return await tryFetch(path, requestOption);
};

export const API_UpdatePage = async (id: string, data: UpdatePageData) => {
  const path = `/api/pages/${id}`;
  const requestOption: RequestOptions = { method: "PUT", body: data };
  return await tryFetch(path, requestOption);
};

export const API_DeletePage = async (id: string) => {
  const path = `/api/pages/${id}`;
  const requestOption: RequestOptions = { method: "DELETE" };
  return await tryFetch(path, requestOption);
};

// ----------------------------- 管理用導航API -----------------------------
export const API_GetNavigationAdmin = async (params?: {
  page?: number;
  limit?: number;
  search?: string;
  sortBy?: string;
  sortOrder?: "asc" | "desc";
  filter?: Record<string, any>;
}) => {
  const queryParams = new URLSearchParams();
  if (params?.page) queryParams.append("page", params.page.toString());
  if (params?.limit) queryParams.append("limit", params.limit.toString());
  if (params?.search) queryParams.append("search", params.search);
  if (params?.sortBy) queryParams.append("sortBy", params.sortBy);
  if (params?.sortOrder) queryParams.append("sortOrder", params.sortOrder);
  if (params?.filter) {
    Object.entries(params.filter).forEach(([key, value]) => {
      queryParams.append(`filter[${key}]`, String(value));
    });
  }

  const path = `/api/navigation${
    queryParams.toString() ? `?${queryParams.toString()}` : ""
  }`;
  const requestOption: RequestOptions = { method: "GET" };
  return await tryFetch(path, requestOption);
};

export const API_GetNavigationById = async (id: string) => {
  const path = `/api/navigation/${id}`;
  const requestOption: RequestOptions = { method: "GET" };
  return await tryFetch(path, requestOption);
};

export const API_CreateNavigation = async (data: {
  title: string;
  titleEn?: string;
  url?: string | null;
  productCategory?: string;
  type?: "internal" | "external";
  isVisible?: boolean;
  sortOrder?: number;
  parentId?: string;
}) => {
  const path = `/api/navigation`;
  const requestOption: RequestOptions = { method: "POST", body: data };
  return await tryFetch(path, requestOption);
};

export const API_UpdateNavigation = async (
  id: string,
  data: {
    title?: string;
    titleEn?: string;
    url?: string | null;
    productCategory?: string | null;
    type?: "internal" | "external";
    isVisible?: boolean;
    sortOrder?: number;
    parentId?: string;
  }
) => {
  const path = `/api/navigation/${id}`;
  const requestOption: RequestOptions = { method: "PUT", body: data };
  return await tryFetch(path, requestOption);
};

export const API_DeleteNavigation = async (id: string) => {
  const path = `/api/navigation/${id}`;
  const requestOption: RequestOptions = { method: "DELETE" };
  return await tryFetch(path, requestOption);
};

// ----------------------------- 網站設定API -----------------------------
export const API_GetSiteSettingsAdmin = async () => {
  const path = `/api/site-settings`;
  const requestOption: RequestOptions = { method: "GET" };
  return await tryFetch(path, requestOption);
};

export const API_UpdateSiteSettings = async (data: {
  siteName?: string;
  siteNameEn?: string;
  logo?: string;
  footerLogo?: string;
  copyright?: string;
  phone?: string;
  email?: string;
  contactTime?: string;
  address?: string;
  lineQrCode?: string;
  socialLinks?: Record<string, string>;
  additionalLinks?: Array<{ title: string; url: string }>;
}) => {
  const path = `/api/site-settings`;
  const requestOption: RequestOptions = { method: "PUT", body: data };
  return await tryFetch(path, requestOption);
};

// ----------------------------- 管理用表格API -----------------------------
export const API_GetTablesAdmin = async (params?: {
  page?: number;
  limit?: number;
  search?: string;
  sortBy?: string;
  sortOrder?: "asc" | "desc";
}) => {
  const queryParams = new URLSearchParams();
  if (params?.page) queryParams.append("page", params.page.toString());
  if (params?.limit) queryParams.append("limit", params.limit.toString());
  if (params?.search) queryParams.append("search", params.search);
  if (params?.sortBy) queryParams.append("sortBy", params.sortBy);
  if (params?.sortOrder) queryParams.append("sortOrder", params.sortOrder);

  const path = `/api/tables${
    queryParams.toString() ? `?${queryParams.toString()}` : ""
  }`;
  const requestOption: RequestOptions = { method: "GET" };
  return await tryFetch(path, requestOption);
};

export const API_GetTableById = async (id: string) => {
  const path = `/api/tables/${id}`;
  const requestOption: RequestOptions = { method: "GET" };
  return await tryFetch(path, requestOption);
};

export const API_CreateTable = async (data: {
  name: string;
  description?: string;
  columns: Array<{ key: string; label: string; type: string }>;
}) => {
  const path = `/api/tables`;
  const requestOption: RequestOptions = { method: "POST", body: data };
  return await tryFetch(path, requestOption);
};

export const API_UpdateTable = async (
  id: string,
  data: {
    name?: string;
    description?: string;
    columns?: Array<{ key: string; label: string; type: string }>;
  }
) => {
  const path = `/api/tables/${id}`;
  const requestOption: RequestOptions = { method: "PUT", body: data };
  return await tryFetch(path, requestOption);
};

export const API_DeleteTable = async (id: string) => {
  const path = `/api/tables/${id}`;
  const requestOption: RequestOptions = { method: "DELETE" };
  return await tryFetch(path, requestOption);
};

export const API_GetTableRows = async (
  tableId: string,
  params?: {
    page?: number;
    limit?: number;
  }
) => {
  const queryParams = new URLSearchParams();
  if (params?.page) queryParams.append("page", params.page.toString());
  if (params?.limit) queryParams.append("limit", params.limit.toString());

  const path = `/api/tables/${tableId}/rows${
    queryParams.toString() ? `?${queryParams.toString()}` : ""
  }`;
  const requestOption: RequestOptions = { method: "GET" };
  return await tryFetch(path, requestOption);
};

export const API_CreateTableRow = async (
  tableId: string,
  data: Record<string, any>
) => {
  const path = `/api/tables/${tableId}/rows`;
  const requestOption: RequestOptions = { method: "POST", body: data };
  return await tryFetch(path, requestOption);
};

export const API_UpdateTableRow = async (
  tableId: string,
  rowId: string,
  data: Record<string, any>
) => {
  const path = `/api/tables/${tableId}/rows/${rowId}`;
  const requestOption: RequestOptions = { method: "PUT", body: data };
  return await tryFetch(path, requestOption);
};

export const API_DeleteTableRow = async (tableId: string, rowId: string) => {
  const path = `/api/tables/${tableId}/rows/${rowId}`;
  const requestOption: RequestOptions = { method: "DELETE" };
  return await tryFetch(path, requestOption);
};

// ----------------------------- 管理用時間軸API -----------------------------
export const API_GetTimelinesAdmin = async (params?: {
  page?: number;
  limit?: number;
  search?: string;
  sortBy?: string;
  sortOrder?: "asc" | "desc";
}) => {
  const queryParams = new URLSearchParams();
  if (params?.page) queryParams.append("page", params.page.toString());
  if (params?.limit) queryParams.append("limit", params.limit.toString());
  if (params?.search) queryParams.append("search", params.search);
  if (params?.sortBy) queryParams.append("sortBy", params.sortBy);
  if (params?.sortOrder) queryParams.append("sortOrder", params.sortOrder);

  const path = `/api/timelines${
    queryParams.toString() ? `?${queryParams.toString()}` : ""
  }`;
  const requestOption: RequestOptions = { method: "GET" };
  return await tryFetch(path, requestOption);
};

export const API_GetTimelineById = async (id: string) => {
  const path = `/api/timelines/${id}`;
  const requestOption: RequestOptions = { method: "GET" };
  return await tryFetch(path, requestOption);
};

export const API_CreateTimeline = async (data: {
  name: string;
  description?: string;
}) => {
  const path = `/api/timelines`;
  const requestOption: RequestOptions = { method: "POST", body: data };
  return await tryFetch(path, requestOption);
};

export const API_UpdateTimeline = async (
  id: string,
  data: {
    name?: string;
    description?: string;
  }
) => {
  const path = `/api/timelines/${id}`;
  const requestOption: RequestOptions = { method: "PUT", body: data };
  return await tryFetch(path, requestOption);
};

export const API_DeleteTimeline = async (id: string) => {
  const path = `/api/timelines/${id}`;
  const requestOption: RequestOptions = { method: "DELETE" };
  return await tryFetch(path, requestOption);
};

export const API_GetTimelineItems = async (
  timelineId: string,
  params?: {
    page?: number;
    limit?: number;
  }
) => {
  const queryParams = new URLSearchParams();
  if (params?.page) queryParams.append("page", params.page.toString());
  if (params?.limit) queryParams.append("limit", params.limit.toString());

  const path = `/api/timelines/${timelineId}/items${
    queryParams.toString() ? `?${queryParams.toString()}` : ""
  }`;
  const requestOption: RequestOptions = { method: "GET" };
  return await tryFetch(path, requestOption);
};

export const API_CreateTimelineItem = async (
  timelineId: string,
  data: {
    title: string;
    description?: string;
    date: string;
    image?: string;
    sortOrder?: number;
  }
) => {
  const path = `/api/timelines/${timelineId}/items`;
  const requestOption: RequestOptions = { method: "POST", body: data };
  return await tryFetch(path, requestOption);
};

export const API_UpdateTimelineItem = async (
  timelineId: string,
  itemId: string,
  data: {
    title?: string;
    description?: string;
    date?: string;
    image?: string;
    sortOrder?: number;
  }
) => {
  const path = `/api/timelines/${timelineId}/items/${itemId}`;
  const requestOption: RequestOptions = { method: "PUT", body: data };
  return await tryFetch(path, requestOption);
};

export const API_DeleteTimelineItem = async (
  timelineId: string,
  itemId: string
) => {
  const path = `/api/timelines/${timelineId}/items/${itemId}`;
  const requestOption: RequestOptions = { method: "DELETE" };
  return await tryFetch(path, requestOption);
};

// ----------------------------- 儀表板統計API -----------------------------
export const API_GetDashboardStats = async () => {
  const path = `/api/dashboard/stats`;
  const requestOption: RequestOptions = { method: "GET" };
  return await tryFetch(path, requestOption);
};
