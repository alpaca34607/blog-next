"use client";
import React, { useState, useEffect } from "react";
import styles from "./index.module.scss";
import { API_GetSiteSettings } from "@/app/api/public_api";
import DefaultInput from "@/components/public/Input";
import { PiMapPinFill } from "react-icons/pi";
import { PiPhoneFill } from "react-icons/pi";
import HeroSection from "@/components/public/sections/HeroSection";
// 網站設定介面
interface SiteSettings {
  phone: string;
  email: string;
  lineUrl: string;
  lineQrCode: string;
  contactTime: string;
  address: string;
  contactImage: string;
  contactBanner: string;
}

const ContactPage = () => {
  const [address, setAddress] = useState<string>("");
  const [isLoading, setIsLoading] = useState(true);
  const [siteSettings, setSiteSettings] = useState<SiteSettings | null>(null);
  const [formData, setFormData] = useState({
    name: "",
    contact: "",
    phone: "",
    email: "",
    lineUrl: "",
    source: "",
    subject: "",
    contactNeed: "",
    message: "",
  });

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
            address: data?.address || "",
            contactImage: data?.contactImage || "",
            contactBanner: data?.contactBanner || "",
          };

          setSiteSettings(mapped);
          setAddress(mapped.address || "");
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

  const contactData = [
    {
      id: 1,
      title: "電話",
      contact: siteSettings?.phone || "02-1234-5678",
      icon: <PiPhoneFill size="100%" />,
      time:
        siteSettings?.contactTime ||
        "週一至週五，09:00~18:00 (國定假日、例假日休息)",
      link: "",
    },
    {
      id: 2,
      title: "LINE ID",
      qrCode:
        siteSettings?.lineQrCode ||
        "https://qr-official.line.me/gs/M_939qqenx_GW.png?from=page&liff.referrer=https%3A%2F%2Fblogcraft.com%2F&searchId=939qqenx",
      time:
        siteSettings?.contactTime ||
        "週一至週五，09:00~18:00 (國定假日、例假日休息)",
      linkText: "加入LINE",
      link: siteSettings?.lineUrl || "",
    },
  ];

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!e.target.value || !emailRegex.test(e.target.value)) {
      setFormData({
        ...formData,
        [e.target.name]: e.target.value,
        email: "請輸入正確的電子郵件格式",
      });
    } else {
      setFormData({ ...formData, [e.target.name]: e.target.value });
    }
    console.log(formData);
  };

  return (
    <div className={styles.contactWrapper}>
      {/* 聯絡我們 banner：若後台有設定則用後台圖片，否則使用預設 public 圖片 */}
      {siteSettings?.contactBanner ? (
        <HeroSection
          section={{
            title: "聯絡我們",
            subtitle: "contact us",
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
            title: "聯絡我們",
            subtitle: "contact us",
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
        <h1 className={styles.title}>線上諮詢表單</h1>
        <p className={styles.description}>
          想進一步了解 布創網路 的產品或服務，或是對布創網有任何寶貴意見，
          我們都誠摯地邀請您留下訊息，或將資訊傳送到我們專人服務的電子郵件信箱，
          我們將立即與您聯繫！
        </p>
        <div className={styles.address}>
          公司地址：
          {isLoading
            ? "載入中..."
            : address ||
              "台北: 台北市大安區信義路三段106號3樓之4 高雄: 高雄市左營區明誠二路322號6樓"}
          <a
            href={`https://www.google.com/maps/search/?api=1&query=${address}`}
            target="_blank"
            rel="noopener noreferrer"
          >
            <PiMapPinFill size="100%" />
          </a>
        </div>
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
        <form className={styles.contactForm}>
          <div className={styles.formgrid}>
            <DefaultInput
              label="公司名稱/您的大名"
              name="name"
              onChangeFun={handleChange}
              value={formData.name}
              placeholder="請輸入公司名稱/您的大名"
              required={true}
            />
            <DefaultInput
              label="聯絡窗口"
              name="contact"
              onChangeFun={handleChange}
              value={formData.contact}
              placeholder="請輸入您的聯絡窗口"
              required={true}
            />
            <DefaultInput
              label="聯絡電話"
              name="phone"
              onChangeFun={handleChange}
              value={formData.phone}
              placeholder="請輸入您的聯絡電話"
              required={true}
            />
            <DefaultInput
              label="電子郵件"
              name="email"
              onChangeFun={handleChange}
              value={formData.email}
              placeholder="請輸入您的電子郵件"
              required={true}
            />
            <DefaultInput
              label="LINE ID"
              name="lineUrl"
              onChangeFun={handleChange}
              value={formData.lineUrl}
              placeholder="請輸入您的LINE ID"
            />
            <DefaultInput
              label="從哪得知我們的"
              type="select"
              name="source"
              onChangeFun={handleChange}
              value={formData.source}
              placeholder="請選擇您從哪得知我們的"
              required={true}
              options={[
                { value: "google", label: "Google" },
                { value: "facebook", label: "Facebook" },
                { value: "youtube", label: "Youtube" },
                { value: "workshop", label: "Workshop" },
                { value: "展覽會", label: "展覽會" },
                { value: "布創官網", label: "布創官網" },
                { value: "同業介紹", label: "同業介紹" },
                { value: "other", label: "其他" },
              ]}
            />
            <DefaultInput
              label="主旨"
              name="subject"
              onChangeFun={handleChange}
              value={formData.subject}
              placeholder="請選擇您的主旨"
              required={true}
              type="select"
              options={[
                {
                  value: "VirtualES 雲端資料防護系統",
                  label: "VirtualES 雲端資料防護系統",
                },
                {
                  value: "Ready Tech QV1 360°全景視訊會議系統",
                  label: "Ready Tech QV1 360°全景視訊會議系統",
                },
                { value: "資訊解密方案", label: "資訊解密方案" },
                { value: "AI 遠端自動巡檢平台", label: "AI 遠端自動巡檢平台" },
                {
                  value: "AI影像辨識·智慧城市·大數據分析",
                  label: "AI影像辨識·智慧城市·大數據分析",
                },
                {
                  value: "AI邊緣運算·科技減災·安防監控",
                  label: "AI邊緣運算·科技減災·安防監控",
                },
                { value: "QCT AI GPU Server ", label: "QCT AI GPU Server " },
                { value: "other", label: "其他" },
              ]}
            />
            <DefaultInput
              label="聯繫需求"
              name="contactNeed"
              onChangeFun={handleChange}
              value={formData.contactNeed}
              placeholder="請選擇您的聯繫需求"
              required={true}
              type="select"
              options={[
                {
                  value: "合作洽談",
                  label: "合作洽談",
                },
                {
                  value: "業務需求",
                  label: "業務需求",
                },
                {
                  value: "技術提問",
                  label: "技術提問",
                },

                {
                  value: "其他",
                  label: "其他",
                },
              ]}
            />
          </div>
          <DefaultInput
            label="留言內容"
            name="message"
            onChangeFun={handleChange}
            value=""
            placeholder="請輸入您的留言內容"
            required={true}
            textarea={true}
          />
          <button type="submit" className={styles.submitButton}>
            送出
          </button>
        </form>
      </div>
    </div>
  );
};

export default ContactPage;
