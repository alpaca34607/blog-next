"use client";
import { useEffect } from "react";

/**
 * 组件：页面刷新时自动滚动到顶部
 * 这个组件会在页面加载时确保滚动位置在顶部
 */
const ScrollToTop = () => {
  useEffect(() => {
    // 页面刷新时滚动到顶部
    if (typeof window !== "undefined") {
      window.scrollTo(0, 0);
    }
  }, []);

  return null;
};

export default ScrollToTop;
