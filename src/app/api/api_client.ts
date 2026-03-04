import { getAuthToken, getDemoToken } from "@/utils/common";

// 獲取 API 基礎 URL
// 注意：務必給預設值，避免 `${Host}/api/...` 變成 `undefined/api/...`
const Host = process.env.NEXT_PUBLIC_API_URL || "";

// 型別定義
export type HttpMethod = "GET" | "POST" | "PUT" | "PATCH" | "DELETE";

export interface RequestOptions {
  method?: HttpMethod;
  body?: Record<string, any> | string | FormData;
  contentType?: string;
  withAuth?: boolean;
}

export interface ApiPagination {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export interface ApiSuccessResponse<T = any> {
  success: true;
  data: T;
  message?: string;
  pagination?: ApiPagination;
}

export interface ApiFailureResponse {
  success: false;
  error: {
    code: string;
    message: string;
    details?: any;
  };
}

export type ApiResponse<T = any> = ApiSuccessResponse<T> | ApiFailureResponse;

// 後台頁面遇到 401/403（未授權/禁止存取）時，通知 AdminLayout 顯示「權限不足」提示
const emitAdminPermissionDeniedIfNeeded = (args: {
  status: number;
  url: string;
  errorData: any;
}) => {
  if (typeof window === "undefined") return;
  const pathname = window.location?.pathname || "";
  if (!pathname.startsWith("/admin")) return;

  if (args.status === 401 || args.status === 403) {
    const code = args?.errorData?.error?.code;
    window.dispatchEvent(
      new CustomEvent("admin:permissionDenied", {
        detail: {
          code,
          message: args?.errorData?.error?.message,
          status: args.status,
          url: args.url,
        },
      })
    );
  }
};

// 將 JSON 物件轉換為 URL encoded 字串
const jsonToUrlencoded = (obj: Record<string, any>): string => {
  const params = new URLSearchParams();

  Object.keys(obj).forEach((key) => {
    const value = obj[key];
    if (value !== null && value !== undefined) {
      if (Array.isArray(value)) {
        value.forEach((item) => {
          params.append(key, String(item));
        });
      } else {
        params.append(key, String(value));
      }
    }
  });

  return params.toString();
};

// 處理請求選項，包含認證標頭和內容類型
const handleEncodedRequestOption = ({
  method = "GET",
  body = {},
  contentType = "application/json",
  withAuth = true,
}: RequestOptions): RequestInit => {
  // 注意：避免在 server 端（SSR/Route）讀取 js-cookie
  // 管理員 token 優先；無則使用 DEMO 訪客 token
  const token =
    withAuth && typeof window !== "undefined"
      ? getAuthToken().token || getDemoToken().token
      : undefined;

  const headers: HeadersInit = {
    "Content-Type": `${contentType}; charset=utf-8`,
    Accept: "*/*",
    ...(withAuth && token ? { Authorization: `Bearer ${token}` } : {}),
  };

  const options: RequestInit = {
    redirect: "follow",
    method,
    headers,
  };

  if (method !== "GET" && body) {
    if (body instanceof FormData) {
      // FormData 不需要 Content-Type，瀏覽器會自動設定
      const { "Content-Type": _, ...restHeaders } = headers as Record<
        string,
        string
      >;
      options.headers = restHeaders;
      options.body = body;
    } else if (typeof body === "string") {
      options.body = body;
    } else if (contentType.includes("json")) {
      options.body = JSON.stringify(body);
    } else {
      options.body = jsonToUrlencoded(body as Record<string, any>);
    }
  }

  return options;
};

// 通用的 fetch 函數，處理錯誤和回應
export const tryFetch = async <T = any>(
  path: string,
  requestOption: RequestOptions = {}
): Promise<ApiResponse<T>> => {
  try {
    const url = path.startsWith("http") ? path : `${Host || ""}${path}`;
    const response = await fetch(
      url,
      handleEncodedRequestOption(requestOption)
    );

    if (!response.ok) {
      // 失敗：盡量沿用後端回傳的統一格式 { success:false, error:{...} }
      try {
        const errorData = await response.json();
        if (
          errorData &&
          typeof errorData === "object" &&
          "success" in errorData
        ) {
          emitAdminPermissionDeniedIfNeeded({
            status: response.status,
            url,
            errorData,
          });
          return errorData as ApiFailureResponse;
        }

        const message =
          (errorData?.error && errorData.error.message) ||
          errorData?.message ||
          response.statusText ||
          "Request failed";

        const res: ApiFailureResponse = {
          success: false,
          error: {
            code: `HTTP_${response.status}`,
            message,
            details: errorData,
          },
        };
        emitAdminPermissionDeniedIfNeeded({
          status: response.status,
          url,
          errorData: res,
        });
        return res;
      } catch {
        const res: ApiFailureResponse = {
          success: false,
          error: {
            code: `HTTP_${response.status}`,
            message: response.statusText || "Request failed",
          },
        };
        emitAdminPermissionDeniedIfNeeded({
          status: response.status,
          url,
          errorData: res,
        });
        return res;
      }
    }

    // 成功：回傳後端統一格式 { success:true, data, message, pagination? }
    // 若遇到非統一格式（理論上不應該），仍包成 success:true 以維持一致 API
    const data = await response.json().catch(() => null);
    if (data && typeof data === "object" && "success" in data) {
      return data as ApiResponse<T>;
    }

    return {
      success: true,
      data: data as T,
    };
  } catch (error) {
    console.error("🚀 ~ [tryFetch] error:", error);

    // 統一用 success=false 回傳，方便前端用 response.success 判斷
    if (typeof navigator !== "undefined" && !navigator.onLine) {
      return {
        success: false,
        error: {
          code: "OFFLINE",
          message: "目前沒有網路連線",
          details: { isNetworkError: true },
        },
      };
    }

    const errorMessage =
      error instanceof Error ? error.message : "An unknown error occurred.";
    return {
      success: false,
      error: {
        code: "NETWORK_ERROR",
        message: errorMessage,
        details: { isNetworkError: true },
      },
    };
  }
};
