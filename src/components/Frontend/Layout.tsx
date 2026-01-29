"use client";
import { useState, useEffect } from "react";
import Header from "./Components/Header";
import Loading from "./HomePage/homeSection/Loading";
import GoTopButton from "./Components/GoTopButton";
import styles from "./Layout.module.scss";
import Footer from "./Components/Footer";

interface LayoutProps {
  children: React.ReactNode;
}

const Layout = ({ children }: LayoutProps) => {
  const [windowSize, setWindowSize] = useState<[number, number]>([
    typeof window !== "undefined" ? window.innerWidth : 1920,
    typeof window !== "undefined" ? window.innerHeight : 1080,
  ]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (typeof window === "undefined") return;

    const handleWindowResize = () => {
      setWindowSize([window.innerWidth, window.innerHeight]);
    };

    window.addEventListener("resize", handleWindowResize);

    return () => {
      window.removeEventListener("resize", handleWindowResize);
    };
  }, []);

  useEffect(() => {
    refreshViewHeight();
  }, []);

  useEffect(() => {
    refreshViewHeight();
  }, [windowSize[0]]);

  const refreshViewHeight = () => {
    if (typeof window === "undefined") return;
    const vh = windowSize[1] * 0.01;
    document.documentElement.style.setProperty("--vh", `${vh}px`);
  };

  const handleLoadingComplete = () => {
    setIsLoading(false);
    if (typeof document !== "undefined") {
      document.body.style.overflowY = "auto";
    }
  };

  useEffect(() => {
    if (typeof document === "undefined") return;

    if (isLoading) {
      document.body.style.overflowY = "hidden";
    } else {
      document.body.style.overflowY = "auto";
    }

    return () => {
      document.body.style.overflowY = "auto";
    };
  }, [isLoading]);

  return (
    <div className={styles.layoutContainer}>
      {isLoading && <Loading onLoadingComplete={handleLoadingComplete} />}
      <div
        className={styles.contentWrapper}
        style={{ opacity: isLoading ? 0 : 1 }}
      >
        {!isLoading && <Header />}
        {children}
        <Footer />
      </div>
      <GoTopButton />
    </div>
  );
};

export default Layout;
