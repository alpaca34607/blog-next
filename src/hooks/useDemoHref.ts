"use client";

import { useCallback } from "react";
import { useDemoUuid } from "./useDemoUuid";

/**
 * 前台導覽用：取得 href 轉換函式，在 DEMO 模式下自動附加 ?UUID=xxx。
 * - 站內路徑（/xxx）：附加 UUID
 * - 外部連結（http / //）或純 hash（#）：維持原樣不處理
 * - 若 URL 中沒有 UUID（非 DEMO 模式）：維持原樣
 */
export function useDemoHref(): (href: string) => string {
  const demoUuid = useDemoUuid();

  return useCallback(
    (href: string): string => {
      if (!demoUuid) return href;
      if (href.startsWith("http") || href.startsWith("//") || href === "#")
        return href;
      const separator = href.includes("?") ? "&" : "?";
      return `${href}${separator}UUID=${demoUuid}`;
    },
    [demoUuid]
  );
}
