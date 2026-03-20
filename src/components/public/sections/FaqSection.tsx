"use client";

import { useState } from "react";
import styles from "./FaqSection.module.scss";
import { useLocale } from "next-intl";
import { getSectionStyle } from "@/utils/sectionStyles";

interface FaqSectionProps {
  section: {
    title?: string;
    titleEn?: string;
    subtitle?: string;
    subtitleEn?: string;
    settings?: {
      backgroundColor?: string;
      backgroundImage?: string;
      templateVarient?: string;
      faqs?: FaqItem[];
    };
  };
}

interface FaqItem {
  question?: string;
  questionEn?: string;
  answer?: string;
  answerEn?: string;
}

const FaqSection = ({ section }: FaqSectionProps) => {
  const [openIndex, setOpenIndex] = useState<number | null>(null);
  const faqs = section.settings?.faqs ?? [];
  const locale = useLocale();
  const isEn = locale === "en";
  const title = (isEn ? section.titleEn : section.title) || section.title;
  const subtitle =
    (isEn ? section.subtitleEn : section.subtitle) || section.subtitle;

  const { style: sectionStyle, className: backgroundImageClass } =
    getSectionStyle({
      backgroundColor: section.settings?.backgroundColor,
      backgroundImage: section.settings?.backgroundImage,
    });

  return (
    <section
      className={`${styles.faqSection} ${backgroundImageClass ? styles.hasBgImage : ""}`}
      style={sectionStyle}
    >
      <div className={styles.container}>
        <div className={styles.header}>
          <h2 className={styles.title}>{title}</h2>
          <p className={styles.subtitle}>{subtitle}</p>
        </div>
        {faqs.length > 0 && (
          <div className={styles.faqContent}>
            {faqs.map((faq, index) => (
              <div
                className={styles.faqItem}
                key={index}
                onClick={() =>
                  setOpenIndex((prev) => (prev === index ? null : index))
                }
              >
                <div className={styles.questionLabel}>
                  {(isEn ? faq.questionEn : faq.question) || faq.question}
                </div>
                {openIndex === index && (
                  <div className={styles.answerLabel}>
                    {(isEn ? faq.answerEn : faq.answer) || faq.answer}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
};

export default FaqSection;
