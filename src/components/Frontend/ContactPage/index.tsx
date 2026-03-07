"use client";
import React, { useState, useEffect } from "react";
import styles from "./index.module.scss";
import { API_GetSiteSettings } from "@/app/api/public_api";
import DefaultInput from "@/components/public/Input";
import { PiMapPinFill } from "react-icons/pi";
import { PiPhoneFill } from "react-icons/pi";
import HeroSection from "@/components/public/sections/HeroSection";
import { useLocale } from "next-intl";
import { useTranslations } from "next-intl";
import emailjs from "@emailjs/browser";
import { accentOrange } from "@/styles/theme";
import Swal from "sweetalert2";

// 網站設定介面
interface SiteSettings {
  phone: string;
  email: string;
  lineUrl: string;
  lineQrCode: string;
  contactTime: string;
  contactTimeEn: string;
  address: string;
  addressEn: string;
  contactImage: string;
  contactBanner: string;
}
  
const ContactPage = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [siteSettings, setSiteSettings] = useState<SiteSettings | null>(null);
  // 下拉選單預設為第一個選項
  const [formData, setFormData] = useState({
    name: "",
    contact: "",
    phone: "",
    email: "",
    lineUrl: "",
    source: "google",
    subject: "品牌部落格形象模板",
    contactNeed: "網站製作諮詢",
    message: "",
  });
  const [emailError, setEmailError] = useState("");
  // 必填欄位錯誤訊息，key 為欄位 name
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [submitStatus, setSubmitStatus] = useState<"idle" | "loading" | "success" | "error">("idle");

  useEffect(() => {
    // 從 API 獲取網站設定中的地址
    const fetchSiteSettings = async () => {
      try {
        const response = await API_GetSiteSettings();
        if (response?.success) {
          const data: any = response.data;
          const mapped: SiteSettings = {
            phone: data?.phone || "",
            email: data?.email || "",
            lineUrl: data?.socialLinks?.line || "",
            lineQrCode: data?.lineQrCode || "",
            contactTime: data?.contactTime || "",
            contactTimeEn: data?.contactTimeEn || "",
            address: data?.address || "",
            addressEn: data?.addressEn || "",
            contactImage: data?.contactImage || "",
            contactBanner: data?.contactBanner || "",
          };

          setSiteSettings(mapped);
        } else {
          console.error(
            "取得網站設定失敗:",
            response?.error?.message || "未知錯誤"
          );
        }
      } catch (error) {
        // 處理意外錯誤
        console.error("載入網站設定時發生錯誤:", error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchSiteSettings();
  }, []);
  const locale = useLocale();
  const t = useTranslations("ContactPage");
  const contactTime = locale === "en" ? siteSettings?.contactTimeEn : siteSettings?.contactTime ;
  const address = locale === "en" ? siteSettings?.addressEn : siteSettings?.address;

  const contactData = [
    {
      id: 1,
      title: t("phoneTitle"),
      contact: siteSettings?.phone || "02-1234-5678",
      icon: <PiPhoneFill size="100%" />,
      time: contactTime || "",
      link: "",
    },
    {
      id: 2,
      title: "LINE ID",
      qrCode:
        siteSettings?.lineQrCode ||
        "https://line.me/ti/p/OD4fPP6GtD",
      time: contactTime || "",
      linkText: t("lineAddText"),
      link: siteSettings?.lineUrl || "",
    },
  ];

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });

    if (name === "email") {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      setEmailError(value && !emailRegex.test(value) ? t("emailError") : "");
    }
    // 使用者輸入時清除該欄位的必填錯誤
    if (fieldErrors[name]) {
      setFieldErrors((prev) => {
        const next = { ...prev };
        delete next[name];
        return next;
      });
    }
  };

  // 必填欄位名稱列表
  const REQUIRED_FIELDS = ["name", "contact", "phone", "email", "source", "subject", "contactNeed", "message"] as const;

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (emailError) {
      Swal.fire({
        icon: "error",
        title: t("emailError"),
        text: t("emailErrorText"),
        confirmButtonText: t("confirmButtonText"),
        confirmButtonColor: accentOrange,
      });
      return;
    }

    // 驗證必填欄位，收集錯誤並顯示在欄位下方
    const errors: Record<string, string> = {};
    for (const field of REQUIRED_FIELDS) {
      const value = formData[field];
      if (value === undefined || String(value).trim() === "") {
        errors[field] = t("requiredError");
      }
    }
    if (Object.keys(errors).length > 0) {
      setFieldErrors(errors);
      return;
    }
    setFieldErrors({});

    setSubmitStatus("loading");

    try {
      await emailjs.send(
        process.env.NEXT_PUBLIC_EMAILJS_SERVICE_ID!,
        process.env.NEXT_PUBLIC_EMAILJS_TEMPLATE_ID!,
        {
          name: formData.name,
          contact: formData.contact,
          phone: formData.phone,
          email: formData.email,
          lineUrl: formData.lineUrl,
          source: formData.source,
          subject: formData.subject,
          contactNeed: formData.contactNeed,
          message: formData.message,
        },
        process.env.NEXT_PUBLIC_EMAILJS_PUBLIC_KEY!
      );

      setSubmitStatus("success");
      Swal.fire({
        icon: "success",
        title: t("submitSuccess"),
        text: t("submitSuccessText"),
        confirmButtonText: t("confirmButtonText"),
        confirmButtonColor: accentOrange,
      });
      // 重置表單與欄位錯誤（下拉選單還原為第一個選項）
      setFormData({
        name: "",
        contact: "",
        phone: "",
        email: "",
        lineUrl: "",
        source: "google",
        subject: "brand-blog",
        contactNeed: "web-consult",
        message: "",
      });
      setFieldErrors({});
    } catch (error) {
      console.error("寄送失敗:", error);
      setSubmitStatus("error");
      Swal.fire({
        icon: "error",
        title: t("submitError"),
        text: t("submitErrorText"),
        confirmButtonText: t("confirmButtonText"),
        confirmButtonColor: accentOrange,
      });
      return;
    }
  };

  return (
    <div className={styles.contactWrapper}>
      {/* 聯絡我們 banner：若後台有設定則用後台圖片，否則使用預設 public 圖片 */}
      {siteSettings?.contactBanner ? (
        <HeroSection
          section={{
            title: t("heroTitle"),
            subtitle: t("heroSubtitle"),
            content: "",
            settings: {
              backgroundColor: "transparent",
              backgroundImage: "",
              image: "",
              heroImage: "",
              heroImages: [siteSettings.contactBanner],
            },
          }}
        />
      ) : (
        <HeroSection
          section={{
            title: t("heroTitle"),
            titleEn: "Contact Us",
            subtitle: t("heroSubtitle"),
            subtitleEn: "Leave a message",
            content: "",
            settings: {
              backgroundColor: "transparent",
              backgroundImage: "",
              image: "",
              heroImage: "",
              heroImages: ["/images/background/banner.jpg"],
            },
          }}
        />
      )}
      {/* 解密事件處理圖片區塊 */}
      {siteSettings?.contactImage && (
        <HeroSection
          contain
          section={{
            title: "",
            subtitle: "",
            content: "",
            settings: {
              backgroundColor: "transparent",
              backgroundImage: "",
              image: "",
              heroImage: "",
              heroImages: [siteSettings.contactImage],
            },
          }}
        />
      )}

      <div className={styles.header}>
        <h1 className={styles.title}>{t("formTitle")}</h1>
        <p className={styles.description}>{t("formDescription")}</p>
      </div>
      <div className={styles.container}>
        <div className={styles.cardWrapper}>
          {contactData.map((item) => (
            <div className={styles.card} key={item.id}>
              {item.icon && <div className={styles.cardIcon}>{item.icon}</div>}
              {item.qrCode && (
                <div className={styles.cardIcon}>
                  <img src={item.qrCode} alt="QR Code" />
                </div>
              )}
              <div className={styles.cardContent}>
                <div className={styles.cardInfo}>
                  <h3 className={styles.cardTitle}>{item.title}</h3>
                  {item.link && (
                    <a
                      className={styles.cardButton}
                      href={item.link}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      {item.linkText}
                    </a>
                  )}
                  {item.contact && (
                    <p className={styles.cardContact}>{item.contact}</p>
                  )}
                </div>
                <p className={styles.cardTime}>{item.time}</p>
              </div>
            </div>
          ))}
        </div>
        <form className={styles.contactForm} onSubmit={handleSubmit}>
          <div className={styles.formgrid}>
            <DefaultInput
              label={t("labelName")}
              name="name"
              onChangeFun={handleChange}
              value={formData.name}
              placeholder={t("placeholderName")}
              required={true}
              errorMessage={fieldErrors.name}
            />
            <DefaultInput
              label={t("labelContact")}
              name="contact"
              onChangeFun={handleChange}
              value={formData.contact}
              placeholder={t("placeholderContact")}
              required={true}
              errorMessage={fieldErrors.contact}
            />
            <DefaultInput
              label={t("labelPhone")}
              name="phone"
              onChangeFun={handleChange}
              value={formData.phone}
              placeholder={t("placeholderPhone")}
              required={true}
              errorMessage={fieldErrors.phone}
            />
            <DefaultInput
              label={t("labelEmail")}
              name="email"
              onChangeFun={handleChange}
              value={formData.email}
              placeholder={t("placeholderEmail")}
              required={true}
              errorMessage={emailError}
            />
            <DefaultInput
              label={t("labelLine")}
              name="lineUrl"
              onChangeFun={handleChange}
              value={formData.lineUrl}
              placeholder={t("placeholderLine")}
            />
            <DefaultInput
              label={t("labelSource")}
              type="select"
              name="source"
              onChangeFun={handleChange}
              value={formData.source}
              placeholder={t("placeholderSource")}
              required={true}
              errorMessage={fieldErrors.source}
              options={[
                { value: "google", label: "Google" },
                { value: "facebook", label: "Facebook" },
                { value: "youtube", label: "Youtube" },
                { value: "behance", label: "Behance" },
                { value: "other", label: t("optionOther") },
              ]}
            />
            <DefaultInput
              label={t("labelSubject")}
              name="subject"
              onChangeFun={handleChange}
              value={formData.subject}
              placeholder={t("placeholderSubject")}
              required={true}
              type="select"
              errorMessage={fieldErrors.subject}
              options={[
                { value: "brand-blog", label: t("subjectBlog") },
                { value: "homepage-design", label: t("subjectHomepage") },
                { value: "custom-dev", label: t("subjectCustom") },
                { value: "other", label: t("optionOther") },
              ]}
            />
            <DefaultInput
              label={t("labelContactNeed")}
              name="contactNeed"
              onChangeFun={handleChange}
              value={formData.contactNeed}
              placeholder={t("placeholderContactNeed")}
              required={true}
              type="select"
              errorMessage={fieldErrors.contactNeed}
              options={[
                { value: "web-consult", label: t("needWebConsult") },
                { value: "maintenance", label: t("needMaintenance") },
                { value: "feedback", label: t("needFeedback") },
                { value: "other", label: t("optionOther") },
              ]}
            />
          </div>
          <DefaultInput
            label={t("labelMessage")}
            name="message"
            onChangeFun={handleChange}
            value={formData.message}
            placeholder={t("placeholderMessage")}
            required={true}
            textarea={true}
            errorMessage={fieldErrors.message}
          />
          {submitStatus === "success" && (
            <p className={styles.successMessage}>{t("submitSuccess")}</p>
          )}
          {submitStatus === "error" && (
            <p className={styles.errorMessage}>{t("submitError")}</p>
          )}
          <button
            type="submit"
            className={styles.submitButton}
            disabled={submitStatus === "loading"}
          >
            {submitStatus === "loading" ? t("submitting") : t("submitButton")}
          </button>
        </form>
      </div>
    </div>
  );
};

export default ContactPage;
