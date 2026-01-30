/**
 * 在 RDS MySQL 上建立資料庫（不需本機安裝 MySQL）
 * 使用方式：node scripts/create-database.mjs
 */

import { createConnection } from "mysql2/promise";
import { readFileSync } from "fs";
import { resolve } from "path";

// 從 .env 讀取 DATABASE_URL（支援雙引號、單引號或無引號）
function loadEnv() {
  const envPath = resolve(process.cwd(), ".env");
  const content = readFileSync(envPath, "utf-8");
  for (const line of content.split("\n")) {
    const quoted = line.match(/^DATABASE_URL\s*=\s*"([^"]*)"\s*$/) || line.match(/^DATABASE_URL\s*=\s*'([^']*)'\s*$/);
    if (quoted) return quoted[1].trim();
    const unquoted = line.match(/^DATABASE_URL\s*=\s*(\S+)\s*$/);
    if (unquoted) return unquoted[1].trim();
  }
  throw new Error("找不到 .env 中的 DATABASE_URL");
}

// 解析 MySQL URL：mysql://user:password@host:port/database
function parseDatabaseUrl(url) {
  const u = new URL(url.replace(/^mysql:\/\//, "http://"));
  return {
    host: u.hostname,
    port: parseInt(u.port || "3306", 10),
    user: decodeURIComponent(u.username),
    password: decodeURIComponent(u.password),
    database: u.pathname ? u.pathname.slice(1) : "blogcraft-dev",
  };
}

async function main() {
  const url = loadEnv();
  const { host, port, user, password, database } = parseDatabaseUrl(url);

  console.log(`連線到 ${host}:${port} ...`);
  // 不指定 database，才能連到伺服器後建立新資料庫
  const conn = await createConnection({
    host,
    port,
    user,
    password,
  });

  try {
    await conn.query(
      `CREATE DATABASE IF NOT EXISTS \`${database}\` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci`
    );
    console.log(`資料庫 \`${database}\` 已存在或已建立成功。`);
  } finally {
    await conn.end();
  }
}

main().catch((err) => {
  console.error("錯誤:", err.message);
  process.exit(1);
});
