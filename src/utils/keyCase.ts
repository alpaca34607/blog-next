/**
 * 將物件內的 snake_case key 深度轉換為 camelCase。
 * - 僅轉換「包含底線」的 key
 * - 保留以底線開頭的特殊 key（例如：_meta）
 */
export function deepSnakeToCamel<T = any>(value: T): any {
  const snakeKeyToCamel = (key: string) => {
    if (!key.includes("_")) return key;
    if (key.startsWith("_")) return key;
    return key.replace(/_([a-z0-9])/g, (_, c) => String(c).toUpperCase());
  };

  const isPlainObject = (v: any) =>
    v !== null &&
    typeof v === "object" &&
    !Array.isArray(v) &&
    Object.prototype.toString.call(v) === "[object Object]";

  if (Array.isArray(value)) {
    return value.map((v) => deepSnakeToCamel(v));
  }

  if (isPlainObject(value)) {
    const out: Record<string, any> = {};
    for (const [k, v] of Object.entries(value as any)) {
      out[snakeKeyToCamel(k)] = deepSnakeToCamel(v);
    }
    return out;
  }

  return value as any;
}
