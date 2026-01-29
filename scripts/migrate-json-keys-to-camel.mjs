import { PrismaClient } from "@prisma/client";

/**
 * 將 snake_case key 轉為 camelCase（僅針對含底線的 key）
 * 例：publish_date -> publishDate
 */
function snakeKeyToCamel(key) {
  if (typeof key !== "string") return key;
  if (!key.includes("_")) return key;
  if (key.startsWith("_")) return key; // 保留特殊 key（例如 _meta）

  return key.replace(/_([a-z0-9])/g, (_, c) => String(c).toUpperCase());
}

function isPlainObject(v) {
  return (
    v !== null &&
    typeof v === "object" &&
    !Array.isArray(v) &&
    Object.prototype.toString.call(v) === "[object Object]"
  );
}

function deepConvertKeysToCamel(value) {
  if (Array.isArray(value)) {
    return value.map(deepConvertKeysToCamel);
  }
  if (isPlainObject(value)) {
    const out = {};
    for (const [k, v] of Object.entries(value)) {
      out[snakeKeyToCamel(k)] = deepConvertKeysToCamel(v);
    }
    return out;
  }
  return value;
}

const prisma = new PrismaClient();

async function main() {
  let sectionUpdated = 0;
  let configUpdated = 0;

  const sections = await prisma.section.findMany({
    select: { id: true, settings: true },
  });

  for (const s of sections) {
    if (!s.settings) continue;
    const next = deepConvertKeysToCamel(s.settings);
    if (JSON.stringify(next) !== JSON.stringify(s.settings)) {
      await prisma.section.update({
        where: { id: s.id },
        data: { settings: next },
      });
      sectionUpdated += 1;
    }
  }

  const configs = await prisma.appConfig.findMany({
    select: { key: true, value: true },
  });

  for (const c of configs) {
    if (!c.value) continue;
    const next = deepConvertKeysToCamel(c.value);
    if (JSON.stringify(next) !== JSON.stringify(c.value)) {
      await prisma.appConfig.update({
        where: { key: c.key },
        data: { value: next },
      });
      configUpdated += 1;
    }
  }

  console.log(
    `Done. Updated sections: ${sectionUpdated}, app_config: ${configUpdated}`
  );
}

main()
  .catch((e) => {
    console.error(e);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

