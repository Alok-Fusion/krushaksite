import React from "react";
import { useTranslation } from "react-i18next";
import { MdTranslate } from "react-icons/md";

const TranslationBadge = ({
  isTranslated,
  sourceLang,
  onToggle,
  isOriginalShown = false,
  className = "",
}) => {
  const { t, i18n } = useTranslation();

  if (!isTranslated) return null;

  const getLanguageName = (code) => {
    switch (code) {
      case "hi":
        return i18n.language?.startsWith("hi")
          ? "हिंदी"
          : i18n.language?.startsWith("mr")
          ? "हिंदी"
          : "Hindi";
      case "mr":
        return i18n.language?.startsWith("hi")
          ? "मराठी"
          : i18n.language?.startsWith("mr")
          ? "मराठी"
          : "Marathi";
      case "en":
      default:
        return i18n.language?.startsWith("hi")
          ? "अंग्रेजी"
          : i18n.language?.startsWith("mr")
          ? "इंग्रजी"
          : "English";
    }
  };

  const langLabel = getLanguageName(sourceLang || "en");

  return (
    <div
      className={`inline-flex items-center gap-2 text-xs py-1 px-2.5 bg-emerald-50 text-emerald-900 border border-emerald-200 rounded-md shadow-xs my-1.5 ${className}`}
    >
      <div className="flex items-center gap-1 font-medium">
        <MdTranslate className="text-emerald-700" size={14} />
        <span>
          {isOriginalShown
            ? t("common.originalText", { lang: langLabel, defaultValue: `Original in ${langLabel}` })
            : t("common.translatedFrom", { lang: langLabel, defaultValue: `Translated from ${langLabel}` })}
        </span>
      </div>

      <span className="text-slate-300">|</span>

      <button
        type="button"
        onClick={onToggle}
        className="text-emerald-700 hover:text-emerald-900 underline font-semibold cursor-pointer transition"
      >
        {isOriginalShown
          ? t("common.showTranslation", { defaultValue: "Show translated" })
          : t("common.showOriginal", { defaultValue: "Show original" })}
      </button>
    </div>
  );
};

export default TranslationBadge;
