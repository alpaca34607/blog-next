import Cookies from "js-cookie";

const TokenName = "tccf_exhibition";
const PopupCookieName = "popupShown"; // 處理登入後的彈窗，如果登入顯示過，就不再顯示

export const setAuthToken = (token: string, expiresDay?: number): void => {
  Cookies.set(TokenName, token, { expires: expiresDay || 1 });
};

export const getAuthToken = (): { token: string | undefined } => {
  return {
    token: Cookies.get(TokenName),
  };
};

export const clearAuthToken = (): void => {
  Cookies.remove(TokenName);
};

// 設置彈窗已顯示的 cookie
export const setPopupShown = (): void => {
  Cookies.set(PopupCookieName, "true", { expires: 1 });
};

// 檢查是否已顯示彈窗
export const isPopupShown = (): boolean => {
  return Cookies.get(PopupCookieName) === "true";
};

// 清除彈窗 cookie
export const clearPopupShown = (): void => {
  Cookies.remove(PopupCookieName);
};

/**
 * 檢查富文本 HTML 是否為空（例如只有 <p></p> 或空白標籤）
 * 富文本編輯器在留空時常會輸出 <p></p>
 */
export const isRichTextEmpty = (html?: string): boolean => {
  if (!html) return true;
  const text = html
    .replace(/<style[\s\S]*?<\/style>/gi, "")
    .replace(/<script[\s\S]*?<\/script>/gi, "")
    .replace(/<[^>]*>/g, " ")
    .replace(/&nbsp;/g, " ")
    .trim();
  return text.length === 0;
};
