"use client";

import { useState, useEffect, useCallback } from "react";
import { getDemoToken, getAuthToken } from "@/utils/common";

interface UseDemoModeReturn {
  /* 目前是否為 DEMO 訪客模式 */
  isDemoMode: boolean;
  /* 判斷某筆資料是否在 DEMO 模式下為唯讀，
  規則：DEMO 訪客 + 該筆資料的 demoWorkspaceId 為空字串 */
  isItemReadOnly: (item: { demoWorkspaceId?: string | null }) => boolean;
}



/*
  目前是否為 DEMO 訪客模式，
  規則：有 demo token 且無 admin token
  使用 useState + useEffect 確保 SSR 安全（避免 hydration 錯誤）
 */
export function useDemoMode(): UseDemoModeReturn {
  const [isDemoMode, setIsDemoMode] = useState(false);

  useEffect(() => {
    setIsDemoMode(!!getDemoToken().token && !getAuthToken().token);
  }, []);

  /* 判斷某筆資料是否在 DEMO 模式下為唯讀，
  規則：DEMO 訪客 + 該筆資料的 demoWorkspaceId 為空字串 */
  const isItemReadOnly = useCallback(
    (item: { demoWorkspaceId?: string | null }) =>
      isDemoMode && (item.demoWorkspaceId ?? "") === "",
    [isDemoMode],
  );

  return { isDemoMode, isItemReadOnly };
}
