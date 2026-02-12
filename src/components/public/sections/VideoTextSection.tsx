"use client";
import { FiArrowRight } from "react-icons/fi";
import { getSectionStyle } from "@/utils/sectionStyles";
// 和ImageTextSection.tsx共用css
import styles from "./ImageTextSection.module.scss";

interface VideoTextSectionProps {
  section: {
    title?: string;
    subtitle?: string;
    content?: string;
    settings?: {
      backgroundColor?: string;
      backgroundImage?: string;
      templateVariant?: string;
      video?: string;
      buttonText?: string;
      buttonLink?: string;
    };
    video?: string; // 支援直接的 video 欄位
  };
}

// 將 YouTube URL 轉換為 embed URL
const convertYouTubeUrlToEmbed = (url: string): string => {
  if (!url) return "";

  // 如果已經是 embed URL，直接返回
  if (url.includes("youtube.com/embed/")) {
    return url;
  }

  // 提取 YouTube 影片 ID
  let videoId = "";

  // 處理各種 YouTube URL 格式
  const patterns = [
    /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([^&\n?#]+)/,
    /youtube\.com\/watch\?.*v=([^&\n?#]+)/,
  ];

  for (const pattern of patterns) {
    const match = url.match(pattern);
    if (match && match[1]) {
      videoId = match[1];
      break;
    }
  }

  if (videoId) {
    return `https://www.youtube.com/embed/${videoId}`;
  }

  // 如果無法解析，返回原始 URL
  return url;
};

const VideoTextSection = ({ section }: VideoTextSectionProps) => {
  // 使用共用的背景樣式工具函數
  const { style: sectionStyle, className: backgroundImageClass } =
    getSectionStyle({
      backgroundColor: section.settings?.backgroundColor,
      backgroundImage: section.settings?.backgroundImage,
    });

  const variant = section.settings?.templateVariant || "left-video";
  const video = section.settings?.video || section.video;
  const buttonText = section.settings?.buttonText;
  const buttonLink = section.settings?.buttonLink || "#";

  const isVertical = variant === "vertical";
  const isRightVideo = variant === "right-video";

  // 決定容器 class
  const getContainerClass = () => {
    if (isVertical) {
      return styles.containerVertical;
    } else if (isRightVideo) {
      return styles.containerRightImage;
    } else {
      return styles.containerLeftImage;
    }
  };

  // 轉換為 embed URL
  const embedUrl = video ? convertYouTubeUrlToEmbed(video) : "";

  return (
    <section
      className={`${styles.imageTextSection} ${
        backgroundImageClass ? styles.hasBgImage : ""
      }`}
      style={sectionStyle}
    >
      <div className={styles.wrapper}>
        <div className={styles.header}>
          {section.title && <h2 className={styles.title}>{section.title}</h2>}
            {section.subtitle && (
              <p className={styles.subtitle}>{section.subtitle}</p>
            )}
        </div>
        <div className={`${styles.contentContainer} ${getContainerClass()}`}>
          {/* 影片 */}
          {embedUrl && (
            <div className={styles.videoWrapper}>
              <div
                style={{
                  position: "relative",
                  width: "100%",
                  paddingBottom: "56.25%",
                }}
              >
                <iframe
                  src={embedUrl}
                  style={{
                    position: "absolute",
                    top: 0,
                    left: 0,
                    width: "100%",
                    height: "100%",
                    border: "none",
                  }}
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                />
              </div>
            </div>
          )}

          {/* 內容 */}
          <div
            className={`${styles.textWrapper} ${
              video ? styles.hasVideo : styles.noVideo
            }`}
          >
            {section.content && (
              <div
                className={styles.content}
                dangerouslySetInnerHTML={{ __html: section.content }}
              />
            )}
            {buttonText && (
              <a href={buttonLink} className={styles.buttonLink}>
                <button className={styles.button}>
                  {buttonText}
                  <FiArrowRight size={18} className={styles.buttonIcon} />
                </button>
              </a>
            )}
          </div>
        </div>
      </div>
    </section>
  );
};

export default VideoTextSection;
