"use client";

import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";

import { TextStyle } from "@tiptap/extension-text-style";
import Color from "@tiptap/extension-color";
import TextAlign from "@tiptap/extension-text-align";
import Link from "@tiptap/extension-link";
import Image from "@tiptap/extension-image";
import Highlight from "@tiptap/extension-highlight";

import { useEffect, useState, useRef } from "react";

import { FiUpload } from "react-icons/fi";

import { FiLink } from "react-icons/fi";
import Swal from "sweetalert2";
import styles from "./RichTextEditor.module.scss";
import { accentOrange } from "@/styles/theme";
import { tryFetch } from "@/app/api/api_client";

interface RichTextEditorProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
}

const RichTextEditor = ({
  value,
  onChange,
  placeholder = "輸入內容...",
}: RichTextEditorProps) => {
  const [mounted, setMounted] = useState(false);
  const [highlightColor, setHighlightColor] = useState("#ffff00");
  const fileInputRef = useRef<HTMLInputElement>(null);

  type UploadFileResult = {
    filename: string;
    url: string;
    size: number;
    mimeType: string;
  };

  const uploadImage = async (file: File): Promise<string> => {
    const formData = new FormData();
    formData.append("file", file);

    const res = await tryFetch<UploadFileResult>("/api/upload", {
      method: "POST",
      body: formData,
      withAuth: true,
    });

    if (!res.success) {
      throw new Error(res.error?.message || "圖片上傳失敗");
    }

    if (!res.data || typeof res.data.url !== "string") {
      throw new Error("圖片上傳回應格式不正確");
    }

    return res.data.url;
  };

  useEffect(() => {
    setMounted(true);
  }, []);

  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        heading: {
          levels: [1, 2, 3, 4, 5, 6],
        },
      }),
      TextStyle,
      Color,
      Highlight.configure({
        multicolor: true,
      }),
      TextAlign.configure({
        types: ["heading", "paragraph"],
      }),
      Link.configure({
        openOnClick: false,
        HTMLAttributes: {
          class: "rich-text-link",
        },
      }),
      Image.configure({
        inline: true,
        allowBase64: true,
      }),
    ],
    content: value,
    onUpdate: ({ editor }) => {
      onChange(editor.getHTML());
    },

    editorProps: {
      attributes: {
        class: styles.editorContent,
        "data-placeholder": placeholder,
      },
    },

    immediatelyRender: false,
  });

  // 當外部 value 改變時更新編輯器內容
  useEffect(() => {
    if (editor && value !== editor.getHTML()) {
      editor.commands.setContent(value || "");
    }
  }, [value, editor]);

  // 獲取當前選中文字的背景顏色
  useEffect(() => {
    if (!editor) return;

    const updateHighlightColor = () => {
      const attrs = editor.getAttributes("highlight");

      if (attrs.color) {
        setHighlightColor(attrs.color);
      }
    };

    editor.on("selectionUpdate", updateHighlightColor);
    editor.on("transaction", updateHighlightColor);

    return () => {
      editor.off("selectionUpdate", updateHighlightColor);
      editor.off("transaction", updateHighlightColor);
    };
  }, [editor]);

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];

    if (file) {
      // 檢查檔案大小（限制為 5MB）
      if (file.size > 5 * 1024 * 1024) {
        Swal.fire({
          icon: "warning",
          title: "圖片大小超過限制",
          text: "圖片大小不能超過 5MB",
          confirmButtonText: "確定",
          confirmButtonColor: accentOrange,
        });
        return;
      }

      // 檢查檔案類型
      if (!file.type.startsWith("image/")) {
        Swal.fire({
          icon: "warning",
          title: "檔案類型錯誤",
          text: "請選擇圖片檔案",
          confirmButtonText: "確定",
          confirmButtonColor: accentOrange,
        });
        return;
      }

      try {
        Swal.fire({
          title: "圖片上傳中...",
          text: "請稍候",
          allowOutsideClick: false,
          allowEscapeKey: false,
          didOpen: () => Swal.showLoading(),
        });

        const url = await uploadImage(file);
        Swal.close();

        if (editor) {
          editor
            .chain()
            .focus()
            .setImage({
              src: url,
            })
            .run();
        }
      } catch (err) {
        const message = err instanceof Error ? err.message : "請重試";
        Swal.fire({
          icon: "error",
          title: "圖片上傳失敗",
          text: message,
          confirmButtonText: "確定",
          confirmButtonColor: accentOrange,
        });
        return;
      }
    }

    // 重置 input，以便可以再次選擇同一檔案
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  if (!mounted || !editor) {
    return (
      <div className={styles.editorWrapper}>
        <div className={styles.editorPlaceholder}>載入編輯器...</div>
      </div>
    );
  }

  return (
    <div className={styles.editorWrapper}>
      {/* 工具欄 */}
      <div className={styles.toolbar}>
        {/* 標題 */}
        <div className={styles.toolbarGroup}>
          <select
            onChange={(e) => {
              const value = e.target.value;

              if (value === "paragraph") {
                editor.chain().focus().setParagraph().run();
              } else {
                editor
                  .chain()
                  .focus()
                  .toggleHeading({
                    level: parseInt(value) as 1 | 2 | 3 | 4 | 5 | 6,
                  })
                  .run();
              }
            }}
            value={
              editor.isActive("heading", {
                level: 1,
              })
                ? "1"
                : editor.isActive("heading", {
                    level: 2,
                  })
                ? "2"
                : editor.isActive("heading", {
                    level: 3,
                  })
                ? "3"
                : editor.isActive("heading", {
                    level: 4,
                  })
                ? "4"
                : editor.isActive("heading", {
                    level: 5,
                  })
                ? "5"
                : editor.isActive("heading", {
                    level: 6,
                  })
                ? "6"
                : "paragraph"
            }
            className={styles.toolbarSelect}
          >
            <option value="paragraph">段落</option>
            <option value="1">標題 1</option> <option value="2">標題 2</option>
            <option value="3">標題 3</option> <option value="4">標題 4</option>
            <option value="5">標題 5</option> <option value="6">標題 6</option>
          </select>
        </div>
        <div className={styles.toolbarDivider} /> {/* 文字樣式 */}
        <div className={styles.toolbarGroup}>
          <button
            type="button"
            onClick={() => editor.chain().focus().toggleBold().run()}
            className={`${styles.toolbarButton}

      ${editor.isActive("bold") ? styles.toolbarButtonActive : ""}

      `}
            title="粗體"
          >
            <strong>B</strong>
          </button>
          <button
            type="button"
            onClick={() => editor.chain().focus().toggleItalic().run()}
            className={`${styles.toolbarButton}

      ${editor.isActive("italic") ? styles.toolbarButtonActive : ""}

      `}
            title="斜體"
          >
            <em>I</em>
          </button>
          <button
            type="button"
            onClick={() => editor.chain().focus().toggleUnderline().run()}
            className={`${styles.toolbarButton}

      ${editor.isActive("underline") ? styles.toolbarButtonActive : ""}

      `}
            title="底線"
          >
            <u>U</u>
          </button>
          <button
            type="button"
            onClick={() => editor.chain().focus().toggleStrike().run()}
            className={`${styles.toolbarButton}

      ${editor.isActive("strike") ? styles.toolbarButtonActive : ""}

      `}
            title="刪除線"
          >
            <s>S</s>
          </button>
        </div>
        <div className={styles.toolbarDivider} /> {/* 列表 */}
        <div className={styles.toolbarGroup}>
          <button
            type="button"
            onClick={() => editor.chain().focus().toggleBulletList().run()}
            className={`${styles.toolbarButton}

      ${editor.isActive("bulletList") ? styles.toolbarButtonActive : ""}

      `}
            title="無序列表"
          >
            • 列表
          </button>
          <button
            type="button"
            onClick={() => editor.chain().focus().toggleOrderedList().run()}
            className={`${styles.toolbarButton}

      ${editor.isActive("orderedList") ? styles.toolbarButtonActive : ""}

      `}
            title="有序列表"
          >
            1. 列表
          </button>
        </div>
        <div className={styles.toolbarDivider} /> {/* 對齊 */}
        <div className={styles.toolbarGroup}>
          <button
            type="button"
            onClick={() => editor.chain().focus().setTextAlign("left").run()}
            className={`${styles.toolbarButton}

      ${
        editor.isActive({
          textAlign: "left",
        })
          ? styles.toolbarButtonActive
          : ""
      }

      `}
            title="左對齊"
          >
            ⬅
          </button>
          <button
            type="button"
            onClick={() => editor.chain().focus().setTextAlign("center").run()}
            className={`${styles.toolbarButton}

      ${
        editor.isActive({
          textAlign: "center",
        })
          ? styles.toolbarButtonActive
          : ""
      }

      `}
            title="置中"
          >
            ⬌
          </button>
          <button
            type="button"
            onClick={() => editor.chain().focus().setTextAlign("right").run()}
            className={`${styles.toolbarButton}

      ${
        editor.isActive({
          textAlign: "right",
        })
          ? styles.toolbarButtonActive
          : ""
      }

      `}
            title="右對齊"
          >
            ➡
          </button>
        </div>
        <div className={styles.toolbarDivider} /> {/* 顏色 */}
        <div className={styles.toolbarGroup}>
          <input
            type="color"
            onChange={(e) =>
              editor.chain().focus().setColor(e.target.value).run()
            }
            className={styles.colorPicker}
            title="文字顏色"
          />
          <div className={styles.colorPickerWrapper}>
            <input
              type="color"
              value={highlightColor}
              onChange={(e) => {
                const color = e.target.value;
                setHighlightColor(color);

                if (editor.isActive("highlight")) {
                  // 如果已經有背景顏色，更新它
                  editor
                    .chain()
                    .focus()
                    .toggleHighlight({
                      color,
                    })
                    .run();
                } else {
                  // 如果沒有背景顏色，添加它
                  editor
                    .chain()
                    .focus()
                    .toggleHighlight({
                      color,
                    })
                    .run();
                }
              }}
              className={styles.colorPicker}
              title="背景顏色"
            />
            <button
              type="button"
              onClick={() => {
                if (editor.isActive("highlight")) {
                  editor.chain().focus().unsetHighlight().run();
                } else {
                  editor
                    .chain()
                    .focus()
                    .toggleHighlight({
                      color: highlightColor,
                    })
                    .run();
                }
              }}
              className={`${styles.toolbarButton}

      ${editor.isActive("highlight") ? styles.toolbarButtonActive : ""}

      `}
              title={
                editor.isActive("highlight") ? "移除背景顏色" : "應用背景顏色"
              }
            >
              🎨
            </button>
          </div>
        </div>
        <div className={styles.toolbarDivider} /> {/* 連結和圖片 */}
        <div className={styles.toolbarGroup}>
          <button
            type="button"
            onClick={async () => {
              // 檢查是否已有連結，如果有則取得現有連結網址
              const existingLink = editor.getAttributes("link");
              const currentUrl = existingLink.href || "";

              const { value: url } = await Swal.fire({
                title: "插入連結",
                input: "text",
                inputLabel: "請輸入連結網址",
                inputPlaceholder: "例如: https://example.com",
                inputValue: currentUrl,
                showCancelButton: true,
                confirmButtonText: "確定",
                cancelButtonText: "取消",
                confirmButtonColor: accentOrange,
                cancelButtonColor: "#6c757d",
                inputValidator: (value) => {
                  if (!value) {
                    return "請輸入連結網址";
                  }
                  // 簡單的 URL 驗證
                  try {
                    new URL(value);
                  } catch {
                    // 如果不是完整 URL，允許相對路徑或簡單的網址
                    if (
                      !value.startsWith("/") &&
                      !value.startsWith("#") &&
                      !value.startsWith("mailto:") &&
                      !value.startsWith("tel:")
                    ) {
                      // 嘗試加上 https:// 來驗證
                      try {
                        new URL(`https://${value}`);
                      } catch {
                        return "請輸入有效的連結網址";
                      }
                    }
                  }
                  return null;
                },
              });

              if (url) {
                // 確保 URL 格式正確
                let finalUrl = url.trim();
                if (
                  !finalUrl.startsWith("http://") &&
                  !finalUrl.startsWith("https://") &&
                  !finalUrl.startsWith("/") &&
                  !finalUrl.startsWith("#") &&
                  !finalUrl.startsWith("mailto:") &&
                  !finalUrl.startsWith("tel:")
                ) {
                  finalUrl = `https://${finalUrl}`;
                }

                editor
                  .chain()
                  .focus()
                  .setLink({
                    href: finalUrl,
                  })
                  .run();
              }
            }}
            className={`${styles.toolbarButton}

      ${editor.isActive("link") ? styles.toolbarButtonActive : ""}

      `}
            title="插入連結"
          >
            <FiLink size={16} />
          </button>
          <button
            type="button"
            onClick={() => {
              fileInputRef.current?.click();
            }}
            className={styles.toolbarButton}
            title="上傳圖片"
          >
            <FiUpload size={16} />
          </button>
          <input
            type="file"
            ref={fileInputRef}
            accept="image/*"
            style={{
              display: "none",
            }}
            onChange={handleImageUpload}
          />
        </div>
        <div className={styles.toolbarDivider} /> {/* 清除格式 */}
        <div className={styles.toolbarGroup}>
          <button
            type="button"
            onClick={() =>
              editor.chain().focus().clearNodes().unsetAllMarks().run()
            }
            className={styles.toolbarButton}
            title="清除文字樣式"
          >
            清除文字樣式
          </button>
        </div>
      </div>
      {/* 編輯器內容 */}
      <div className={styles.editorContainer}>
        <EditorContent editor={editor} />
      </div>
    </div>
  );
};

export default RichTextEditor;
