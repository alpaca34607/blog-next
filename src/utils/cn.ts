/**
 * 类名合并工具函数
 * 用于合并多个类名，过滤掉 falsy 值
 */
export function cn(
  ...classes: (string | boolean | undefined | null)[]
): string {
  return classes.filter(Boolean).join(" ");
}
