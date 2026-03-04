"use client";

import { useRef, ReactNode } from "react";
import { FiUpload } from "react-icons/fi";
import Swal from "sweetalert2";
import styles from "./FileUploader.module.scss";
import { accentOrange } from "@/styles/theme";
import { tryFetch } from "@/app/api/api_client";

interface FileUploaderProps {
  onUpload: (file: {
    fileUrl: string;
    fileName: string;
    fileSize: string;
    fileType: string;
  }) => void;
  maxSize?: number; // 最大檔案大小（位元組），預設 10MB
  accept?: string; // 接受的檔案類型
  buttonLabel?: string; // 按鈕文字
  showButton?: boolean; // 是否顯示按鈕，預設 true
  className?: string; // 自訂樣式類別
  children?: ReactNode; // 自訂按鈕內容
}

// 格式化檔案大小
const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return "0 Bytes";
  const k = 1024;
  const sizes = ["Bytes", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + " " + sizes[i];
};

type UploadApiResponseData = {
  filename: string;
  url: string;
  size: number;
  mimeType: string;
};

const FileUploader = ({
  onUpload,
  maxSize = 10 * 1024 * 1024, // 預設 10MB
  accept = ".pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.zip,.rar,.txt,.jpg,.jpeg,.png,.gif",
  buttonLabel = "選擇檔案上傳",
  showButton = true,
  className,
  children,
}: FileUploaderProps) => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (maxSize && file.size > maxSize) {
      Swal.fire({
        icon: "warning",
        title: "檔案大小超過限制",
        text: `檔案大小不能超過 ${(maxSize / 1024 / 1024).toFixed(0)}MB`,
        confirmButtonText: "確定",
        confirmButtonColor: accentOrange,
      });
      return;
    }

    try {
      Swal.fire({
        title: "檔案上傳中...",
        text: "請稍候",
        allowOutsideClick: false,
        allowEscapeKey: false,
        didOpen: () => Swal.showLoading(),
      });

      const uploadData = new FormData();
      uploadData.append("file", file);

      const res = await tryFetch<UploadApiResponseData>("/api/upload", {
        method: "POST",
        body: uploadData,
        withAuth: true,
      });

      Swal.close();

      if (!res.success) {
        throw new Error((res.error as any)?.message || "上傳失敗");
      }

      const fileUrl = (res.data as any)?.url;
      if (!fileUrl) throw new Error("上傳回應格式不正確");

      onUpload({
        fileUrl,
        fileName: file.name,
        fileSize: formatFileSize(file.size),
        fileType: file.type,
      });
    } catch (err) {
      const message = err instanceof Error ? err.message : "請重試";
      Swal.fire({
        icon: "error",
        title: "檔案上傳失敗",
        text: message,
        confirmButtonText: "確定",
        confirmButtonColor: accentOrange,
      });
    }

    // 重置 input，以便可以再次選擇同一檔案
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleClick = () => {
    fileInputRef.current?.click();
  };

  return (
    <>
      <input
        type="file"
        ref={fileInputRef}
        accept={accept}
        style={{ display: "none" }}
        onChange={handleFileChange}
      />
      {showButton && (
        <button
          type="button"
          onClick={handleClick}
          className={`${styles.uploadButton} ${className || ""}`}
          title={buttonLabel}
        >
          {children || (
            <>
              <FiUpload size={16} />
              {buttonLabel && <span>{buttonLabel}</span>}
            </>
          )}
        </button>
      )}
    </>
  );
};

export default FileUploader;
