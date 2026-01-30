"use client";

import React, { useEffect, useRef, useState } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

import { cn } from "@/utils/cn";
import { heroAnimations } from "@/utils/gsapAnimations";
import styles from "./Hero.module.scss";
import { accentOrange } from "@/styles/theme";

// 註冊 ScrollTrigger 插件
if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger);
}

// Marquee data
const marqueeTexts = [
  {
    id: 1,
    text: "模板快速上線 · 版面一致好維護",
    color: accentOrange,
  },

  {
    id: 2,
    text: "後台輕鬆管理 · 內容更新像寫部落格",
    color: "",
  },
];

declare global {
  interface Window {
    particlesJS: any;
  }
}

const Hero = () => {
  const particlesRef = useRef<HTMLDivElement>(null);
  const [isParticlesLoaded, setIsParticlesLoaded] = useState(false);
  const leftContentRef = useRef<HTMLDivElement>(null);
  const spinnerContainerRef = useRef<HTMLDivElement>(null);
  const decoItemsRef = useRef<(HTMLDivElement | null)[]>([]);
  const bottomTaglineRef = useRef<HTMLDivElement>(null);
  const heroSectionRef = useRef<HTMLElement>(null);

  // 動態載入 particles.js
  useEffect(() => {
    if (typeof window === "undefined") return;

    const loadParticles = async () => {
      if (window.particlesJS && particlesRef.current) {
        try {
          window.particlesJS(particlesRef.current.id, {
            particles: {
              number: {
                value: 600,
                density: {
                  enable: true,
                  value_area: 4500,
                },
              },

              color: {
                value: "#ccc",
              },

              shape: {
                type: "circle",
                stroke: {
                  width: 0,
                  color: "#ccc",
                },

                polygon: {
                  nb_sides: 5,
                },

                image: {
                  src: "img/github.svg",
                  width: 100,
                  height: 100,
                },
              },

              opacity: {
                value: 1,
                random: false,
                anim: {
                  enable: false,
                  speed: 0.4,
                  opacity_min: 1,
                  sync: false,
                },
              },

              size: {
                value: 2,
                random: true,
                anim: {
                  enable: true,
                  speed: 0.5,
                  size_min: 0.5,
                  sync: true,
                },
              },

              line_linked: {
                enable: true,
                distance: 175,
                color: "#ccc",
                opacity: 1,
                width: 1,
              },

              move: {
                enable: true,
                speed: 0.15,
                direction: "top",
                random: false,
                straight: false,
                out_mode: "out",
                bounce: false,
                attract: {
                  enable: false,
                  rotateX: 200,
                  rotateY: 200,
                },
              },
            },

            interactivity: {
              detect_on: "canvas",
              events: {
                onhover: {
                  enable: true,
                  mode: "grab",
                },

                onclick: {
                  enable: true,
                  mode: "repulse",
                },

                resize: true,
              },

              modes: {
                grab: {
                  distance: 250,
                  line_linked: {
                    opacity: 1,
                  },
                },

                bubble: {
                  distance: 400,
                  size: 40,
                  duration: 2,
                  opacity: 8,
                  speed: 5,
                },

                repulse: {
                  distance: 350,
                  duration: 6,
                },

                push: {
                  particles_nb: 4,
                },

                remove: {
                  particles_nb: 2,
                },
              },
            },

            retina_detect: false,
          });
          setIsParticlesLoaded(true);
        } catch (error) {
          console.error("Error initializing particles.js:", error);
        }
      }
    };

    // Load particles.js script if not already loaded
    if (!window.particlesJS) {
      const script = document.createElement("script");
      script.src =
        "https://cdn.jsdelivr.net/particles.js/2.0.0/particles.min.js";
      script.async = true;

      script.onload = () => {
        loadParticles();
      };
      document.head.appendChild(script);
    } else {
      loadParticles();
    }

    return () => {
      // 清理資源（如需要）
    };
  }, []);

  // 使用 GSAP 處理滾動動畫
  useEffect(() => {
    if (typeof window === "undefined") return;
    if (!heroSectionRef.current) return;

    const windowHeight = window.innerHeight;
    const heroFadeStartPoint = windowHeight * 0.2;
    const heroFadeEndPoint = windowHeight * 0.6;

    // 建立 ScrollTrigger 來監聽滾動
    const scrollTrigger = ScrollTrigger.create({
      trigger: document.body,
      start: `top -${heroFadeStartPoint}px`,
      end: `top -${heroFadeEndPoint}px`,
      onUpdate: (self) => {
        const progress = self.progress;

        // 當進度超過 0.8 時，套用淡出動畫
        if (progress > 0.8) {
          // 淡出左側內容
          heroAnimations.leftContentFadeOut(leftContentRef.current);

          // 淡出右側 spinner
          heroAnimations.spinnerFadeOut(spinnerContainerRef.current);

          // 淡出裝飾元素
          heroAnimations.decoItemsFadeOut(decoItemsRef.current);

          // 淡出底部標籤
          heroAnimations.bottomTaglineFadeOut(bottomTaglineRef.current);

          // 淡出整個 hero section
          heroAnimations.heroSectionFadeOut(heroSectionRef.current);
        } else {
          // 淡入左側內容
          heroAnimations.leftContentFadeIn(leftContentRef.current);

          // 淡入右側 spinner
          heroAnimations.spinnerFadeIn(spinnerContainerRef.current);

          // 淡入裝飾元素
          heroAnimations.decoItemsFadeIn(decoItemsRef.current);

          // 淡入底部標籤
          heroAnimations.bottomTaglineFadeIn(bottomTaglineRef.current);

          // 淡入整個 hero section
          heroAnimations.heroSectionFadeIn(heroSectionRef.current);
        }
      },
    });

    return () => {
      scrollTrigger.kill();
    };
  }, []);

  return (
    <div className={styles.heroSectionWrapper}>
      <section ref={heroSectionRef} className={styles.heroSection}>
        <div className={styles.sectionContainer}>
          <div ref={leftContentRef} className={styles.leftContent}>
            <div className={styles.heroContent}>
              <h1 className={styles.heroTitle}>
                Built For
                <span className={styles.heroTitleEm}>Your Brand Story!</span>
              </h1>
              <h2 className={styles.heroSubtitleEn}>
                Simple · Clean · Template-ready
              </h2>
              <p className={styles.heroSubtitleCn}>
                輕鬆打造專屬於您的形象網頁
              </p>
              <div className={styles.ctaGroup}>
                <button className={styles.shinyCta}>立即諮詢</button>
              </div>
            </div>
          </div>
          <div ref={spinnerContainerRef} className={styles.spinnerContainer}>
            <div
              id="particles-js"
              ref={particlesRef}
              className={styles.particlesContainer}
            />
            <div className={styles.spinnerBox}>
              <div className={styles.leoBorder1}>
                <svg
                  id="triangle-orange"
                  width="100%"
                  height="100%"
                  viewBox="-3 -4 39 39"
                >
                  <polygon
                    fill={accentOrange}
                    stroke="#333333"
                    strokeWidth="0"
                    points="16,4.288 32,32 0,32"
                  />
                </svg>
              </div>
              <div className={styles.leoBorder2}>
                <svg
                  id="triangle"
                  width="100%"
                  height="100%"
                  viewBox="-3 -4 39 39"
                >
                  <polygon
                    fill="none"
                    stroke="#2a2a2a"
                    strokeWidth="0.3"
                    points="16,4.288 32,32 0,32"
                  />
                </svg>
              </div>
            </div>
          </div>
          <div className={styles.techDeco}>
            <div
              ref={(el) => {
                decoItemsRef.current[0] = el;
              }}
              className={styles.decoItem}
              style={{
                top: "20%",
                left: "10%",
              }}
            >
              <span className={styles.decoText}>TEMPLATES</span>
              <div className={styles.decoLine} />
            </div>
            <div
              ref={(el) => {
                decoItemsRef.current[1] = el;
              }}
              className={styles.decoItem}
              style={{
                top: "80%",
                right: "20%",
                alignItems: "flex-start",
              }}
            >
              <span className={styles.decoText}>MINIMAL</span>
              <div className={styles.decoLineReverse} />
            </div>
            <div
              ref={(el) => {
                decoItemsRef.current[2] = el;
              }}
              className={styles.decoItem}
              style={{
                bottom: "10%",
                right: "30%",
              }}
            >
              <span className={styles.decoText}>MANAGEMENT</span>
              <div className={styles.decoLine} />
            </div>
          </div>
        </div>
        <div ref={bottomTaglineRef} className={styles.bottomTagline}>
          <div className={styles.marqueeContent}>
            {[0, 1, 2].map((trackIndex) => (
              <div
                key={trackIndex}
                className={cn(styles.marqueeTrack, "marquee-track")}
              >
                {[0, 1, 2, 3].map((repeat) =>
                  marqueeTexts.map((itemData, index) => (
                    <React.Fragment key={`${trackIndex}-${repeat}-${index}`}>
                      <span
                        className={styles.marqueeItem}
                        style={{
                          color:
                            itemData.color && itemData.color.trim() !== ""
                              ? itemData.color
                              : undefined,
                        }}
                      >
                        {itemData.text}
                      </span>
                      {index < marqueeTexts.length - 1 && (
                        <span
                          style={{
                            color: "#ababab",
                          }}
                        >
                          |
                        </span>
                      )}
                    </React.Fragment>
                  ))
                )}
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
};

export default Hero;
