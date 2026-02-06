import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

// 註冊 ScrollTrigger 插件
if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger);
}

/**
 * 淡入淡出動畫配置
 */
export const fadeAnimations = {
  /**
   * 基礎淡入動畫
   */
  fadeIn: {
    from: {
      opacity: 0,
      y: 30,
    },
    to: {
      opacity: 1,
      y: 0,
      duration: 0.8,
      ease: "power2.out",
    },
  },

  /**
   * 基礎淡出動畫
   */
  fadeOut: {
    to: {
      opacity: 0,
      y: -30,
      duration: 0.8,
      ease: "power2.in",
    },
  },

  /**
   * 從左側淡入
   */
  fadeInFromLeft: {
    from: {
      opacity: 0,
      x: -100,
    },
    to: {
      opacity: 1,
      x: 0,
      duration: 0.8,
      ease: "power2.out",
    },
  },

  /**
   * 從右側淡入
   */
  fadeInFromRight: {
    from: {
      opacity: 0,
      x: 100,
    },
    to: {
      opacity: 1,
      x: 0,
      duration: 0.8,
      ease: "power2.out",
    },
  },

  /**
   * 向左淡出
   */
  fadeOutToLeft: {
    to: {
      opacity: 0,
      x: -100,
      duration: 0.8,
      ease: "power2.in",
    },
  },

  /**
   * 向右淡出
   */
  fadeOutToRight: {
    to: {
      opacity: 0,
      x: 100,
      duration: 0.8,
      ease: "power2.in",
    },
  },

  /**
   * 縮放淡入
   */
  fadeInScale: {
    from: {
      opacity: 0,
      scale: 0.8,
    },
    to: {
      opacity: 1,
      scale: 1,
      duration: 0.8,
      ease: "back.out(1.7)",
    },
  },

  /**
   * 縮放淡出
   */
  fadeOutScale: {
    to: {
      opacity: 0,
      scale: 0.8,
      duration: 0.8,
      ease: "back.in(1.7)",
    },
  },
};

/**
 * Hero Section 動畫
 */
export const heroAnimations = {
  /**
   * Hero 左側內容淡出
   */
  leftContentFadeOut: (element: HTMLElement | null) => {
    if (!element) return;
    gsap.to(element, {
      opacity: 0,
      x: -100,
      duration: 0.8,
      ease: "power2.in",
      pointerEvents: "none",
    });
  },

  /**
   * Hero 左側內容淡入
   */
  leftContentFadeIn: (element: HTMLElement | null) => {
    if (!element) return;
    gsap.to(element, {
      opacity: 1,
      x: 0,
      duration: 0.8,
      ease: "power2.out",
      pointerEvents: "auto",
    });
  },

  /**
   * Hero 右側 spinner 淡出
   */
  spinnerFadeOut: (element: HTMLElement | null) => {
    if (!element) return;
    gsap.to(element, {
      opacity: 0,
      x: 100,
      duration: 0.8,
      ease: "power2.in",
      pointerEvents: "none",
    });
  },

  /**
   * Hero 右側 spinner 淡入
   */
  spinnerFadeIn: (element: HTMLElement | null) => {
    if (!element) return;
    gsap.to(element, {
      opacity: 1,
      x: 0,
      duration: 0.8,
      ease: "power2.out",
      pointerEvents: "auto",
    });
  },

  /**
   * Hero 裝飾元素淡出
   */
  decoItemsFadeOut: (elements: (HTMLElement | null)[]) => {
    elements.forEach((element) => {
      if (element) {
        gsap.to(element, {
          opacity: 0,
          duration: 0.8,
          ease: "power2.in",
          pointerEvents: "none",
        });
      }
    });
  },

  /**
   * Hero 裝飾元素淡入
   */
  decoItemsFadeIn: (elements: (HTMLElement | null)[]) => {
    elements.forEach((element) => {
      if (element) {
        gsap.to(element, {
          opacity: 1,
          duration: 0.8,
          ease: "power2.out",
          pointerEvents: "auto",
        });
      }
    });
  },

  /**
   * Hero 底部標籤淡出
   */
  bottomTaglineFadeOut: (element: HTMLElement | null) => {
    if (!element) return;
    gsap.to(element, {
      opacity: 0,
      duration: 0.8,
      ease: "power2.in",
      pointerEvents: "none",
    });
  },

  /**
   * Hero 底部標籤淡入
   */
  bottomTaglineFadeIn: (element: HTMLElement | null) => {
    if (!element) return;
    gsap.to(element, {
      opacity: 1,
      duration: 0.8,
      ease: "power2.out",
      pointerEvents: "auto",
    });
  },

  /**
   * Hero 整個 section 淡出
   */
  heroSectionFadeOut: (element: HTMLElement | null) => {
    if (!element) return;
    gsap.to(element, {
      opacity: 0,
      visibility: "hidden",
      duration: 1.5,
      ease: "power2.in",
      pointerEvents: "none",
    });
  },

  /**
   * Hero 整個 section 淡入
   */
  heroSectionFadeIn: (element: HTMLElement | null) => {
    if (!element) return;
    gsap.to(element, {
      opacity: 1,
      visibility: "visible",
      duration: 1.5,
      ease: "power2.out",
      pointerEvents: "auto",
    });
  },
};

/**
 * Intro Section 動畫
 */
export const introAnimations = {
  /**
   * Intro Section 淡入
   */
  introSectionFadeIn: (element: HTMLElement | null) => {
    if (!element) return;
    gsap.to(element, {
      opacity: 1,
      visibility: "visible",
      duration: 0.8,
      ease: "power2.out",
      pointerEvents: "auto",
    });
  },

  /**
   * Intro Section 淡出
   */
  introSectionFadeOut: (element: HTMLElement | null) => {
    if (!element) return;
    gsap.to(element, {
      opacity: 0,
      visibility: "hidden",
      duration: 0.8,
      ease: "power2.in",
      pointerEvents: "none",
    });
  },

  /**
   * 左側元素淡入
   */
  leftElementsFadeIn: (element: HTMLElement | null) => {
    if (!element) return;
    gsap.fromTo(
      element,
      {
        opacity: 0,
        x: -50,
      },
      {
        opacity: 1,
        x: 0,
        duration: 0.8,
        ease: "power2.out",
      }
    );
  },

  /**
   * 左側元素淡出
   */
  leftElementsFadeOut: (element: HTMLElement | null) => {
    if (!element) return;
    gsap.to(element, {
      opacity: 0,
      x: -50,
      duration: 0.8,
      ease: "power2.in",
    });
  },

  /**
   * 右側元素淡入
   */
  rightElementsFadeIn: (element: HTMLElement | null) => {
    if (!element) return;
    gsap.fromTo(
      element,
      {
        opacity: 0,
        x: 50,
      },
      {
        opacity: 1,
        x: 0,
        duration: 0.8,
        ease: "power2.out",
      }
    );
  },

  /**
   * 右側元素淡出
   */
  rightElementsFadeOut: (element: HTMLElement | null) => {
    if (!element) return;
    gsap.to(element, {
      opacity: 0,
      x: 50,
      duration: 0.8,
      ease: "power2.in",
    });
  },

  /**
   * 縮放元素淡入
   */
  scaleElementFadeIn: (element: HTMLElement | null) => {
    if (!element) return;
    gsap.fromTo(
      element,
      {
        opacity: 0,
        scale: 0.9,
      },
      {
        opacity: 1,
        scale: 1,
        duration: 0.8,
        ease: "back.out(1.7)",
      }
    );
  },

  /**
   * 縮放元素淡出
   */
  scaleElementFadeOut: (element: HTMLElement | null) => {
    if (!element) return;
    gsap.to(element, {
      opacity: 0,
      scale: 0.9,
      duration: 0.8,
      ease: "back.in(1.7)",
    });
  },

  /**
   * 文字元素淡入（帶延遲）
   */
  textElementFadeIn: (element: HTMLElement | null, delay: number = 0) => {
    if (!element) return;
    gsap.fromTo(
      element,
      {
        opacity: 0,
        y: 20,
      },
      {
        opacity: 1,
        y: 0,
        duration: 0.8,
        delay,
        ease: "power2.out",
      }
    );
  },

  /**
   * 文字元素淡出
   */
  textElementFadeOut: (element: HTMLElement | null) => {
    if (!element) return;
    gsap.to(element, {
      opacity: 0,
      y: -20,
      duration: 0.8,
      ease: "power2.in",
    });
  },
};

/**
 * 通用 ScrollTrigger 動畫
 */
export const scrollTriggerAnimations = {
  /**
   * 使用 ScrollTrigger 建立淡入動畫
   */
  fadeInOnScroll: (
    element: HTMLElement | null,
    options?: {
      start?: string;
      end?: string;
      trigger?: string | HTMLElement;
      once?: boolean;
    }
  ) => {
    if (!element || typeof window === "undefined") return;

    const {
      start = "top 95%",
      end = "top 60%",
      trigger = element,
      once = true,
    } = options || {};

    gsap.fromTo(
      element,
      {
        opacity: 0,
        y: 50,
      },
      {
        opacity: 1,
        y: 0,
        duration: 0.6,
        ease: "power2.out",
        scrollTrigger: {
          trigger,
          start,
          end,
          toggleActions: once
            ? "play none none none"
            : "play none reverse none",
        },
      }
    );
  },

  /**
   * 使用 ScrollTrigger 建立從左側淡入動畫
   */
  fadeInFromLeftOnScroll: (
    element: HTMLElement | null,
    options?: {
      start?: string;
      end?: string;
      trigger?: string | HTMLElement;
      once?: boolean;
    }
  ) => {
    if (!element || typeof window === "undefined") return;

    const {
      start = "top 95%",
      end = "top 60%",
      trigger = element,
      once = true,
    } = options || {};

    gsap.fromTo(
      element,
      {
        opacity: 0,
        x: -100,
      },
      {
        opacity: 1,
        x: 0,
        duration: 0.6,
        ease: "power2.out",
        scrollTrigger: {
          trigger,
          start,
          end,
          toggleActions: once
            ? "play none none none"
            : "play none reverse none",
        },
      }
    );
  },

  /**
   * 使用 ScrollTrigger 建立從右側淡入動畫
   */
  fadeInFromRightOnScroll: (
    element: HTMLElement | null,
    options?: {
      start?: string;
      end?: string;
      trigger?: string | HTMLElement;
      once?: boolean;
    }
  ) => {
    if (!element || typeof window === "undefined") return;

    const {
      start = "top 95%",
      end = "top 60%",
      trigger = element,
      once = true,
    } = options || {};

    gsap.fromTo(
      element,
      {
        opacity: 0,
        x: 100,
      },
      {
        opacity: 1,
        x: 0,
        duration: 0.6,
        ease: "power2.out",
        scrollTrigger: {
          trigger,
          start,
          end,
          toggleActions: once
            ? "play none none none"
            : "play none reverse none",
        },
      }
    );
  },

  /**
   * 使用 ScrollTrigger 建立縮放淡入動畫
   */
  fadeInScaleOnScroll: (
    element: HTMLElement | null,
    options?: {
      start?: string;
      end?: string;
      trigger?: string | HTMLElement;
      once?: boolean;
    }
  ) => {
    if (!element || typeof window === "undefined") return;

    const {
      start = "top 95%",
      end = "top 60%",
      trigger = element,
      once = true,
    } = options || {};

    gsap.fromTo(
      element,
      {
        opacity: 0,
        scale: 0.8,
      },
      {
        opacity: 1,
        scale: 1,
        duration: 0.6,
        ease: "back.out(1.7)",
        scrollTrigger: {
          trigger,
          start,
          end,
          toggleActions: once
            ? "play none none none"
            : "play none reverse none",
        },
      }
    );
  },
};

/**
 * 清理 ScrollTrigger 實例
 */
export const cleanupScrollTriggers = () => {
  if (typeof window !== "undefined") {
    ScrollTrigger.getAll().forEach((trigger) => trigger.kill());
  }
};
