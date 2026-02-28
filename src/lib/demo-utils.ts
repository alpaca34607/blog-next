import type { AuthenticatedRequest } from "./auth-middleware";

/** 正式資料的 demoWorkspaceId 值 */
export const OFFICIAL_WORKSPACE_ID = "";

/**
 * 取得當前工作區篩選條件。
 * 管理員：正式資料（demoWorkspaceId = ""）；訪客：僅該 DEMO 工作區。
 */
export function getWorkspaceFilter(req: AuthenticatedRequest): { demoWorkspaceId: string } {
  return {
    demoWorkspaceId: req.demoWorkspaceId ?? OFFICIAL_WORKSPACE_ID,
  };
}

/**
 * 取得列表查詢時的工作區篩選條件。
 * 管理員：僅正式資料；DEMO 訪客：正式 + DEMO 合併，讓訪客看到完整網站架構。
 */
export function getWorkspaceFilterForList(
  req: AuthenticatedRequest
): { demoWorkspaceId: string } | { demoWorkspaceId: { in: string[] } } {
  if (req.demoWorkspaceId) {
    return { demoWorkspaceId: { in: [OFFICIAL_WORKSPACE_ID, req.demoWorkspaceId] } };
  }
  return getWorkspaceFilter(req);
}

/** 是否為 DEMO 訪客模式 */
export function isDemoMode(req: AuthenticatedRequest): boolean {
  return !!req.demoWorkspaceId;
}
