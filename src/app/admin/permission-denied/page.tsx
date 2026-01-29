 "use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Swal from "sweetalert2";
import AdminLayout from "@/components/Backend/AdminLayout";
import { clearAuthToken } from "@/utils/common";

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
        title: "權限不足",
        text:
          detail?.message ||
          "你目前沒有權限存取此後台功能，請重新登入或聯絡管理員。",
        icon: "warning",
        showCancelButton: true,
        confirmButtonText: "重新登入",
        cancelButtonText: "回到首頁",
        allowOutsideClick: false,
        allowEscapeKey: true,
      });

      if (result.isConfirmed) {
        // 登出：清除前端保存的 token，並導回登入頁
        clearAuthToken();
        router.replace("/login");
        return;
      }

      router.replace("/");
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
          權限不足
        </h1>
        <p style={{ opacity: 0.9 }}>
          你目前沒有權限存取此後台功能，請重新登入或聯絡管理員。
        </p>
      </div>
    </AdminLayout>
  );
}

