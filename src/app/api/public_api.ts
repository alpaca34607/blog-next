import { tryFetch, type RequestOptions } from "@/app/api/api_client";

// ----------------------------- 公開 API（不需權限） -----------------------------

// ----------------------------- 取得網站設定 -----------------------------
export const API_GetSiteSettings = async () => {
  const path = `/api/get-site-settings`;
  const requestOption: RequestOptions = {
    method: "GET",
    withAuth: false,
  };
  return await tryFetch(path, requestOption);
};

// ----------------------------- 取得導覽列 -----------------------------
export const API_GetNavigationItem = async () => {
  const path = `/api/get-navigation-item`;
  const requestOption: RequestOptions = {
    method: "GET",
    withAuth: false,
  };
  return await tryFetch(path, requestOption);
};

// ----------------------------- 取得產品 -----------------------------
export const API_GetProducts = async () => {
  const path = `/api/get-products`;
  const requestOption: RequestOptions = {
    method: "GET",
    withAuth: false,
  };
  return await tryFetch(path, requestOption);
};

// ----------------------------- 取得新聞 -----------------------------
export const API_GetNews = async () => {
  const path = `/api/get-news`;
  const requestOption: RequestOptions = {
    method: "GET",
    withAuth: false,
  };
  return await tryFetch(path, requestOption);
};

// ----------------------------- 取得新聞（可帶條件） -----------------------------
export const API_GetNewsWithParams = async (params?: {
  category?: string;
  isFeatured?: boolean;
  slug?: string;
}) => {
  const query = new URLSearchParams();
  if (params?.category) query.append("category", params.category);
  if (typeof params?.isFeatured === "boolean") {
    query.append("isFeatured", params.isFeatured ? "true" : "false");
  }
  if (params?.slug) query.append("slug", params.slug);

  const path = `/api/get-news${query.toString() ? `?${query.toString()}` : ""}`;
  const requestOption: RequestOptions = {
    method: "GET",
    withAuth: false,
  };
  return await tryFetch(path, requestOption);
};

// ----------------------------- 取得前台頁面（含區塊） -----------------------------
export const API_GetPageBySlug = async (slug: string) => {
  const query = new URLSearchParams();
  query.append("slug", slug);
  const path = `/api/get-page?${query.toString()}`;
  const requestOption: RequestOptions = {
    method: "GET",
    withAuth: false,
  };
  return await tryFetch(path, requestOption);
};

// ----------------------------- 語系偏好（cookie） -----------------------------
export const API_GetLanguagePreference = async () => {
  const path = `/api/preferences/language`;
  const requestOption: RequestOptions = {
    method: "GET",
    withAuth: false,
  };
  return await tryFetch(path, requestOption);
};

export const API_SetLanguagePreference = async (lang: "zh" | "en") => {
  const path = `/api/preferences/language`;
  const requestOption: RequestOptions = {
    method: "POST",
    body: { lang },
    withAuth: false,
  };
  return await tryFetch(path, requestOption);
};

// ----------------------------- 公開讀取表格/時間軸 -----------------------------
export const API_GetTableByIdPublic = async (id: string) => {
  const path = `/api/tables/${id}`;
  const requestOption: RequestOptions = {
    method: "GET",
    withAuth: false,
  };
  return await tryFetch(path, requestOption);
};

export const API_GetTableRowsPublic = async (tableId: string) => {
  const path = `/api/tables/${tableId}/rows`;
  const requestOption: RequestOptions = {
    method: "GET",
    withAuth: false,
  };
  return await tryFetch(path, requestOption);
};

export const API_GetTimelineByIdPublic = async (id: string) => {
  const path = `/api/timelines/${id}`;
  const requestOption: RequestOptions = {
    method: "GET",
    withAuth: false,
  };
  return await tryFetch(path, requestOption);
};

export const API_GetTimelineItemsPublic = async (timelineId: string) => {
  const path = `/api/timelines/${timelineId}/items`;
  const requestOption: RequestOptions = {
    method: "GET",
    withAuth: false,
  };
  return await tryFetch(path, requestOption);
};

// ----------------------------- 公開讀取設定（例如：newsListPageSettings） -----------------------------
export const API_GetConfig = async (key: string) => {
  const path = `/api/config/${encodeURIComponent(key)}`;
  const requestOption: RequestOptions = {
    method: "GET",
    withAuth: false,
  };
  return await tryFetch(path, requestOption);
};
