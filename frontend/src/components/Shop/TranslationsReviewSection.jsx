import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import { IoIosArrowDown, IoIosArrowUp } from "react-icons/io";
import { MdTranslate, MdCheckCircle, MdEdit } from "react-icons/md";
import axios from "axios";
import { toast } from "react-toastify";

const TranslationsReviewSection = ({
  model = "product", // "product" | "lands" | "shop"
  documentId = null,
  initialTranslations = { en: {}, hi: {}, mr: {} },
  sourceName = "",
  sourceDescription = "",
  onTranslationsChange = null,
}) => {
  const { t } = useTranslation();
  const [isOpen, setIsOpen] = useState(false);
  const [activeTab, setActiveTab] = useState("hi"); // "hi" | "mr"
  const [translations, setTranslations] = useState({
    hi: {
      name: initialTranslations.hi?.name || "",
      description: initialTranslations.hi?.description || "",
    },
    mr: {
      name: initialTranslations.mr?.name || "",
      description: initialTranslations.mr?.description || "",
    },
  });
  const [saving, setSaving] = useState(false);

  const handleFieldChange = (lang, field, value) => {
    const updated = {
      ...translations,
      [lang]: {
        ...translations[lang],
        [field]: value,
      },
    };
    setTranslations(updated);
    if (onTranslationsChange) {
      onTranslationsChange(updated);
    }
  };

  const handleSaveTranslation = async (lang) => {
    if (!documentId) {
      toast.info("Translations will be saved when the listing is submitted.");
      return;
    }

    setSaving(true);
    try {
      const res = await axios.put(
        `http://localhost:8000/api/translations/${model}/${documentId}/${lang}`,
        {
          fields: translations[lang],
        },
        { withCredentials: true }
      );

      if (res.data.success) {
        toast.success(
          `Translation for ${lang === "hi" ? "Hindi (हिन्दी)" : "Marathi (मराठी)"} updated!`
        );
      }
    } catch (err) {
      toast.error(
        err.response?.data?.message || "Failed to update manual translation."
      );
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="w-full my-4 border border-emerald-200 rounded-lg bg-emerald-50/40 overflow-hidden shadow-xs">
      {/* Collapsible Header */}
      <div
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between p-3.5 bg-emerald-100/60 hover:bg-emerald-100 cursor-pointer transition select-none"
      >
        <div className="flex items-center gap-2">
          <MdTranslate size={20} className="text-emerald-700" />
          <h4 className="text-sm font-semibold text-emerald-950">
            {t("shop.multilingualTranslations", {
              defaultValue: "Multilingual Translations (Hindi & Marathi)",
            })}
          </h4>
          <span className="text-xs bg-emerald-200 text-emerald-800 px-2 py-0.5 rounded-full font-medium ml-1">
            Gemini AI
          </span>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs text-emerald-700 hidden sm:inline">
            {isOpen ? t("common.collapse", "Collapse") : t("common.reviewEdit", "Review & Edit")}
          </span>
          {isOpen ? (
            <IoIosArrowUp className="text-emerald-800" size={18} />
          ) : (
            <IoIosArrowDown className="text-emerald-800" size={18} />
          )}
        </div>
      </div>

      {/* Collapsed Body */}
      {isOpen && (
        <div className="p-4 bg-white border-t border-emerald-100">
          <p className="text-xs text-slate-500 mb-3">
            {t(
              "shop.translationNote",
              "Krushak AI automatically translates your listings into Hindi and Marathi so buyers across India can discover your crops. You can review and correct the translations below."
            )}
          </p>

          {/* Language Tabs */}
          <div className="flex border-b border-slate-200 mb-4">
            <button
              type="button"
              onClick={() => setActiveTab("hi")}
              className={`py-2 px-4 text-xs font-semibold border-b-2 flex items-center gap-1.5 transition ${
                activeTab === "hi"
                  ? "border-emerald-600 text-emerald-700"
                  : "border-transparent text-slate-500 hover:text-slate-800"
              }`}
            >
              <span>हिंदी (Hindi)</span>
              {translations.hi.name && (
                <MdCheckCircle size={14} className="text-emerald-600" />
              )}
            </button>
            <button
              type="button"
              onClick={() => setActiveTab("mr")}
              className={`py-2 px-4 text-xs font-semibold border-b-2 flex items-center gap-1.5 transition ${
                activeTab === "mr"
                  ? "border-emerald-600 text-emerald-700"
                  : "border-transparent text-slate-500 hover:text-slate-800"
              }`}
            >
              <span>मराठी (Marathi)</span>
              {translations.mr.name && (
                <MdCheckCircle size={14} className="text-emerald-600" />
              )}
            </button>
          </div>

          {/* Active Tab Form */}
          <div className="space-y-3">
            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">
                {activeTab === "hi" ? "उत्पाद / शीर्षक का नाम (Hindi)" : "उत्पादन / जमिनीचे नाव (Marathi)"}
              </label>
              <input
                type="text"
                value={translations[activeTab].name}
                onChange={(e) =>
                  handleFieldChange(activeTab, "name", e.target.value)
                }
                placeholder={
                  sourceName
                    ? `Translation for: "${sourceName}"`
                    : "Translated title..."
                }
                className="w-full px-3 py-1.5 text-sm border border-slate-300 rounded focus:outline-none focus:ring-1 focus:ring-emerald-500 font-devanagari"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">
                {activeTab === "hi" ? "विवरण (Hindi Description)" : "तपशील (Marathi Description)"}
              </label>
              <textarea
                rows={3}
                value={translations[activeTab].description}
                onChange={(e) =>
                  handleFieldChange(activeTab, "description", e.target.value)
                }
                placeholder={
                  sourceDescription
                    ? `Translation for description...`
                    : "Translated description..."
                }
                className="w-full px-3 py-1.5 text-sm border border-slate-300 rounded focus:outline-none focus:ring-1 focus:ring-emerald-500 font-devanagari"
              />
            </div>

            {documentId && (
              <div className="flex justify-end pt-1">
                <button
                  type="button"
                  disabled={saving}
                  onClick={() => handleSaveTranslation(activeTab)}
                  className="inline-flex items-center gap-1.5 text-xs bg-emerald-600 hover:bg-emerald-700 text-white font-medium px-3.5 py-1.5 rounded transition shadow-xs disabled:opacity-50"
                >
                  <MdEdit size={14} />
                  {saving
                    ? t("common.saving", "Saving...")
                    : t("common.saveTranslation", `Save ${activeTab.toUpperCase()} Translation`)}
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default TranslationsReviewSection;
