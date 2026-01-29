"use client";
import { useState, useEffect } from "react";
import AdminLayout from "@/components/Backend/AdminLayout";
import ImageUploader from "@/components/forms/ImageUploader";
import {
  FiSave,
  FiLoader,
  FiGlobe,
  FiUpload,
  FiPhone,
  FiMail,
  FiMapPin,
  FiFacebook,
  FiMessageCircle,
  FiYoutube,
  FiX,
  FiLink,
  FiPlus,
  FiTrash2,
  FiClock,
  FiImage,
  FiRefreshCw,
} from "react-icons/fi";
import { MdOutlineQrCode } from "react-icons/md";
import Image from "next/image";
import Swal from "sweetalert2";
import styles from "./page.module.scss";
import adminStyles from "@/styles/AdminPagePublic.module.scss";
import {
  API_GetSiteSettingsAdmin,
  API_UpdateSiteSettings,
} from "@/app/api/admin_api";
import DefaultInput from "@/components/public/Input";

interface SiteSettings {
  siteName: string;
  siteNameEn: string;
  logo: string;
  footerLogo: string;
  phone: string;
  email: string;
  contactTime: string;
  address: string;
  contactImage: string;
  contactBanner: string;
  facebookUrl: string;
  lineUrl: string;
  lineQrCode: string;
  youtubeUrl: string;
  copyright: string;
  socialLinks: Record<string, string>;
  additionalLinks: Array<{ title: string; url: string }>;
  metaTitle: string;
  metaDescription: string;
}

const DEFAULT_SETTINGS: SiteSettings = {
  siteName: "",
  siteNameEn: "",
  logo: "",
  footerLogo: "",
  phone: "",
  email: "",
  contactTime: "",
  address: "",
  contactImage: "",
  contactBanner: "",
  facebookUrl: "",
  lineUrl: "",
  lineQrCode: "",
  youtubeUrl: "",
  copyright: "",
  socialLinks: {},
  additionalLinks: [],
  metaTitle: "",
  metaDescription: "",
};

export default function SiteSettingsManager() {
  const [formData, setFormData] = useState<SiteSettings>(DEFAULT_SETTINGS);
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isClient, setIsClient] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // 從 API 載入設定
  const loadSettings = async () => {
    try {
      setIsLoading(true);
      setError(null);

      const response = await API_GetSiteSettingsAdmin();

      if (response?.success) {
        const data = response.data;
        setFormData({
          siteName: data.siteName || "",
          siteNameEn: data.siteNameEn || "",
          logo: data.logo || "",
          footerLogo: data.footerLogo || "",
          phone: data.phone || "",
          email: data.email || "",
          contactTime: data.contactTime || "",
          address: data.address || "",
          contactImage: data.contactImage || "",
          contactBanner: data.contactBanner || "",
          metaTitle: data.metaTitle || "",
          metaDescription: data.metaDescription || "",
          facebookUrl: data.socialLinks?.facebook || "",
          lineUrl: data.socialLinks?.line || "",
          lineQrCode: data.lineQrCode || "",
          youtubeUrl: data.socialLinks?.youtube || "",
          copyright: data.copyright || "",
          socialLinks: data.socialLinks || {},
          additionalLinks: data.additionalLinks || [],
        });
      } else {
        setError(response?.error?.message || "載入設定失敗");
        setFormData(DEFAULT_SETTINGS);
      }
    } catch (err) {
      console.error("載入設定時發生錯誤:", err);
      setError("載入設定時發生錯誤");
      setFormData(DEFAULT_SETTINGS);
    } finally {
      setIsLoading(false);
    }
  };

  // 儲存設定到 API
  const saveSettings = async () => {
    try {
      setIsSaving(true);
      setError(null);

      const apiData = {
        siteName: formData.siteName,
        siteNameEn: formData.siteNameEn,
        logo: formData.logo,
        footerLogo: formData.footerLogo,
        copyright: formData.copyright,
        phone: formData.phone,
        email: formData.email,
        contactTime: formData.contactTime,
        address: formData.address,
        lineQrCode: formData.lineQrCode,
        socialLinks: {
          facebook: formData.facebookUrl,
          line: formData.lineUrl,
          youtube: formData.youtubeUrl,
        },
        additionalLinks: formData.additionalLinks,
        metaTitle: formData.metaTitle,
        metaDescription: formData.metaDescription,
        contactImage: formData.contactImage,
        contactBanner: formData.contactBanner,
      };

      const response = await API_UpdateSiteSettings(apiData);

      if (response?.success) {
        Swal.fire({
          icon: "success",
          title: "設定已儲存",
          text: "網站設定已成功儲存",
          confirmButtonText: "確定",
          confirmButtonColor: "#ffaa00",
        });
      } else {
        setError(response?.error?.message || "儲存設定失敗");
        Swal.fire({
          icon: "error",
          title: "儲存失敗",
          text: response?.error?.message || "無法儲存設定，請重試",
          confirmButtonText: "確定",
          confirmButtonColor: "#ffaa00",
        });
      }
    } catch (err) {
      console.error("儲存設定時發生錯誤:", err);
      setError("儲存設定時發生錯誤");
      Swal.fire({
        icon: "error",
        title: "儲存失敗",
        text: "無法儲存設定，請重試",
        confirmButtonText: "確定",
        confirmButtonColor: "#ffaa00",
      });
    } finally {
      setIsSaving(false);
    }
  };

  useEffect(() => {
    setIsClient(true);
    loadSettings();
  }, []);

  if (!isClient || isLoading) {
    return (
      <AdminLayout>
        <div className={styles.loading}>
          <FiLoader className={styles.spinner} size={32} />
        </div>
      </AdminLayout>
    );
  }

  if (!isClient || isLoading) {
    return (
      <AdminLayout>
        <div className={styles.loading}>
          <FiLoader className={styles.spinner} size={32} />
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className={styles.siteSettings}>
        {/* Header */}
        <div className={styles.header}>
          <div>
            <h1 className={adminStyles.title}>網站設定</h1>
            <p className={adminStyles.subtitle}>管理網站基本資訊與聯絡方式</p>
          </div>
          <div className={adminStyles.buttonGroup}>
            <button
              className={adminStyles.refreshButton}
              onClick={() => loadSettings()}
              disabled={isLoading}
              title="重新載入"
            >
              <FiRefreshCw
                size={16}
                className={isLoading ? styles.spinning : ""}
              />
            </button>
            <button
              onClick={saveSettings}
              disabled={isSaving}
              className={styles.saveButton}
            >
              {isSaving ? (
                <FiLoader className={styles.spinner} size={16} />
              ) : (
                <FiSave size={16} />
              )}
              儲存設定
            </button>
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <div className={styles.errorMessage}>
            <p>{error}</p>
            <button
              onClick={() => loadSettings()}
              className={styles.retryButton}
            >
              重試
            </button>
          </div>
        )}

        {/* Content Grid */}
        <div className={styles.contentGrid}>
          {/* Basic Info Card */}
          <div className={styles.card}>
            <div className={styles.cardHeader}>
              <div className={styles.cardTitle}>
                <FiGlobe className={styles.cardIcon} size={20} />
                基本資訊
              </div>
            </div>
            <div className={styles.cardContent}>
              <div className={styles.formGroup}>
                <label className={styles.label}>網站名稱</label>
                <input
                  type="text"
                  className={styles.input}
                  value={formData.siteName}
                  onChange={(e) =>
                    setFormData({ ...formData, siteName: e.target.value })
                  }
                  placeholder="例如：Watchsense 華生網頁"
                />
              </div>
              <div className={styles.formGroup}>
                <label className={styles.label}>網站名稱(英文)</label>
                <input
                  type="text"
                  className={styles.input}
                  value={formData.siteNameEn}
                  onChange={(e) =>
                    setFormData({ ...formData, siteNameEn: e.target.value })
                  }
                  placeholder="例如：Watchsense Co., Ltd."
                />
              </div>

              <div className={styles.imageUploadGrid}>
                <div className={styles.imageUploadGroup}>
                  <label className={styles.label}>主 Logo</label>
                  {formData.logo ? (
                    <div className={styles.imagePreview}>
                      <Image
                        src={formData.logo}
                        alt="主 Logo"
                        width={200}
                        height={200}
                        className={styles.image}
                      />
                      <button
                        type="button"
                        className={styles.removeImage}
                        onClick={() => setFormData({ ...formData, logo: "" })}
                      >
                        <FiX size={16} />
                      </button>
                    </div>
                  ) : (
                    <div className={styles.uploadPlaceholder}>
                      <ImageUploader
                        onUpload={(url) =>
                          setFormData({ ...formData, logo: url })
                        }
                        buttonLabel="上傳圖片"
                      />
                    </div>
                  )}
                </div>

                <div className={styles.imageUploadGroup}>
                  <label className={styles.label}>Footer Logo</label>
                  {formData.footerLogo ? (
                    <div className={styles.imagePreview}>
                      <Image
                        src={formData.footerLogo}
                        alt="Footer Logo"
                        width={200}
                        height={200}
                        className={styles.image}
                      />
                      <button
                        type="button"
                        className={styles.removeImage}
                        onClick={() =>
                          setFormData({ ...formData, footerLogo: "" })
                        }
                      >
                        <FiX size={16} />
                      </button>
                    </div>
                  ) : (
                    <div className={styles.uploadPlaceholder}>
                      <ImageUploader
                        onUpload={(url) =>
                          setFormData({
                            ...formData,
                            footerLogo: url,
                          })
                        }
                        buttonLabel="上傳圖片"
                      />
                    </div>
                  )}
                </div>
              </div>

              <div className={styles.formGroup}>
                <label className={styles.label}>版權文字</label>
                <input
                  type="text"
                  className={styles.input}
                  value={formData.copyright}
                  onChange={(e) =>
                    setFormData({ ...formData, copyright: e.target.value })
                  }
                  placeholder="例如：Copyright © 2024 Watchsense Co., Ltd. All rights reserved."
                />
              </div>
              <div className={styles.formGroup}>
                <label className={styles.label}>Meta 標題</label>
                <input
                  type="text"
                  className={styles.input}
                  value={formData.metaTitle}
                  onChange={(e) =>
                    setFormData({ ...formData, metaTitle: e.target.value })
                  }
                  placeholder="例如：Watchsense 華生網頁"
                />
              </div>
              <div className={styles.formGroup}>
                <DefaultInput
                  textarea={true}
                  label="Meta 描述"
                  name="metaDescription"
                  value={formData.metaDescription}
                  onChangeFun={(e) =>
                    setFormData({ ...formData, metaDescription: e.target.value })
                  }
                  placeholder="例如：華生網頁提供全方位的企業資安解決方案，從雲端資料防護到AI影像辨識技術，協助企業建立完善的資安防護體系，提升營運效率與數據管理能力。"
                />
              </div>
            </div>
          </div>

          {/* Contact Info Card */}
          <div className={styles.card}>
            <div className={styles.cardHeader}>
              <div className={styles.cardTitle}>
                <FiPhone className={styles.cardIcon} size={20} />
                聯絡資訊
              </div>
            </div>
            <div className={styles.cardContent}>
              <div className={styles.formGroup}>
                <label className={styles.label}>
                  <FiPhone size={16} /> 電話
                </label>
                <input
                  type="text"
                  className={styles.input}
                  value={formData.phone}
                  onChange={(e) =>
                    setFormData({ ...formData, phone: e.target.value })
                  }
                  placeholder="例如：02-1234-5678"
                />
              </div>

              <div className={styles.formGroup}>
                <label className={styles.label}>
                  <FiMail size={16} /> Email
                </label>
                <input
                  type="email"
                  className={styles.input}
                  value={formData.email}
                  onChange={(e) =>
                    setFormData({ ...formData, email: e.target.value })
                  }
                  placeholder="例如：alpaca34607@gmail.com"
                />
              </div>
              <div className={styles.formGroup}>
                <label className={styles.label}>
                  <FiClock size={16} /> 可聯絡時間
                </label>
                <input
                  type="text"
                  className={styles.input}
                  value={formData.contactTime}
                  onChange={(e) =>
                    setFormData({ ...formData, contactTime: e.target.value })
                  }
                  placeholder="例如：週一至週五，09:00~18:00 (國定假日、例假日休息)"
                />
              </div>

              <div className={styles.formGroup}>
                <label className={styles.label}>
                  <FiMapPin size={16} /> 地址
                </label>
                <textarea
                  className={styles.textarea}
                  value={formData.address}
                  onChange={(e) =>
                    setFormData({ ...formData, address: e.target.value })
                  }
                  placeholder="辦公室地址"
                  rows={6}
                />
              </div>

              {/* 聯絡我們圖片 */}
              <div className={styles.formGroup}>
                <label className={styles.label}>
                  <FiImage size={16} /> 聯絡我們圖片
                </label>
                {formData.contactImage ? (
                  <div className={styles.imagePreview}>
                    <Image
                      src={formData.contactImage}
                      alt="聯絡我們圖片"
                      width={200}
                      height={200}
                      className={styles.image}
                    />
                    <button
                      type="button"
                      className={styles.removeImage}
                      onClick={() =>
                        setFormData({ ...formData, contactImage: "" })
                      }
                    >
                      <FiX size={16} />
                    </button>
                  </div>
                ) : (
                  <div className={styles.uploadPlaceholder}>
                    <ImageUploader
                      onUpload={(url) =>
                        setFormData({ ...formData, contactImage: url })
                      }
                      buttonLabel="上傳圖片"
                    />
                  </div>
                )}
              </div>

              {/* 聯絡我們Banner */}
              <div className={styles.formGroup}>
                <label className={styles.label}>
                  <FiImage size={16} /> 聯絡我們Banner
                </label>
                {formData.contactBanner ? (
                  <div className={styles.imagePreview}>
                    <Image
                      src={formData.contactBanner}
                      alt="聯絡我們圖片"
                      width={200}
                      height={200}
                      className={styles.image}
                    />
                    <button
                      type="button"
                      className={styles.removeImage}
                      onClick={() =>
                        setFormData({ ...formData, contactBanner: "" })
                      }
                    >
                      <FiX size={16} />
                    </button>
                  </div>
                ) : (
                  <div className={styles.uploadPlaceholder}>
                    <ImageUploader
                      onUpload={(url) =>
                        setFormData({
                          ...formData,
                          contactBanner: url,
                        })
                      }
                      buttonLabel="上傳圖片"
                    /> 
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Social Media Card */}
          <div className={`${styles.card} ${styles.fullWidth}`}>
            <div className={styles.cardHeader}>
              <div className={styles.cardTitle}>
                <FiFacebook className={styles.cardIcon} size={20} />
                社群媒體
              </div>
            </div>
            <div className={styles.cardContent}>
              <div className={styles.socialGrid}>
                <div className={styles.formGroup}>
                  <label className={styles.label}>
                    <FiFacebook size={16} /> Facebook
                  </label>
                  <input
                    type="url"
                    className={styles.input}
                    value={formData.facebookUrl}
                    onChange={(e) =>
                      setFormData({ ...formData, facebookUrl: e.target.value })
                    }
                    placeholder="https://facebook.com/..."
                  />
                </div>

                <div className={styles.formGroup}>
                  <label className={styles.label}>
                    <FiMessageCircle size={16} /> Line
                  </label>
                  <input
                    type="url"
                    className={styles.input}
                    value={formData.lineUrl}
                    onChange={(e) =>
                      setFormData({ ...formData, lineUrl: e.target.value })
                    }
                    placeholder="https://line.me/..."
                  />
                </div>
                <div className={styles.formGroup}>
                  <label className={styles.label}>
                    <MdOutlineQrCode size={16} /> Line QRcode圖片網址
                  </label>
                  <input
                    type="url"
                    className={styles.input}
                    value={formData.lineQrCode}
                    onChange={(e) =>
                      setFormData({ ...formData, lineQrCode: e.target.value })
                    }
                    placeholder="例如：https://qr-official.line.me/gs/M_939qqenx_GW.png?from=page&liff.referrer=https%3A%2F%2Fwatchsense.com%2F&searchId=939qqenx"
                  />
                </div>

                <div className={styles.formGroup}>
                  <label className={styles.label}>
                    <FiYoutube size={16} /> YouTube
                  </label>
                  <input
                    type="url"
                    className={styles.input}
                    value={formData.youtubeUrl}
                    onChange={(e) =>
                      setFormData({ ...formData, youtubeUrl: e.target.value })
                    }
                    placeholder="https://youtube.com/..."
                  />
                </div>
              </div>
            </div>
          </div>

          {/* 補充連結 */}
          <div className={`${styles.card} ${styles.fullWidth}`}>
            <div className={styles.cardHeader}>
              <div className={styles.cardTitle}>
                <FiLink className={styles.cardIcon} size={20} /> 補充連結
              </div>
            </div>
            <div className={styles.cardContent}>
              {formData.additionalLinks.length === 0 ? (
                <div className={styles.emptyState}>
                  尚無補充連結，點擊下方按鈕新增
                </div>
              ) : (
                <div className={styles.linksList}>
                  {formData.additionalLinks.map((link, index) => (
                    <div key={index} className={styles.linkItem}>
                      <div className={styles.linkItemContent}>
                        <div className={styles.formGroup}>
                          <label className={styles.label}>
                            <FiLink size={16} /> 連結名稱
                          </label>
                          <input
                            type="text"
                            className={styles.input}
                            value={link.title}
                            onChange={(e) => {
                              const newLinks = [...formData.additionalLinks];
                              newLinks[index].title = e.target.value;
                              setFormData({
                                ...formData,
                                additionalLinks: newLinks,
                              });
                            }}
                            placeholder="例如：Google Maps"
                          />
                        </div>
                        <div className={styles.formGroup}>
                          <label className={styles.label}>
                            <FiLink size={16} /> 連結網址
                          </label>
                          <input
                            type="url"
                            className={styles.input}
                            value={link.url}
                            onChange={(e) => {
                              const newLinks = [...formData.additionalLinks];
                              newLinks[index].url = e.target.value;
                              setFormData({
                                ...formData,
                                additionalLinks: newLinks,
                              });
                            }}
                            placeholder="例如：https://www.google.com/maps"
                          />
                        </div>
                      </div>
                      <button
                        type="button"
                        className={styles.removeButton}
                        onClick={() => {
                          const newLinks = formData.additionalLinks.filter(
                            (_, i) => i !== index
                          );
                          setFormData({
                            ...formData,
                            additionalLinks: newLinks,
                          });
                        }}
                        title="刪除連結"
                      >
                        <FiTrash2 size={16} />
                      </button>
                    </div>
                  ))}
                </div>
              )}
              <button
                type="button"
                className={styles.addButton}
                onClick={() => {
                  setFormData({
                    ...formData,
                    additionalLinks: [
                      ...formData.additionalLinks,
                      { title: "", url: "" },
                    ],
                  });
                }}
              >
                <FiPlus size={20} />
                <span>新增連結</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}
