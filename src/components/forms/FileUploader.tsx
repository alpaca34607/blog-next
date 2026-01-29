"use client";

import { useRef, ReactNode } from "react";
import { FiUpload, FiFileText } from "react-icons/fi";
import styles from "./FileUploader.module.scss";

interface FileUploaderProps {
  onUpload: (file: {
    fileUrl: string; // base64 或 URL
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

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // 檢查檔案大小
    if (maxSize && file.size > maxSize) {
      alert(`檔案大小不能超過 ${(maxSize / 1024 / 1024).toFixed(0)}MB`);
      return;
    }

    // 計算檔案大小
    const fileSize = formatFileSize(file.size);

    // 將檔案轉換為 base64（臨時方案，之後可替換為實際的檔案上傳 API）
    const reader = new FileReader();
    reader.onloadend = () => {
      onUpload({
        fileUrl: reader.result as string, // 儲存 base64 資料
        fileName: file.name, // 儲存檔案名稱
        fileSize: fileSize, // 自動計算檔案大小
        fileType: file.type, // 儲存檔案類型
      });
    };
    reader.onerror = () => {
      alert("檔案讀取失敗，請重試");
    };
    reader.readAsDataURL(file);

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
