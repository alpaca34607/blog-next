"use client";
import { useRef, useEffect } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { Link } from "@/navigation";
import { useTranslations } from "next-intl";
import { scrollTriggerAnimations } from "@/utils/gsapAnimations";
import styles from "./ContactSection.module.scss";

// 註冊 ScrollTrigger 插件
if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger);
}

const ContactSection = () => {
  const t = useTranslations("homePage");
  const titleRef = useRef<HTMLDivElement>(null);
  const btnRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const titleElement = titleRef.current;
    const btnElement = btnRef.current;

    if (!titleElement || !btnElement) return;

    // 使用 GSAP ScrollTrigger 實現淡入動畫（更早觸發，更快完成）
    scrollTriggerAnimations.fadeInOnScroll(titleElement, {
      start: "top 95%",
      end: "top 60%",
      once: true,
    });

    scrollTriggerAnimations.fadeInOnScroll(btnElement, {
      start: "top 95%",
      end: "top 60%",
      once: true,
    });

    return () => {
      // ScrollTrigger 會在組件卸載時自動清理
    };
  }, []);

  return (
    <div id="contact-section-wrapper" className={styles.contactSectionWrapper}>
      <section className={styles.contactSection}>
        <div ref={titleRef} className={styles.title}>
          <h2>
            {t("contactTitle")}<span>{t("contactTitleEm")}</span>
          </h2>
          <p>{t("contactDesc")}</p>
        </div>
        <div ref={btnRef} className={styles.contactbtnWrapper}>
          <Link href="/contact" className={styles.contactbtn}>
            <span>{t("contactBtn")}</span>
            <svg
              className={styles.btnArrow}
              width="24"
              height="24"
              viewBox="0 0 67 65"
              stroke="currentColor"
              strokeWidth="2"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M43.804 49.0942H39.772V47.9422C39.772 40.2622 43.74 35.7822 50.076 33.9262V33.2222C46.684 33.6702 42.844 33.9262 38.3 33.9262H4.89197V29.7022H38.3C42.844 29.7022 46.684 29.9582 50.076 30.4062V29.7022C43.74 27.8462 39.772 23.3662 39.772 15.6862V14.5342H43.804V15.4302C43.804 24.0702 49.564 30.2782 60.444 30.2782H61.212V33.3502H60.444C49.564 33.3502 43.804 39.6222 43.804 48.2622V49.0942Z"
                fill="currentColor"
              />
            </svg>
          </Link>
        </div>
      </section>
    </div>
  );
};

export default ContactSection;
