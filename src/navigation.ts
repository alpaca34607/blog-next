import { createNavigation } from "next-intl/navigation";
import { routing } from "./routing";

// locale-aware 版本的 Link、redirect、usePathname、useRouter
// 使用這些取代 next/link 與 next/navigation，連結會自動帶上語系前綴
export const { Link, redirect, usePathname, useRouter } =
  createNavigation(routing);

// 仍匯出 locales 供其他地方使用
export const { locales, defaultLocale } = routing;
