import { defineRouting } from "next-intl/routing";

// 集中定義所有語系路由設定，供 middleware、navigation、i18n 共用
export const routing = defineRouting({
  locales: ["zh", "en"],
  defaultLocale: "zh",
  localePrefix: "always",
});

export type Locale = (typeof routing.locales)[number];
