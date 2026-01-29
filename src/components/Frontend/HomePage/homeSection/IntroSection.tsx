"use client";
import { useEffect, useRef, useState } from "react";
import { cn } from "@/utils/cn";
import styles from "./IntroSection.module.scss";
import ClipPathBtn from "../../Components/ClipPathBtn";

const IntroSection = () => {
  const wrapperRef = useRef<HTMLDivElement>(null);
  const [isSticky, setIsSticky] = useState(false);
  const [opacity, setOpacity] = useState(0);
  const [animationProgress, setAnimationProgress] = useState(0);
  const [isFadeOut, setIsFadeOut] = useState(false);
  const rafIdRef = useRef<number | null>(null);

  useEffect(() => {
    if (typeof window === "undefined") return;

    const calculateState = () => {
      if (!wrapperRef.current) return;

      const scrollY = window.scrollY || window.pageYOffset;
      const windowHeight = window.innerHeight;
      const wrapperTop = wrapperRef.current.offsetTop;
      const wrapperHeight = wrapperRef.current.offsetHeight;

      if (scrollY >= wrapperTop) {
        setIsSticky(true);

        const scrollInWrapper = scrollY - wrapperTop;
        const maxScroll = wrapperHeight - windowHeight;

        // 調整動畫範圍：數值越大，代表需要滾動越多距離才讓動畫跑完（淡出會更晚發生）
        const animationRange = windowHeight * 1.2;
        const progress = Math.min(
          1,
          Math.max(0, scrollInWrapper / animationRange)
        );

        setAnimationProgress(progress);
        setOpacity(progress > 0 ? 1 : 0);

        // 調整淡出開始的時間點：數值越接近 1，內容越晚才開始淡出
        setIsFadeOut(progress > 0.9);

        if (scrollY > wrapperTop + maxScroll) {
          setIsSticky(false);
        }
      } else {
        setIsSticky(false);
        setOpacity(0);
        setAnimationProgress(0);
        setIsFadeOut(false);
      }
    };

    const handleScroll = () => {
      if (rafIdRef.current) {
        cancelAnimationFrame(rafIdRef.current);
      }
      rafIdRef.current = requestAnimationFrame(calculateState);
    };

    calculateState();
    window.addEventListener("scroll", handleScroll, { passive: true });

    return () => {
      window.removeEventListener("scroll", handleScroll);
      if (rafIdRef.current) {
        cancelAnimationFrame(rafIdRef.current);
      }
    };
  }, []);

  const leftElementsActive = animationProgress > 0.1;
  const rightElementsActive = animationProgress > 0.1;
  const scaleElementActive = animationProgress > 0.15;
  const greetingH2Active = animationProgress > 0.2;
  const greetingH3Active = animationProgress > 0.35;
  const greetingPActive = animationProgress > 0.5;

  return (
    <div ref={wrapperRef} className={styles.introSectionWrapper}>
      <section
        className={styles.introSection}
        style={{
          position: isSticky ? "sticky" : "relative",
          opacity: opacity,
          visibility: opacity > 0 ? "visible" : "hidden",
          pointerEvents: opacity > 0 ? "auto" : "none",
        }}
      >
        <div className={styles.contentWrapper}>
          <ul
            className={cn(
              styles.productContainer,
              leftElementsActive && !isFadeOut && styles.active,
              isFadeOut && styles.fadeOut
            )}
          >
            <li className={styles.socialIcon}>
              <i className="fa-solid fa-cloud" style={{ fontSize: "20px" }} />
              雲端後台，一站式管理
            </li>
            <li className={styles.socialIcon}>
              <i className="fa-solid fa-video" style={{ fontSize: "20px" }} />
              模板套用，快速上線
            </li>
            <li className={styles.socialIcon}>
              <i className="fa-solid fa-brain" style={{ fontSize: "20px" }} />
              文章與頁面，輕鬆編輯
            </li>
          </ul>

          <ClipPathBtn
            className={cn(
              styles.moreAboutBtn,
              rightElementsActive && !isFadeOut && styles.active,
              isFadeOut && styles.fadeOut
            )}
            showArrow={true}
          >
            了解方案特色
          </ClipPathBtn>

          <p
            className={cn(
              styles.coords,
              leftElementsActive && !isFadeOut && styles.active,
              isFadeOut && styles.fadeOut
            )}
          >
            N 25° 3' 29.084" / E 121° 32' 49.210"
          </p>

          <div
            className={cn(
              styles.ellipsesContainer,
              scaleElementActive && !isFadeOut && styles.active,
              isFadeOut && styles.fadeOut
            )}
          >
            <div className={styles.greeting}>
              <h2
                className={cn(
                  styles.greetingH2,
                  greetingH2Active && !isFadeOut && styles.active,
                  isFadeOut && styles.fadeOut
                )}
              >
                輕鬆經營品牌內容
              </h2>
              <h3
                className={cn(
                  styles.greetingH3,
                  greetingH3Active && !isFadeOut && styles.active,
                  isFadeOut && styles.fadeOut
                )}
              >
                專為客戶打造部落格式形象網頁
                <br />
                直觀操作，長期更新的好選擇
              </h3>
              <p
                className={cn(
                  styles.greetingP,
                  greetingPActive && !isFadeOut && styles.active,
                  isFadeOut && styles.fadeOut
                )}
              >
                圖文說明、文章列表、產品展示皆可快速建立
                <br />
                更新內容不必改程式，管理介面直覺便利
              </p>
            </div>
            <div className={cn(styles.ellipses, styles.ellipsesOuterThin)}>
              <div className={cn(styles.ellipses, styles.ellipsesOrbit)} />
            </div>
            <div className={cn(styles.ellipses, styles.ellipsesOuterThick)} />
          </div>

          <div
            className={cn(
              styles.scroller,
              rightElementsActive && !isFadeOut && styles.active,
              isFadeOut && styles.fadeOut
            )}
          >
            <p className={styles.pageTitle}>About Us</p>
            <div className={styles.timeline}>
              <span className={styles.timelineUnit} />
              <span className={cn(styles.timelineUnit, styles.active)} />
              <span className={styles.timelineUnit} />
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default IntroSection;
