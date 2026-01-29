import { NextRequest, NextResponse } from "next/server";
import { successResponse, errorResponse } from "@/lib/api-response";

const COOKIE_NAME = "selectedLang";
const ALLOWED = new Set(["zh", "en"]);

// GET /api/preferences/language - 取得語系偏好（以 cookie 儲存）
export async function GET(request: NextRequest) {
  try {
    const lang = request.cookies.get(COOKIE_NAME)?.value;
    const safeLang = ALLOWED.has(lang || "") ? (lang as "zh" | "en") : "zh";
    return NextResponse.json(successResponse({ lang: safeLang }));
  } catch (e) {
    return NextResponse.json(
      errorResponse("INTERNAL_ERROR", "取得語系偏好失敗", 500)
    );
  }
}

// POST /api/preferences/language - 設定語系偏好（以 cookie 儲存）
export async function POST(request: NextRequest) {
  try {
    const body = await request.json().catch(() => ({}));
    const lang = typeof body?.lang === "string" ? body.lang : "";
    if (!ALLOWED.has(lang)) {
      return NextResponse.json(
        errorResponse("BAD_REQUEST", "不支援的語系", 400)
      );
    }

    const res = NextResponse.json(successResponse({ lang }));
    res.cookies.set(COOKIE_NAME, lang, {
      path: "/",
      sameSite: "lax",
      httpOnly: false,
      maxAge: 60 * 60 * 24 * 365, // 1 年
    });
    return res;
  } catch (e) {
    return NextResponse.json(
      errorResponse("INTERNAL_ERROR", "設定語系偏好失敗", 500)
    );
  }
}
