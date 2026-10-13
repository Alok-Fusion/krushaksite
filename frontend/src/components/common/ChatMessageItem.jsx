import React, { useState } from "react";
import axios from "axios";
import { format } from "timeago.js";
import { MdTranslate } from "react-icons/md";
import { useTranslation } from "react-i18next";
import TranslationBadge from "./TranslationBadge";
import { server } from "../../server";

const ChatMessageItem = ({ item, isOwnMessage }) => {
  const { t, i18n } = useTranslation();
  const [translatedText, setTranslatedText] = useState(null);
  const [translatedFrom, setTranslatedFrom] = useState(null);
  const [isTranslating, setIsTranslating] = useState(false);
  const [showOriginal, setShowOriginal] = useState(false);

  const activeLang = i18n.language?.startsWith("hi")
    ? "hi"
    : i18n.language?.startsWith("mr")
    ? "mr"
    : "en";

  const handleTranslate = async () => {
    if (translatedText) {
      setShowOriginal(false);
      return;
    }

    setIsTranslating(true);
    try {
      const res = await axios.post(`${server}/ai/translate-message`, {
        messageId: item._id,
        text: item.text,
        targetLang: activeLang,
      });

      if (res.data?.success) {
        setTranslatedText(res.data.text);
        setTranslatedFrom(res.data.translatedFrom);
        setShowOriginal(false);
      }
    } catch (err) {
      console.error("Message translation error:", err);
    } finally {
      setIsTranslating(false);
    }
  };

  const displayText =
    showOriginal || !translatedText ? item.text : translatedText;

  return (
    <div className="flex flex-col">
      <div
        className={`max-w-[420px] p-3 rounded-lg ${
          isOwnMessage ? "bg-slate-900 text-white" : "bg-emerald-600 text-white"
        } shadow-xs text-sm`}
      >
        <p className="whitespace-pre-wrap">{displayText}</p>

        {translatedText && (
          <div className="mt-1 pt-1 border-t border-white/20">
            <TranslationBadge
              isTranslated={true}
              sourceLang={translatedFrom}
              onToggle={() => setShowOriginal(!showOriginal)}
              isOriginalShown={showOriginal}
              className="!bg-white/10 !text-white !border-white/20 !my-0.5"
            />
          </div>
        )}
      </div>

      <div className="flex items-center gap-2 pt-1 text-[11px] text-slate-500">
        <span>{format(item.createdAt)}</span>
        {!translatedText && item.text && (
          <button
            type="button"
            onClick={handleTranslate}
            disabled={isTranslating}
            className="inline-flex items-center gap-1 text-emerald-700 hover:text-emerald-900 hover:underline cursor-pointer disabled:opacity-50"
            title="Translate message with Gemini AI"
          >
            <MdTranslate size={12} />
            <span>{isTranslating ? t("common.loading", "Translating...") : t("common.translate", "Translate")}</span>
          </button>
        )}
      </div>
    </div>
  );
};

export default ChatMessageItem;
