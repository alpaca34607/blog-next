-- =============================================================================
-- DEMO 訪客工作區：僅新增表與欄位，既有資料設為 demoWorkspaceId=''（正式）
-- 執行前請先備份資料庫。
-- =============================================================================

-- 1. 建立 demo_workspaces 表（用於 24h 清理）
CREATE TABLE IF NOT EXISTS `demo_workspaces` (
  `id` VARCHAR(191) NOT NULL,
  `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- -----------------------------------------------------------------------------
-- 2. navigation：新增 demoWorkspaceId
-- -----------------------------------------------------------------------------
ALTER TABLE `navigation` ADD COLUMN `demoWorkspaceId` VARCHAR(36) NOT NULL DEFAULT '';

CREATE INDEX `navigation_demoWorkspaceId_idx` ON `navigation`(`demoWorkspaceId`);

-- -----------------------------------------------------------------------------
-- 3. pages：新增 demoWorkspaceId，改唯一鍵為 (slug, demoWorkspaceId)
-- 若 DROP INDEX 報錯，請執行 SHOW INDEX FROM pages; 依實際索引名稱改寫
-- -----------------------------------------------------------------------------
ALTER TABLE `pages` ADD COLUMN `demoWorkspaceId` VARCHAR(36) NOT NULL DEFAULT '';

-- 既有 slug 唯一鍵：Prisma 常用 pages_slug_key，MySQL 可能為 slug
ALTER TABLE `pages` DROP INDEX `pages_slug_key`;

CREATE UNIQUE INDEX `pages_slug_demoWorkspaceId_key` ON `pages`(`slug`, `demoWorkspaceId`);
CREATE INDEX `pages_demoWorkspaceId_idx` ON `pages`(`demoWorkspaceId`);

-- -----------------------------------------------------------------------------
-- 4. news：同上
-- -----------------------------------------------------------------------------
ALTER TABLE `news` ADD COLUMN `demoWorkspaceId` VARCHAR(36) NOT NULL DEFAULT '';

ALTER TABLE `news` DROP INDEX `news_slug_key`;

CREATE UNIQUE INDEX `news_slug_demoWorkspaceId_key` ON `news`(`slug`, `demoWorkspaceId`);
CREATE INDEX `news_demoWorkspaceId_idx` ON `news`(`demoWorkspaceId`);
