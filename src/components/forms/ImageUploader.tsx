"use client";

import { useRef, ReactNode } from "react";
import { FiUpload } from "react-icons/fi";
import Swal from "sweetalert2";
import styles from "./ImageUploader.module.scss";
import { tryFetch } from "@/app/api/api_client";

interface ImageUploaderProps {
  onUpload: (url: string) => void;
  onMultipleUpload?: (urls: string[]) => void;
  maxSize?: number; // 最大檔案大小（位元組），預設 5MB
  accept?: string; // 接受的檔案類型，預設 "image/*"
  multiple?: boolean; // 是否支援多檔案上傳
  buttonLabel?: string; // 按鈕文字
  showButton?: boolean; // 是否顯示按鈕，預設 true
  className?: string; // 自訂樣式類別
  children?: ReactNode; // 自訂按鈕內容
}

type UploadFileResult = {
  filename: string;
  url: string;
  size: number;
  mimeType: string;
};
type UploadApiResponseData = UploadFileResult | { files: UploadFileResult[] };

const ImageUploader = ({
  onUpload,
  onMultipleUpload,
  maxSize = 5 * 1024 * 1024, // 預設 5MB
  accept = "image/*",
  multiple = false,
  buttonLabel = "上傳圖片",
  showButton = true,
  className,
  children,
}: ImageUploaderProps) => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const uploadImages = async (files: File[]): Promise<string[]> => {
    const formData = new FormData();

    // 後端同時支援單檔（file）與多檔（files）欄位
    if (files.length === 1) {
      formData.append("file", files[0]);
    } else {
      files.forEach((f) => formData.append("files", f));
    }

    const res = await tryFetch<UploadApiResponseData>("/api/upload", {
      method: "POST",
      body: formData,
      withAuth: true,
    });

    if (!res.success) {
      throw new Error(res.error?.message || "上傳失敗");
    }

    const data = res.data as any;
    if (data && typeof data === "object") {
      if (typeof data.url === "string") return [data.url];
      if (Array.isArray(data.files)) {
        const urls = data.files
          .map((x: any) => x?.url)
          .filter((x: any) => typeof x === "string");
        if (urls.length) return urls;
      }
    }

    throw new Error("上傳回應格式不正確");
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);

    if (files.length === 0) return;

    // 檢查檔案大小和類型
    for (const file of files) {
      if (maxSize && file.size > maxSize) {
        Swal.fire({
          icon: "warning",
          title: "圖片大小超過限制",
          text: `圖片大小不能超過 ${(maxSize / 1024 / 1024).toFixed(0)}MB`,
          confirmButtonText: "確定",
          confirmButtonColor: "#ffaa00",
        });
        return;
      }

      if (accept && !file.type.match(accept.replace("*", ".*"))) {
        Swal.fire({
          icon: "warning",
          title: "檔案類型錯誤",
          text: "請選擇正確的圖片檔案",
          confirmButtonText: "確定",
          confirmButtonColor: "#ffaa00",
        });
        return;
      }
    }

    try {
      Swal.fire({
        title: "圖片上傳中...",
        text: "請稍候",
        allowOutsideClick: false,
        allowEscapeKey: false,
        didOpen: () => Swal.showLoading(),
      });

      const urls = await uploadImages(multiple ? files : [files[0]]);

      Swal.close();

      if (multiple) {
        if (!onMultipleUpload) {
          console.warn(
            "ImageUploader: multiple 為 true 但未提供 onMultipleUpload 回調函數"
          );
          return;
        }
        onMultipleUpload(urls);
      } else {
        onUpload(urls[0]);
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : "請重試";
      Swal.fire({
        icon: "error",
        title: "圖片上傳失敗",
        text: message,
        confirmButtonText: "確定",
        confirmButtonColor: "#ffaa00",
      });
      return;
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
        multiple={multiple}
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
              <FiUpload size={24} />
              {buttonLabel && <span>{buttonLabel}</span>}
            </>
          )}
        </button>
      )}
    </>
  );
};

export default ImageUploader;
