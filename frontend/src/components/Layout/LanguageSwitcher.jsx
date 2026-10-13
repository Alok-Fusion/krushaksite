import React, { useState, useRef, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { BiGlobe } from "react-icons/bi";
import { IoIosArrowDown } from "react-icons/io";

const LANGUAGES = [
  { code: "en", label: "English", short: "EN", flag: "🇬🇧" },
  { code: "hi", label: "हिन्दी", short: "हिन्दी", flag: "🇮🇳" },
  { code: "mr", label: "मराठी", short: "मराठी", flag: "🇮🇳" },
];

const LanguageSwitcher = ({ className = "", compact = false, dark = false }) => {
  const { i18n } = useTranslation();
  const [open, setOpen] = useState(false);
  const dropdownRef = useRef(null);

  const currentLang = (i18n.language || "en").split("-")[0];
  const activeObj = LANGUAGES.find((l) => l.code === currentLang) || LANGUAGES[0];

  const handleSelect = (code) => {
    i18n.changeLanguage(code);
    setOpen(false);
  };

  useEffect(() => {
    const handleOutsideClick = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handleOutsideClick);
    return () => document.removeEventListener("mousedown", handleOutsideClick);
  }, []);

  return (
    <div className={`relative inline-block text-left ${className}`} ref={dropdownRef}>
      <button
        type="button"
        onClick={() => setOpen(!open)}
        title="Select Language / भाषा निवडा / भाषा चुनें"
        className={`flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-semibold rounded-lg border transition shadow-sm select-none ${
          dark
            ? "bg-slate-800 border-slate-700 text-slate-100 hover:bg-slate-700"
            : "bg-white border-slate-300 text-slate-700 hover:bg-slate-50 hover:border-slate-400"
        }`}
      >
        <BiGlobe size={16} className={dark ? "text-emerald-400" : "text-emerald-600"} />
        <span>{compact ? activeObj.short : activeObj.label}</span>
        <IoIosArrowDown
          size={12}
          className={`transition-transform duration-200 ${open ? "rotate-180" : ""}`}
        />
      </button>

      {open && (
        <div className="absolute right-0 mt-1.5 w-32 origin-top-right rounded-lg bg-white shadow-lg ring-1 ring-black ring-opacity-5 border border-slate-100 z-50 py-1">
          {LANGUAGES.map((item) => (
            <button
              key={item.code}
              type="button"
              onClick={() => handleSelect(item.code)}
              className={`w-full text-left px-3 py-1.5 text-xs flex items-center justify-between font-medium transition ${
                currentLang === item.code
                  ? "bg-emerald-50 text-emerald-700 font-bold"
                  : "text-slate-700 hover:bg-slate-100"
              }`}
            >
              <span>{item.label}</span>
              {currentLang === item.code && (
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-600" />
              )}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

export default LanguageSwitcher;
