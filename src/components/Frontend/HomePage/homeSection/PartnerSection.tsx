"use client";
import { useEffect, useRef } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useTranslations } from "next-intl";
import { partnersData, successCasesData } from "@/data/homePageData";
import { cn } from "@/utils/cn";
import { scrollTriggerAnimations } from "@/utils/gsapAnimations";
import styles from "./PartnerSection.module.scss";
import Image from "next/image";
import { Swiper, SwiperSlide } from "swiper/react";
import { Autoplay } from "swiper/modules";

// 註冊 ScrollTrigger 插件
if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger);
}

const PartnerSection = () => {
  const t = useTranslations("homePage");
  const group1Ref = useRef<HTMLDivElement>(null);
  const group2Ref = useRef<HTMLDivElement>(null);
  const moreRef = useRef<HTMLDivElement>(null);

  const normalizeImageSrc = (src?: string) => {
    if (typeof src !== "string") return null;
    const trimmed = src.trim();
    return trimmed.length > 0 ? trimmed : null;
  };

  useEffect(() => {
    const group1Element = group1Ref.current;
    const group2Element = group2Ref.current;
    const moreElement = moreRef.current;

    // 僅檢查 group1、group2（more 區塊可能被註解）
    if (!group1Element || !group2Element) return;

    // 使用 GSAP ScrollTrigger 實現淡入動畫（更早觸發，更快完成）
    scrollTriggerAnimations.fadeInOnScroll(group1Element, {
      start: "top 95%",
      end: "top 60%",
      once: true,
    });

    scrollTriggerAnimations.fadeInOnScroll(group2Element, {
      start: "top 95%",
      end: "top 60%",
      once: true,
    });

    if (moreElement) {
      scrollTriggerAnimations.fadeInOnScroll(moreElement, {
        start: "top 95%",
        end: "top 60%",
        once: true,
      });
    }

    return () => {
      // ScrollTrigger 會在組件卸載時自動清理
    };
  }, []);

  return (
    <div id="partner-section-wrapper" className={styles.partnerSectionWrapper}>
      <section className={styles.partnerSection}>
        {/* 合作品牌輪播 */}
        <div ref={group1Ref} className={styles.group}>
          <div className={styles.title}>
            <h2>{t("partnerTitle")}</h2>
          </div>
          <div className={cn(styles.swiper, styles.partnerSwiper)}>
            <Swiper
              modules={[Autoplay]}
              slidesPerView={3}
              spaceBetween={40}
              loop={true}
              speed={3000}
              autoplay={{
                delay: 1,
                disableOnInteraction: false,
                pauseOnMouseEnter: false,
              }}
              breakpoints={{
                320: {
                  slidesPerView: 3,
                  spaceBetween: 20,
                },
                640: {
                  slidesPerView: 3,
                  spaceBetween: 30,
                },
                1024: {
                  slidesPerView: 3,
                  spaceBetween: 40,
                },
                1400: {
                  slidesPerView: 4,
                  spaceBetween: 50,
                },
              }}
            >
              {partnersData.map((partner) => (
                <SwiperSlide key={partner.id}>
                  <div className={styles.partnerItem}>
                    {(() => {
                      const imgSrc = normalizeImageSrc(partner.image);
                      if (!imgSrc) return null;
                      return (
                        <Image
                          src={imgSrc}
                          alt={partner.alt}
                          width={200}
                          height={120}
                        />
                      );
                    })()}
                    <p>{partner.name}</p>
                  </div>
                </SwiperSlide>
              ))}
            </Swiper>
          </div>
        </div>

        {/* 上線案例輪播 */}
        <div ref={group2Ref} className={styles.group}>
          <div className={styles.title}>
            <h2>{t("successCasesTitle")}</h2>
          </div>
          <div className={cn(styles.swiper, styles.successSwiper)}>
            <Swiper
              modules={[Autoplay]}
              slidesPerView={3}
              spaceBetween={40}
              loop={true}
              speed={3000}
              autoplay={{
                delay: 1,
                disableOnInteraction: false,
                pauseOnMouseEnter: false,
              }}
              style={{
                transform: "scaleX(-1)",
              }}
              breakpoints={{
                320: {
                  slidesPerView: 3,
                  spaceBetween: 20,
                },
                640: {
                  slidesPerView: 3,
                  spaceBetween: 30,
                },
                1024: {
                  slidesPerView: 3,
                  spaceBetween: 40,
                },
                1400: {
                  slidesPerView: 4,
                  spaceBetween: 50,
                },
              }}
            >
              {successCasesData.map((success) => (
                <SwiperSlide
                  key={success.id}
                  style={{ transform: "scaleX(-1)" }}
                >
                  <div className={styles.partnerItem}>
                    {(() => {
                      const imgSrc = normalizeImageSrc(success.image);
                      if (!imgSrc) return null;
                      return (
                        <Image
                          src={imgSrc}
                          alt={success.alt}
                          width={200}
                          height={120}
                        />
                      );
                    })()}
                    <p>{success.name}</p>
                  </div>
                </SwiperSlide>
              ))}
            </Swiper>
          </div>
        </div>

        {/* 更多合作品牌連結 */}
        {/* <div ref={moreRef} className={styles.more}>
          <a href="#" className={styles.link}>
            更多合作品牌
            <div className={styles.linkIconWrapper}>
              <svg
                className={styles.linkIcon}
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
            </div>
          </a>
        </div> */}
      </section>
    </div>
  );
};

export default PartnerSection;
