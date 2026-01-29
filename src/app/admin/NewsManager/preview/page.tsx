"use client";
import { Suspense } from "react";
import AdminLayout from "@/components/Backend/AdminLayout";
import NewsPreview from "@/components/Backend/NewsManager/NewsPreview";

export default function NewsPreviewPage() {
  return (
    <AdminLayout>
      <Suspense fallback={<div>載入中...</div>}>
        <NewsPreview />
      </Suspense>
    </AdminLayout>
  );
}

