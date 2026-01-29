"use client";
import { Suspense } from "react";
import AdminLayout from "@/components/Backend/AdminLayout";
import PagePreview from "@/components/Backend/PageManager/PagePreview";

export default function PreviewPage() {
  return (
    <AdminLayout>
      <Suspense fallback={<div>載入中...</div>}>
        <PagePreview />
      </Suspense>
    </AdminLayout>
  );
}
