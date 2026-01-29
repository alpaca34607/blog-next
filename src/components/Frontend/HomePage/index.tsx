"use client";
import React, { useState } from "react";
import Hero from "./homeSection/Hero";
import IntroSection from "./homeSection/IntroSection";
import ServiceSection from "./homeSection/ServiceSection";
import VideoModal from "./homeSection/VideoModal";
import NewsSection from "./homeSection/NewsSection";
import ContactSection from "./homeSection/ContactSection";
import PartnerSection from "./homeSection/PartnerSection";
import Footer from "../Components/Footer";
import styles from "./index.module.scss";

const HomePage = () => {
  const [isVideoModalOpen, setIsVideoModalOpen] = useState(false);
  const [videoUrl, setVideoUrl] = useState("");

  const handleVideoOpen = (url: string) => {
    setVideoUrl(url);
    setIsVideoModalOpen(true);
  };

  const handleVideoClose = () => {
    setIsVideoModalOpen(false);
    setVideoUrl("");
  };

  return (
    <div className={styles.wrapper}>
      <Hero />
      <IntroSection />
      <ServiceSection onVideoOpen={handleVideoOpen} />
      <VideoModal
        isOpen={isVideoModalOpen}
        videoUrl={videoUrl}
        onClose={handleVideoClose}
      />
      <NewsSection />
      <ContactSection />
      <PartnerSection />
    </div>
  );
};

export default HomePage;
