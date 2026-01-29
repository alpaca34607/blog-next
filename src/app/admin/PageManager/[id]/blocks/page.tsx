"use client";
import { use } from "react";
import AdminLayout from "@/components/Backend/AdminLayout";
import SectionEditor from "@/components/Backend/PageManager/SectionEditor";

interface SectionEditorPageProps {
  params: Promise<{
    id: string;
  }>;
}

export default function SectionEditorPage({ params }: SectionEditorPageProps) {
  const { id } = use(params);

  return (
    <AdminLayout>
      <SectionEditor pageId={id} />
    </AdminLayout>
  );
}
