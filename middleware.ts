import createMiddleware from "next-intl/middleware";
import { routing } from "./src/routing";
import { type NextRequest, NextResponse } from "next/server";

const intlMiddleware = createMiddleware(routing);

export default function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // 後台、API、文件路由直接放行，不套用語系前綴導向
  if (
    pathname.startsWith("/admin") ||
    pathname.startsWith("/login") ||
    pathname.startsWith("/api") ||
    pathname.startsWith("/docs")
  ) {
    return NextResponse.next();
  }

  return intlMiddleware(request);
}

export const config = {
  // 排除 _next 內部路由與含副檔名的靜態資源（圖片、字型等）
  matcher: ["/((?!_next|.*\\..*).*)"],
};
