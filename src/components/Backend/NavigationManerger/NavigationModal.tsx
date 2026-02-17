"use client";
import { useState, useEffect, useRef } from "react";
import { FiX } from "react-icons/fi";
import styles from "./NavigationModal.module.scss";

interface ModalNavigationItem {
  id?: string;
  title: string;
  slug: string;
  parentId?: string;
  sortOrder?: number;
  isExternal: boolean;
  externalUrl?: string;
  isVisible: boolean;
  pageId?: string;
  hasChildren?: boolean;
  // 產品分類（選填），若有設定則會在前台以該分類的產品作為子選單
  productCategory?: string;
}

interface NavigationModalProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (data: Partial<ModalNavigationItem>) => void;
  editingItem: ModalNavigationItem | null;
  parentItems: ModalNavigationItem[];
  pages?: Array<{ id: string; title: string; slug: string }>;
  productCategories?: string[];
}

const NavigationModal = ({
  open,
  onClose,
  onSubmit,
  editingItem,
  parentItems,
  pages = [],
  productCategories = [],
}: NavigationModalProps) => {
  const [formData, setFormData] = useState<Partial<ModalNavigationItem>>({
    title: "",
    slug: "",
    parentId: "",
    isExternal: false,
    externalUrl: "",
    isVisible: true,
    pageId: "",
    hasChildren: false,
  });

  const [isParentMenuOpen, setIsParentMenuOpen] = useState(false);
  const [isPageMenuOpen, setIsPageMenuOpen] = useState(false);
  const parentMenuRef = useRef<HTMLDivElement>(null);
  const pageMenuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (editingItem) {
      setFormData({
        title: editingItem.title || "",
        slug: editingItem.slug || "",
        parentId: editingItem.parentId || "",
        isExternal: editingItem.isExternal || false,
        externalUrl: editingItem.externalUrl || "",
        isVisible: editingItem.isVisible !== false,
        pageId: editingItem.pageId || "",
        hasChildren: editingItem.hasChildren || false,
        productCategory: editingItem.productCategory || "",
      });
    } else {
      setFormData({
        title: "",
        slug: "",
        parentId: "",
        isExternal: false,
        externalUrl: "",
        isVisible: true,
        pageId: "",
        hasChildren: false,
        productCategory: "",
      });
    }
  }, [editingItem, open]);

  useEffect(() => {
    if (open) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (parentMenuRef.current && !parentMenuRef.current.contains(target)) {
        setIsParentMenuOpen(false);
      }
      if (pageMenuRef.current && !pageMenuRef.current.contains(target)) {
        setIsPageMenuOpen(false);
      }
    };

    if (open) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [open]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // 驗證邏輯：若未選擇頁面、未勾選有子分頁、也未指定產品分類，則 slug 必填
    if (
      !formData.pageId &&
      !formData.hasChildren &&
      !formData.productCategory?.trim() &&
      !formData.slug?.trim()
    ) {
      alert("請填寫 Slug（URL路徑）或選擇連結頁面或勾選有子分頁");
      return;
    }

    const submitData = { ...formData };
    if (!submitData.parentId) delete submitData.parentId;
    if (!submitData.pageId) delete submitData.pageId;
    if (!submitData.externalUrl) delete submitData.externalUrl;
    if (!submitData.hasChildren) delete submitData.hasChildren;
    // 保留 productCategory，即使為空字串，讓上層可以明確判斷「清空」動作
    onSubmit(submitData);
  };

  if (!open) return null;

  const selectedParent = parentItems.find((p) => p.id === formData.parentId);
  const selectedPage = pages.find((p) => p.id === formData.pageId);

  return (
    <div className={styles.modalOverlay}>
      <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
        <div className={styles.modalHeader}>
          <h2 className={styles.modalTitle}>
            {editingItem ? "編輯導覽項目" : "新增導覽項目"}
          </h2>
          <button className={styles.closeButton} onClick={onClose}>
            <FiX size={24} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className={styles.form}>
          <div className={styles.formGroup}>
            <label className={styles.label}>
              名稱 <span className={styles.required}>*</span>
            </label>
            <input
              type="text"
              className={styles.input}
              value={formData.title}
              onChange={(e) =>
                setFormData({ ...formData, title: e.target.value })
              }
              placeholder="例如：關於布創"
              required
            />
          </div>

          <div className={styles.formGroup}>
            <label className={styles.label}>
              Slug (URL路徑)
              {!formData.pageId && !formData.hasChildren && (
                <span className={styles.required}> *</span>
              )}
            </label>
            <input
              type="text"
              className={styles.input}
              value={formData.slug}
              onChange={(e) =>
                setFormData({ ...formData, slug: e.target.value })
              }
              placeholder="例如：about"
              disabled={!!formData.pageId}
            />
            {formData.pageId && (
              <p className={styles.helpText}>
                已選擇頁面，將自動使用該頁面的路由
              </p>
            )}
          </div>

          <div className={styles.formGroup}>
            <label className={styles.label}>上層選單</label>
            <div className={styles.selectWrapper} ref={parentMenuRef}>
              <button
                type="button"
                className={styles.select}
                onClick={() => setIsParentMenuOpen(!isParentMenuOpen)}
              >
                <span>
                  {selectedParent ? selectedParent.title : "無 (頂層選單)"}
                </span>
                <span className={styles.chevron}>▼</span>
              </button>
              {isParentMenuOpen && (
                <div className={styles.selectMenu}>
                  <button
                    type="button"
                    className={`${styles.selectItem} ${
                      !formData.parentId ? styles.selectItemActive : ""
                    }`}
                    onClick={() => {
                      setFormData({ ...formData, parentId: "" });
                      setIsParentMenuOpen(false);
                    }}
                  >
                    無 (頂層選單)
                    {!formData.parentId && (
                      <span className={styles.checkmark}>✓</span>
                    )}
                  </button>
                  {parentItems.map((parent) => (
                    <button
                      key={parent.id}
                      type="button"
                      className={`${styles.selectItem} ${
                        formData.parentId === parent.id
                          ? styles.selectItemActive
                          : ""
                      }`}
                      onClick={() => {
                        setFormData({ ...formData, parentId: parent.id });
                        setIsParentMenuOpen(false);
                      }}
                    >
                      {parent.title}
                      {formData.parentId === parent.id && (
                        <span className={styles.checkmark}>✓</span>
                      )}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>

          <div className={styles.formGroup}>
            <div className={styles.switchGroup}>
              <label className={styles.label}>外部連結</label>
              <label className={styles.switch}>
                <input
                  type="checkbox"
                  checked={formData.isExternal}
                  onChange={(e) =>
                    setFormData({ ...formData, isExternal: e.target.checked })
                  }
                />
                <span className={styles.slider}></span>
              </label>
            </div>
          </div>

          {formData.isExternal ? (
            <div className={styles.formGroup}>
              <label className={styles.label}>外部網址</label>
              <input
                type="url"
                className={styles.input}
                value={formData.externalUrl || ""}
                onChange={(e) =>
                  setFormData({ ...formData, externalUrl: e.target.value })
                }
                placeholder="https://example.com"
              />
            </div>
          ) : (
            <div className={styles.formGroup}>
              <label className={styles.label}>連結頁面</label>
              <div className={styles.selectWrapper} ref={pageMenuRef}>
                <button
                  type="button"
                  className={styles.select}
                  onClick={() => setIsPageMenuOpen(!isPageMenuOpen)}
                >
                  <span>{selectedPage ? selectedPage.title : "無"}</span>
                  <span className={styles.chevron}>▼</span>
                </button>
                {isPageMenuOpen && (
                  <div className={styles.selectMenu}>
                    <button
                      type="button"
                      className={`${styles.selectItem} ${
                        !formData.pageId ? styles.selectItemActive : ""
                      }`}
                      onClick={() => {
                        setFormData({ ...formData, pageId: "", slug: "" });
                        setIsPageMenuOpen(false);
                      }}
                    >
                      無
                      {!formData.pageId && (
                        <span className={styles.checkmark}>✓</span>
                      )}
                    </button>
                    {pages.map((page) => (
                      <button
                        key={page.id}
                        type="button"
                        className={`${styles.selectItem} ${
                          formData.pageId === page.id
                            ? styles.selectItemActive
                            : ""
                        }`}
                        onClick={() => {
                          setFormData({
                            ...formData,
                            pageId: page.id,
                            slug: page.slug, // 自動填入該頁面的 slug
                          });
                          setIsPageMenuOpen(false);
                        }}
                      >
                        <div
                          style={{
                            display: "flex",
                            flexDirection: "column",
                            alignItems: "flex-start",
                            gap: "2px",
                          }}
                        >
                          <span>{page.title}</span>
                          <span style={{ fontSize: "12px", color: "#6b7280" }}>
                            /{page.slug}
                          </span>
                        </div>
                        {formData.pageId === page.id && (
                          <span className={styles.checkmark}>✓</span>
                        )}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* 產品分類（選填）：若設定，該導覽子項目會在前台顯示此分類底下的所有產品 */}
          <div className={styles.formGroup}>
            <label className={styles.label}>產品分類（選填）</label>
            <select
              className={styles.input}
              value={formData.productCategory || ""}
              onChange={(e) => {
                const selectedCategory = e.target.value || "";
                setFormData({
                  ...formData,
                  productCategory: selectedCategory,
                  // 當產品分類有值時，自動同步到名稱
                  title: selectedCategory || formData.title,
                });
              }}
            >
              <option value="">不設定產品分類</option>
              {productCategories.map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </select>
            <p className={styles.helpText}>
              若選擇產品分類，前台導覽在此項目下會自動列出該分類的所有產品頁面，且名稱會自動同步為產品分類名稱
            </p>
          </div>

          <div className={styles.formGroup}>
            <div className={styles.switchGroup}>
              <label className={styles.label}>有子分頁</label>
              <label className={styles.switch}>
                <input
                  type="checkbox"
                  checked={!!formData.hasChildren}
                  onChange={(e) =>
                    setFormData({ ...formData, hasChildren: e.target.checked })
                  }
                />
                <span className={styles.slider}></span>
              </label>
            </div>
            <p className={styles.helpText}>
              勾選此項表示此導覽項目擁有子分頁，不需要獨立的 URL 路徑
            </p>
          </div>

          <div className={styles.formGroup}>
            <div className={styles.switchGroup}>
              <label className={styles.label}>顯示於導覽列</label>
              <label className={styles.switch}>
                <input
                  type="checkbox"
                  checked={formData.isVisible}
                  onChange={(e) =>
                    setFormData({ ...formData, isVisible: e.target.checked })
                  }
                />
                <span className={styles.slider}></span>
              </label>
            </div>
          </div>

          <div className={styles.formActions}>
            <button
              type="button"
              className={styles.cancelButton}
              onClick={onClose}
            >
              取消
            </button>
            <button type="submit" className={styles.saveButton}>
              儲存
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default NavigationModal;
