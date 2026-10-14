import React, { useState } from "react";
import Footer from "../components/Layout/Footer";
import Header from "../components/Layout/Header";
import styles from "../styles/styles";
import { useTranslation } from "react-i18next";

const FAQPage = () => {
  return (
    <div>
      <Header activeHeading={6} />
      <Faq />
      <Footer />
    </div>
  );
};

const Faq = () => {
  const { t } = useTranslation();
  const [activeTab, setActiveTab] = useState(null);

  const toggleTab = (tab) => {
    setActiveTab(activeTab === tab ? null : tab);
  };

  const faqItems = [
    { q: t("faq.q1"), a: t("faq.a1") },
    { q: t("faq.q2"), a: t("faq.a2") },
    { q: t("faq.q3"), a: t("faq.a3") },
    { q: t("faq.q4"), a: t("faq.a4") },
    { q: t("faq.q5"), a: t("faq.a5") },
    { q: t("faq.q6"), a: t("faq.a6") },
  ];

  return (
    <div className={`${styles.section} my-8`}>
      <h2 className="text-3xl font-bold text-gray-900 mb-8">{t("faq.title")}</h2>
      <div className="mx-auto space-y-4">
        {faqItems.map((item, index) => (
          <div className="border-b border-gray-200 pb-4" key={index}>
            <button
              className="flex items-center justify-between w-full text-left"
              onClick={() => toggleTab(index)}
            >
              <span className="text-lg font-medium text-gray-900">
                {item.q}
              </span>
              {activeTab === index ? (
                <svg
                  className="h-6 w-6 text-gray-500 flex-shrink-0"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              ) : (
                <svg
                  className="h-6 w-6 text-gray-500 flex-shrink-0"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 5l7 7-7 7"
                  />
                </svg>
              )}
            </button>
            {activeTab === index && (
              <div className="mt-4">
                <p className="text-base text-gray-500">
                  {item.a}
                </p>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default FAQPage;
