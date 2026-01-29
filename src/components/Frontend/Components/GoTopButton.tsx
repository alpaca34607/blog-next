"use client";
import { useState, useEffect } from "react";
import { MdKeyboardDoubleArrowUp } from "react-icons/md";
import styles from "./GoTopButton.module.scss";

const GoTopButton = () => {
  const [isVisible, setIsVisible] = useState(false);
  const [isClicked, setIsClicked] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      const windowHeight = window.innerHeight;
      const scrollTop =
        window.pageYOffset || document.documentElement.scrollTop;

      if (scrollTop > windowHeight) {
        setIsVisible(true);
      } else {
        setIsVisible(false);
      }
    };

    window.addEventListener("scroll", handleScroll);
    // 初始化检查
    handleScroll();

    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, []);

  const handleClick = () => {
    setIsClicked(true);

    // 滚动到顶部
    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });

    // 动画结束后移除类，以便下次点击可以再次触发
    setTimeout(() => {
      setIsClicked(false);
    }, 1600);
  };

  return (
    <div
      className={`${styles.goTopBtn} ${isVisible ? styles.show : ""} ${
        isClicked ? styles.clicked : ""
      }`}
      onClick={handleClick}
    >
      <svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
        {/* 外圓 (完整圓圈) */}
        <circle className={styles.circleOuter} cx="50" cy="50" r="23.9" />
        {/* 中圓 (虛線圓圈) */}
        <circle className={styles.circleMiddle} cx="50" cy="50" r="22.3" />
        {/* 內圓 (虛線圓圈，初始隱藏) */}
        <circle className={styles.circleInner} cx="50" cy="50" r="27.1" />
      </svg>
      <MdKeyboardDoubleArrowUp className={styles.goTopIcon} />
    </div>
  );
};

export default GoTopButton;
