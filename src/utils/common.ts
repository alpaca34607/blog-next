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
