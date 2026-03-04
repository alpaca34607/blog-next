 "use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Swal from "sweetalert2";
import AdminLayout from "@/components/Backend/AdminLayout";
import { accentOrange } from "@/styles/theme";
import { clearAuthToken } from "@/utils/common";
import { routing } from "@/routing";

type AdminPermissionDeniedDetail = {
  code?: string;
  message?: string;
  status?: number;
  url?: string;
};

export default function PermissionDeniedPage() {
  const router = useRouter();
  const [hasShown, setHasShown] = useState(false);

  useEffect(() => {
    if (hasShown) return;
    setHasShown(true);

    let detail: AdminPermissionDeniedDetail = {};
    try {
      const raw = sessionStorage.getItem("admin:permissionDeniedDetail");
      if (raw) detail = JSON.parse(raw);
      sessionStorage.removeItem("admin:permissionDeniedDetail");
    } catch {
      // 忽略：解析失敗時改用預設訊息即可
    }

    (async () => {
      const result = await Swal.fire({
        title: "您無權限執行此操作",
        icon: "warning",
        showCancelButton: true,
        confirmButtonText: "重新登入",
        cancelButtonText: "回到首頁",
        confirmButtonColor: accentOrange,
        allowOutsideClick: false,
        allowEscapeKey: true,
      });

      if (result.isConfirmed) {
        // 登出：清除前端保存的 token，並導回登入頁（須帶語言前綴）
        clearAuthToken();
        router.replace(`/${routing.defaultLocale}/login`);
        return;
      }

      router.replace(`/${routing.defaultLocale}/`);
    })();
  }, [hasShown, router]);

  return (
    <AdminLayout>
      {/* 
        此頁面主要用途是提供可被導向/刷新/分享的 URL，
        實際提示交由 SweetAlert2 顯示。 
      */}
      <div style={{ padding: 24 }}>
        <h1 style={{ fontSize: 20, fontWeight: 700, marginBottom: 8 }}>
          您無權限執行此操作
        </h1>
      </div>
    </AdminLayout>
  );
}

