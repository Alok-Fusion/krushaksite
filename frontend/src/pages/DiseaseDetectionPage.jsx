import React, { useState, useRef } from "react";
import Header from "../components/Layout/Header";
import Footer from "../components/Layout/Footer";
import styles from "../styles/styles";
import axios from "axios";
import { server } from "../server";
import { toast } from "react-toastify";
import {
  AiOutlineUpload,
  AiOutlineClose,
  AiOutlineSend,
  AiOutlineWarning,
  AiOutlineCheckCircle,
  AiOutlineInfoCircle,
} from "react-icons/ai";
import { RiLeafLine, RiPlantLine, RiRobotLine } from "react-icons/ri";

const DiseaseDetectionPage = () => {
  const [selectedImage, setSelectedImage] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [language, setLanguage] = useState("en"); // 'en' | 'hi' | 'mr'
  const [analyzing, setAnalyzing] = useState(false);
  const [result, setResult] = useState(null);

  // Assistant Chat state
  const [chatOpen, setChatOpen] = useState(true);
  const [chatMessages, setChatMessages] = useState([
    {
      role: "model",
      text: "Namaste! I am Krushak Krishi Mitra. Ask me any questions about crop cultivation, soil health, fertilizers, or pest remedies.",
    },
  ]);
  const [userInput, setUserInput] = useState("");
  const [chatLoading, setChatLoading] = useState(false);
  const fileInputRef = useRef(null);
  const chatBottomRef = useRef(null);

  const translations = {
    en: {
      title: "AI Crop Disease Detection",
      subtitle: "Upload a photo of an affected leaf or plant to instantly receive diagnosis, confidence score, causes, and actionable treatment steps.",
      selectLang: "Language",
      uploadTitle: "Click or Drag & Drop Leaf Photo",
      uploadDesc: "Supports JPEG, PNG, WebP (up to 10MB)",
      analyzeBtn: "Analyze Crop Health",
      analyzing: "Analyzing leaf with Gemini Vision AI...",
      cropLabel: "Identified Crop",
      diseaseLabel: "Condition / Disease",
      confidenceLabel: "AI Confidence",
      severityLabel: "Severity Level",
      causesTitle: "Likely Causes & Pathogens",
      treatmentTitle: "Recommended Treatment Steps",
      preventionTitle: "Preventative Farming Practices",
      assistantTitle: "Krushak Krishi Mitra - AI Farming Assistant",
      assistantDesc: "Get real-time agronomic guidance restricted strictly to Indian farming & crops.",
      chatPlaceholder: "Ask about seeds, fertilizers, irrigation, pests...",
      chatSend: "Send",
    },
    hi: {
      title: "एआई फसल रोग पहचान",
      subtitle: "पत्ती या पौधे की तस्वीर अपलोड करें और तुरंत रोग का नाम, गंभीरता, कारण और उपचार के कदम प्राप्त करें।",
      selectLang: "भाषा चुनें",
      uploadTitle: "पत्ती की तस्वीर अपलोड करें",
      uploadDesc: "JPEG, PNG, WebP समर्थित (अधिकतम 10MB)",
      analyzeBtn: "फसल स्वास्थ्य की जांच करें",
      analyzing: "जेमिनी विज़न एआई विश्लेषण कर रहा है...",
      cropLabel: "पहचानी गई फसल",
      diseaseLabel: "रोग / स्थिति",
      confidenceLabel: "एआई विश्वास स्तर",
      severityLabel: "रोग की गंभीरता",
      causesTitle: "संभावित कारण और रोगाणु",
      treatmentTitle: "अनुशंसित उपचार और दवाएं",
      preventionTitle: "रोकथाम और कृषि प्रबंधन",
      assistantTitle: "कृषक कृषि मित्र - एआई कृषि सलाहकार",
      assistantDesc: "फसल, खाद, बीज और मौसम से जुड़े सवालों के तुरंत जवाब पाएं।",
      chatPlaceholder: "खाद, बीज, सिंचाई या कीटनाशक के बारे में पूछें...",
      chatSend: "पूछें",
    },
    mr: {
      title: "एआय पीक रोग निदान",
      subtitle: "पिकाच्या पानाचा फोटो अपलोड करा आणि तात्काळ रोगाचे नाव, विश्वासार्हता, कारणे आणि उपाय मिळवा.",
      selectLang: "भाषा निवडा",
      uploadTitle: "पानाचा फोटो येथे अपलोड करा",
      uploadDesc: "JPEG, PNG, WebP समर्थित (कमाल 10MB)",
      analyzeBtn: "पिकाचे आरोग्य तपासा",
      analyzing: "जेमिनी व्हिजन एआय द्वारे तपासणी सुरू आहे...",
      cropLabel: "ओळखलेले पीक",
      diseaseLabel: "रोग / स्थिती",
      confidenceLabel: "विश्वासार्हता",
      severityLabel: "रोगाची तीव्रता",
      causesTitle: "संभाव्य कारणे",
      treatmentTitle: "शिफारस केलेले उपाय आणि औषधे",
      preventionTitle: "प्रतिबंधात्मक कृषी उपाय",
      assistantTitle: "कृषक कृषी मित्र - एआय कृषी सल्लागार",
      assistantDesc: "पिके, खते, कीड व्यवस्थापन आणि हवामानाबद्दल त्वरित सल्ला मिळवा.",
      chatPlaceholder: "खत, बियाणे, पाणी व्यवस्थापनाबद्दल विचारा...",
      chatSend: "पाठवा",
    },
  };

  const t = translations[language];

  // Handle file selection
  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      toast.error("Please upload an image file (JPEG, PNG, WebP)");
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      toast.error("File size exceeds 10MB limit");
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      setSelectedImage(reader.result);
      setPreviewUrl(reader.result);
      setResult(null);
    };
    reader.readAsDataURL(file);
  };

  // Trigger disease analysis
  const handleAnalyze = async () => {
    if (!selectedImage) {
      toast.warning("Please upload a leaf photograph first");
      return;
    }

    setAnalyzing(true);
    setResult(null);

    try {
      const response = await axios.post(`${server}/ai/disease`, {
        image: selectedImage,
        language,
      });

      if (response.data?.success) {
        setResult(response.data.data);
        toast.success("Disease analysis completed successfully!");
      } else {
        toast.error("Unable to analyze crop health");
      }
    } catch (error) {
      const message =
        error.response?.data?.message || "Failed to analyze image with Gemini AI";
      toast.error(message);
    } finally {
      setAnalyzing(false);
    }
  };

  // Handle assistant chat submission
  const handleSendChatMessage = async (e) => {
    e?.preventDefault();
    if (!userInput.trim() || chatLoading) return;

    const currentMsg = userInput.trim();
    setUserInput("");

    const newHistory = [
      ...chatMessages,
      { role: "user", text: currentMsg },
    ];
    setChatMessages(newHistory);
    setChatLoading(true);

    try {
      const response = await axios.post(`${server}/ai/chat`, {
        message: currentMsg,
        conversationHistory: newHistory.slice(-8),
        language,
      });

      if (response.data?.success) {
        setChatMessages((prev) => [
          ...prev,
          { role: "model", text: response.data.reply },
        ]);
        setTimeout(() => {
          chatBottomRef.current?.scrollIntoView({ behavior: "smooth" });
        }, 100);
      }
    } catch (err) {
      setChatMessages((prev) => [
        ...prev,
        {
          role: "model",
          text:
            err.response?.data?.message ||
            "Apologies, Krushak Assistant is momentarily unavailable. Please check backend API key configuration.",
        },
      ]);
    } finally {
      setChatLoading(false);
    }
  };

  const getSeverityBadgeClass = (severity = "") => {
    const s = severity.toLowerCase();
    if (s.includes("severe") || s.includes("high")) return "bg-red-100 text-red-800 border-red-200";
    if (s.includes("moderate") || s.includes("medium")) return "bg-amber-100 text-amber-800 border-amber-200";
    if (s.includes("healthy") || s.includes("none")) return "bg-emerald-100 text-emerald-800 border-emerald-200";
    return "bg-yellow-100 text-yellow-800 border-yellow-200";
  };

  return (
    <div className="bg-gray-50 min-h-screen">
      <Header activeHeading={5} />

      {/* Hero Header */}
      <div className="bg-gradient-to-r from-green-800 via-emerald-700 to-green-900 text-white py-12 px-4 shadow-md">
        <div className={`${styles.section} max-w-6xl mx-auto`}>
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
            <div>
              <div className="inline-flex items-center gap-2 bg-green-700/60 backdrop-blur-sm px-3 py-1 rounded-full text-xs font-semibold tracking-wider uppercase mb-3 border border-green-500/30">
                <RiLeafLine className="text-green-300" size={16} />
                <span>AI Precision Agriculture</span>
              </div>
              <h1 className="text-3xl md:text-4xl font-bold tracking-tight mb-2">
                {t.title}
              </h1>
              <p className="text-green-100 text-sm md:text-base max-w-2xl leading-relaxed">
                {t.subtitle}
              </p>
            </div>

            {/* Language Switcher */}
            <div className="bg-white/10 backdrop-blur-md p-1.5 rounded-xl border border-white/20 flex items-center gap-1">
              <button
                onClick={() => setLanguage("en")}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition ${
                  language === "en"
                    ? "bg-white text-green-900 shadow-sm font-semibold"
                    : "text-white hover:bg-white/10"
                }`}
              >
                English
              </button>
              <button
                onClick={() => setLanguage("hi")}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition ${
                  language === "hi"
                    ? "bg-white text-green-900 shadow-sm font-semibold"
                    : "text-white hover:bg-white/10"
                }`}
              >
                हिन्दी
              </button>
              <button
                onClick={() => setLanguage("mr")}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition ${
                  language === "mr"
                    ? "bg-white text-green-900 shadow-sm font-semibold"
                    : "text-white hover:bg-white/10"
                }`}
              >
                मराठी
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content Grid */}
      <div className={`${styles.section} max-w-6xl mx-auto py-10 px-4`}>
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Upload & Results Section (Left/Main - 8 cols) */}
          <div className="lg:col-span-7 flex flex-col gap-6">
            {/* Upload Box */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
              <h2 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
                <RiPlantLine className="text-green-600" size={22} />
                <span>{t.uploadTitle}</span>
              </h2>

              {!previewUrl ? (
                <div
                  onClick={() => fileInputRef.current?.click()}
                  className="border-2 border-dashed border-gray-300 hover:border-green-500 bg-gray-50/50 hover:bg-green-50/30 rounded-xl p-8 text-center cursor-pointer transition flex flex-col items-center justify-center min-h-[220px]"
                >
                  <div className="w-14 h-14 bg-green-100 rounded-full flex items-center justify-center text-green-600 mb-3">
                    <AiOutlineUpload size={28} />
                  </div>
                  <p className="text-sm font-semibold text-gray-700 mb-1">
                    Click to browse or drop photo here
                  </p>
                  <p className="text-xs text-gray-400">{t.uploadDesc}</p>
                </div>
              ) : (
                <div className="relative rounded-xl overflow-hidden border border-gray-200 bg-black/5">
                  <img
                    src={previewUrl}
                    alt="Uploaded leaf"
                    className="w-full max-h-[340px] object-contain mx-auto"
                  />
                  <button
                    onClick={() => {
                      setSelectedImage(null);
                      setPreviewUrl(null);
                      setResult(null);
                    }}
                    className="absolute top-3 right-3 bg-red-600 hover:bg-red-700 text-white p-2 rounded-full shadow-md transition"
                    title="Remove image"
                  >
                    <AiOutlineClose size={16} />
                  </button>
                </div>
              )}

              <input
                ref={fileInputRef}
                type="file"
                accept="image/jpeg,image/png,image/webp"
                className="hidden"
                onChange={handleFileChange}
              />

              {/* Action Button */}
              <button
                disabled={!selectedImage || analyzing}
                onClick={handleAnalyze}
                className={`w-full mt-5 py-3.5 px-6 rounded-xl font-semibold text-sm transition flex items-center justify-center gap-2 shadow-sm ${
                  !selectedImage || analyzing
                    ? "bg-gray-200 text-gray-400 cursor-not-allowed"
                    : "bg-green-600 hover:bg-green-700 text-white shadow-green-600/20 hover:shadow-lg"
                }`}
              >
                {analyzing ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    <span>{t.analyzing}</span>
                  </>
                ) : (
                  <>
                    <RiLeafLine size={18} />
                    <span>{t.analyzeBtn}</span>
                  </>
                )}
              </button>
            </div>

            {/* Diagnosis Result Card */}
            {result && (
              <div className="bg-white rounded-2xl shadow-md border border-gray-200 p-6 animate-fade-in">
                {/* Result Header */}
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center pb-5 border-b border-gray-100 gap-3">
                  <div>
                    <span className="text-xs uppercase tracking-wider font-semibold text-gray-400">
                      {t.cropLabel}
                    </span>
                    <h3 className="text-2xl font-bold text-gray-900 mt-0.5">
                      {result.crop}
                    </h3>
                  </div>
                  <div className="flex items-center gap-2">
                    <span
                      className={`text-xs px-3 py-1 rounded-full font-semibold border ${getSeverityBadgeClass(
                        result.severity
                      )}`}
                    >
                      {t.severityLabel}: {result.severity}
                    </span>
                    <span className="text-xs px-3 py-1 rounded-full font-semibold bg-blue-50 text-blue-700 border border-blue-200">
                      {t.confidenceLabel}: {result.confidence}
                    </span>
                  </div>
                </div>

                {/* Disease Banner */}
                <div className="my-5 p-4 bg-emerald-50/60 rounded-xl border border-emerald-100 flex items-start gap-3">
                  <div className="mt-0.5 text-emerald-600">
                    <AiOutlineCheckCircle size={22} />
                  </div>
                  <div>
                    <span className="text-xs font-semibold text-emerald-800 uppercase tracking-wide">
                      {t.diseaseLabel}
                    </span>
                    <p className="text-lg font-bold text-gray-900">{result.disease}</p>
                  </div>
                </div>

                {/* Causes List */}
                {result.causes && result.causes.length > 0 && (
                  <div className="mb-5">
                    <h4 className="text-sm font-bold text-gray-800 mb-2 flex items-center gap-1.5">
                      <AiOutlineWarning className="text-amber-500" size={17} />
                      <span>{t.causesTitle}</span>
                    </h4>
                    <ul className="space-y-1.5 pl-5 list-disc text-sm text-gray-600">
                      {result.causes.map((cause, idx) => (
                        <li key={idx} className="leading-relaxed">
                          {cause}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* Treatment Steps */}
                {result.treatment && result.treatment.length > 0 && (
                  <div className="mb-5">
                    <h4 className="text-sm font-bold text-gray-800 mb-2 flex items-center gap-1.5">
                      <AiOutlineCheckCircle className="text-green-600" size={17} />
                      <span>{t.treatmentTitle}</span>
                    </h4>
                    <div className="space-y-2">
                      {result.treatment.map((step, idx) => (
                        <div
                          key={idx}
                          className="flex items-start gap-2.5 bg-gray-50 p-2.5 rounded-lg text-sm text-gray-700"
                        >
                          <span className="w-5 h-5 rounded-full bg-green-600 text-white text-xs flex items-center justify-center flex-shrink-0 font-bold mt-0.5">
                            {idx + 1}
                          </span>
                          <span className="leading-relaxed">{step}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Prevention Steps */}
                {result.prevention && result.prevention.length > 0 && (
                  <div>
                    <h4 className="text-sm font-bold text-gray-800 mb-2 flex items-center gap-1.5">
                      <AiOutlineInfoCircle className="text-blue-500" size={17} />
                      <span>{t.preventionTitle}</span>
                    </h4>
                    <ul className="space-y-1.5 pl-5 list-disc text-sm text-gray-600">
                      {result.prevention.map((prevItem, idx) => (
                        <li key={idx} className="leading-relaxed">
                          {prevItem}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Krushak Assistant Chat (Right Column - 5 cols) */}
          <div className="lg:col-span-5 flex flex-col">
            <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden flex flex-col h-[650px] sticky top-24">
              {/* Chat Header */}
              <div className="bg-gradient-to-r from-emerald-700 to-green-700 text-white p-4 flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center">
                  <RiRobotLine size={22} className="text-white" />
                </div>
                <div>
                  <h3 className="font-bold text-sm tracking-wide">{t.assistantTitle}</h3>
                  <p className="text-xs text-green-100">{t.assistantDesc}</p>
                </div>
              </div>

              {/* Chat Messages */}
              <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-gray-50/50">
                {chatMessages.map((msg, index) => (
                  <div
                    key={index}
                    className={`flex flex-col ${
                      msg.role === "user" ? "items-end" : "items-start"
                    }`}
                  >
                    <div
                      className={`max-w-[85%] rounded-2xl p-3 text-xs md:text-sm leading-relaxed shadow-sm ${
                        msg.role === "user"
                          ? "bg-green-600 text-white rounded-br-none"
                          : "bg-white text-gray-800 border border-gray-100 rounded-bl-none"
                      }`}
                    >
                      {msg.text}
                    </div>
                  </div>
                ))}
                {chatLoading && (
                  <div className="flex items-center gap-2 text-xs text-gray-400 pl-2">
                    <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                    <span>Krushak Mitra is thinking...</span>
                  </div>
                )}
                <div ref={chatBottomRef} />
              </div>

              {/* Sample Quick Questions */}
              <div className="px-3 py-2 bg-white border-t border-gray-100 flex gap-1.5 overflow-x-auto text-[11px] text-gray-600">
                <button
                  onClick={() => setUserInput(language === "hi" ? "टमाटर के लिए जैविक कीटनाशक कौन सा अच्छा है?" : language === "mr" ? "टोमॅटोसाठी सेंद्रिय कीटकनाशक कोणते वापरावे?" : "Best organic pesticide for tomato blight?")}
                  className="whitespace-nowrap px-2.5 py-1 bg-gray-100 hover:bg-green-50 hover:text-green-700 rounded-full transition"
                >
                  🌿 {language === "hi" ? "जैविक कीटनाशक" : language === "mr" ? "सेंद्रिय कीटकनाशक" : "Organic Remedy"}
                </button>
                <button
                  onClick={() => setUserInput(language === "hi" ? "यूरिया और डीएपी खाद का सही अनुपात क्या है?" : language === "mr" ? "युरिया आणि डीएपी खताचे प्रमाण काय असावे?" : "Optimal NPK & Urea schedule for wheat?")}
                  className="whitespace-nowrap px-2.5 py-1 bg-gray-100 hover:bg-green-50 hover:text-green-700 rounded-full transition"
                >
                  🧪 {language === "hi" ? "खाद अनुपात" : language === "mr" ? "खत प्रमाण" : "Fertilizer Schedule"}
                </button>
              </div>

              {/* Chat Input Bar */}
              <form
                onSubmit={handleSendChatMessage}
                className="p-3 bg-white border-t border-gray-200 flex items-center gap-2"
              >
                <input
                  type="text"
                  value={userInput}
                  onChange={(e) => setUserInput(e.target.value)}
                  placeholder={t.chatPlaceholder}
                  className="flex-1 py-2 px-3 border border-gray-300 rounded-xl text-xs md:text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
                />
                <button
                  type="submit"
                  disabled={!userInput.trim() || chatLoading}
                  className={`p-2.5 rounded-xl transition ${
                    !userInput.trim() || chatLoading
                      ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                      : "bg-green-600 hover:bg-green-700 text-white shadow-sm"
                  }`}
                >
                  <AiOutlineSend size={18} />
                </button>
              </form>
            </div>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default DiseaseDetectionPage;
