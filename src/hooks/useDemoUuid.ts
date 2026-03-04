"use client";

import { useSearchParams } from "next/navigation";

/**
 * 從 URL 取得 DEMO 預覽用的 UUID（?UUID=xxx）
 * 用於前台合併 DEMO 資料時傳給公開 API
 */
export function useDemoUuid(): string | undefined {
  const searchParams = useSearchParams();
  const uuid = searchParams.get("UUID") || searchParams.get("uuid") || undefined;
  return uuid || undefined;
}
