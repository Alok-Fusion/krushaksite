import React, { useState, useEffect, useMemo, useCallback } from "react";
import Header from "../components/Layout/Header";
import Footer from "../components/Layout/Footer";
import axios from "axios";
import { server } from "../server";
import { toast } from "react-toastify";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler,
} from "chart.js";
import { Line } from "react-chartjs-2";
import {
  AiOutlineLineChart,
  AiOutlineInfoCircle,
  AiOutlineReload,
  AiOutlineRise,
  AiOutlineFall,
} from "react-icons/ai";
import { MdOutlineAgriculture, MdLocationOn } from "react-icons/md";
import { BiCalendarAlt } from "react-icons/bi";

// Register Chart.js modules
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

const PriceTrendsPage = () => {
  const [selectedCrop, setSelectedCrop] = useState("onion");
  const [selectedMarket, setSelectedMarket] = useState("Lasalgaon");
  const [days, setDays] = useState(7);
  const [language, setLanguage] = useState("en"); // 'en' | 'hi' | 'mr'

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [forecastData, setForecastData] = useState(null);

  // Trilingual UI strings
  const t = {
    en: {
      title: "Mandi Price Forecaster",
      subtitle:
        "AI-powered time-series price projections and harvest marketing advice for Maharashtra agricultural APMC mandis.",
      demoBadge: "Demo data, not real mandi prices",
      demoTooltip:
        "Trained on 2 years of synthetic data calibrated to Maharashtra APMC market dynamics. Live Agmarknet data will be integrated via data.gov.in.",
      cropSelect: "Select Crop",
      marketSelect: "APMC Market",
      horizonSelect: "Forecast Horizon",
      days7: "7 Days",
      days30: "30 Days",
      latestPrice: "Latest Modal Price",
      projectedPrice: "Forecasted Price",
      projectedChange: "Projected Trend",
      adviceTitle: "AI Agronomic Advisory",
      chartTitle: "Historical Modal Price & 95% Confidence Interval Forecast",
      perQuintal: "₹ / Quintal",
      historyLabel: "Historical Modal Price (₹/q)",
      forecastLabel: "Projected Price (₹/q)",
      upperBoundLabel: "Upper Bound 95%",
      lowerBoundLabel: "Lower Bound 95%",
      reloadBtn: "Refresh Forecast",
      loadingText: "Forecasting mandi price trends with LightGBM ML model...",
      errorHeading: "Unable to retrieve price forecast",
      retryBtn: "Retry Query",
      crops: {
        onion: "Onion (कांदा)",
        tomato: "Tomato (टोमॅटो)",
        potato: "Potato (बटाटा)",
        wheat: "Wheat (गहू)",
        soybean: "Soybean (सोयाबीन)",
        cotton: "Cotton (कापूस)",
        maize: "Maize (मका)",
        tur: "Tur / Arhar (तूर)",
      },
      markets: {
        Lasalgaon: "Lasalgaon (Nashik)",
        Pune: "Pune APMC",
        Nashik: "Nashik APMC",
        Nagpur: "Nagpur APMC",
        Kolhapur: "Kolhapur APMC",
        Latur: "Latur APMC",
      },
    },
    hi: {
      title: "मंडी भाव पूर्वानुमान (एआई)",
      subtitle:
        "महाराष्ट्र की प्रमुख कृषि उपज मंडियों के लिए एआई आधारित मूल्य पूर्वानुमान और फसल बिक्री सलाह।",
      demoBadge: "डेमो डेटा, वास्तविक मंडी भाव नहीं",
      demoTooltip:
        "महाराष्ट्र एपीएमसी आंकड़ों के आधार पर कैलिब्रेट किए गए 2 वर्षों के सिंथेटिक डेटा पर प्रशिक्षित।",
      cropSelect: "फसल चुनें",
      marketSelect: "कृषि मंडी",
      horizonSelect: "पूर्वानुमान अवधि",
      days7: "7 दिन",
      days30: "30 दिन",
      latestPrice: "नवीनतम मॉडल भाव",
      projectedPrice: "अनुमानित भाव",
      projectedChange: "अनुमानित बदलाव",
      adviceTitle: "एआई कृषि विपणन सलाह",
      chartTitle: "ऐतिहासिक भाव एवं 95% विश्वास अंतराल पूर्वानुमान",
      perQuintal: "₹ / क्विंटल",
      historyLabel: "ऐतिहासिक भाव (₹/क्विंटल)",
      forecastLabel: "अनुमानित भाव (₹/क्विंटल)",
      upperBoundLabel: "ऊपरी सीमा (95%)",
      lowerBoundLabel: "निचली सीमा (95%)",
      reloadBtn: "पूर्वानुमान ताज़ा करें",
      loadingText: "लाइटजीबीएम मॉडल से मंडी भाव का पूर्वानुमान लगाया जा रहा है...",
      errorHeading: "भाव पूर्वानुमान प्राप्त करने में विफल",
      retryBtn: "पुनः प्रयास करें",
      crops: {
        onion: "प्याज (Onion)",
        tomato: "टमाटर (Tomato)",
        potato: "आलू (Potato)",
        wheat: "गेहूं (Wheat)",
        soybean: "सोयाबीन (Soybean)",
        cotton: "कपास (Cotton)",
        maize: "मक्का (Maize)",
        tur: "अरहर / तूर (Tur)",
      },
      markets: {
        Lasalgaon: "लासलगांव (नाशिक)",
        Pune: "पुणे मंडी",
        Nashik: "नाशिक मंडी",
        Nagpur: "नागपुर मंडी",
        Kolhapur: "कोल्हापुर मंडी",
        Latur: "लातूर मंडी",
      },
    },
    mr: {
      title: "मंडी भाव अंदाज (एआय)",
      subtitle:
        "महाराष्ट्रातील प्रमुख कृषी उत्पन्न बाजार समित्यांसाठी एआय-आधारित बाजारभाव अंदाज आणि विक्री सल्ला.",
      demoBadge: "डेमो डेटा, प्रत्यक्ष बाजारभाव नाहीत",
      demoTooltip:
        "महाराष्ट्रातील एपीएमसी बाजारांच्या आधारे तयार केलेल्या 2 वर्षांच्या डेटावर प्रशिक्षित मॉडेल.",
      cropSelect: "पीक निवडा",
      marketSelect: "बाजार समिती (APMC)",
      horizonSelect: "अंदाज कालावधी",
      days7: "7 दिवस",
      days30: "30 दिवस",
      latestPrice: "सध्याचा सरासरी दर",
      projectedPrice: "अंदाजित दर",
      projectedChange: "अंदाजित चढ-उतार",
      adviceTitle: "कृषी विपणन सल्ला",
      chartTitle: "मागील सरासरी दर आणि पुढील 95% विश्वासार्ह अंदाज",
      perQuintal: "₹ / क्विंटल",
      historyLabel: "मागील सरासरी दर (₹/क्विंटल)",
      forecastLabel: "अंदाजित दर (₹/क्विंटल)",
      upperBoundLabel: "उच्च मर्यादा (95%)",
      lowerBoundLabel: "किमान मर्यादा (95%)",
      reloadBtn: "अंदाज पुन्हा तपासा",
      loadingText: "मंडी भावाचा अंदाज मोजला जात आहे...",
      errorHeading: "बाजारभाव अंदाज मिळवण्यात अडचण आली",
      retryBtn: "पुन्हा प्रयत्न करा",
      crops: {
        onion: "कांदा (Onion)",
        tomato: "टोमॅटो (Tomato)",
        potato: "बटाटा (Potato)",
        wheat: "गहू (Wheat)",
        soybean: "सोयाबीन (Soybean)",
        cotton: "कापूस (Cotton)",
        maize: "मका (Maize)",
        tur: "तूर (Tur)",
      },
      markets: {
        Lasalgaon: "लासलगाव (नाशिक)",
        Pune: "पुणे बाजार समिती",
        Nashik: "नाशिक बाजार समिती",
        Nagpur: "नागपूर बाजार समिती",
        Kolhapur: "कोल्हापूर बाजार समिती",
        Latur: "लातूर बाजार समिती",
      },
    },
  }[language];

  // Fetch forecast data from Express backend proxy
  const fetchForecast = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await axios.get(`${server}/ai/forecast`, {
        params: {
          crop: selectedCrop,
          market: selectedMarket,
          days: days,
        },
      });

      if (response.data && response.data.forecast) {
        setForecastData(response.data);
      } else {
        throw new Error("Invalid response received from forecaster service.");
      }
    } catch (err) {
      console.error("Forecast fetch error:", err);
      const msg =
        err.response?.data?.message ||
        err.message ||
        "Failed to load price forecast.";
      setError(msg);
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  }, [selectedCrop, selectedMarket, days]);

  useEffect(() => {
    fetchForecast();
  }, [fetchForecast]);

  // Construct Chart.js datasets with history, forecast, and 95% shaded confidence band
  const chartData = useMemo(() => {
    if (!forecastData) return null;

    const history = forecastData.history || [];
    const forecast = forecastData.forecast || [];

    // History points
    const histDates = history.map((item) => item.date);
    const histPrices = history.map((item) => item.modal_price);

    // Forecast points
    const fcDates = forecast.map((item) => item.date);
    const fcPrices = forecast.map((item) => item.predicted_price);
    const fcLower = forecast.map((item) => item.lower_bound);
    const fcUpper = forecast.map((item) => item.upper_bound);

    const labels = [...histDates, ...fcDates];

    // Align series with nulls for disjoint visualization
    const historySeries = [
      ...histPrices,
      ...Array(fcDates.length).fill(null),
    ];

    // Bridge the last historical point with the first forecast point
    const forecastSeries = [
      ...Array(Math.max(0, histDates.length - 1)).fill(null),
      histPrices[histPrices.length - 1] || null,
      ...fcPrices,
    ];

    const upperSeries = [
      ...Array(Math.max(0, histDates.length - 1)).fill(null),
      histPrices[histPrices.length - 1] || null,
      ...fcUpper,
    ];

    const lowerSeries = [
      ...Array(Math.max(0, histDates.length - 1)).fill(null),
      histPrices[histPrices.length - 1] || null,
      ...fcLower,
    ];

    return {
      labels,
      datasets: [
        {
          label: t.historyLabel,
          data: historySeries,
          borderColor: "#059669", // Emerald
          backgroundColor: "#059669",
          borderWidth: 2.5,
          pointRadius: 1.5,
          pointHoverRadius: 5,
          tension: 0.15,
        },
        {
          label: t.forecastLabel,
          data: forecastSeries,
          borderColor: "#2563eb", // Blue
          backgroundColor: "#2563eb",
          borderWidth: 2.5,
          borderDash: [6, 4],
          pointRadius: 3,
          pointHoverRadius: 6,
          tension: 0.15,
        },
        {
          label: t.upperBoundLabel,
          data: upperSeries,
          borderColor: "rgba(59, 130, 246, 0.3)",
          borderWidth: 1,
          pointRadius: 0,
          fill: false,
        },
        {
          label: t.lowerBoundLabel,
          data: lowerSeries,
          borderColor: "rgba(59, 130, 246, 0.3)",
          borderWidth: 1,
          pointRadius: 0,
          fill: "-1", // Fill between upper bound (index 2) and this dataset
          backgroundColor: "rgba(59, 130, 246, 0.12)",
        },
      ],
    };
  }, [forecastData, language]);

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    interaction: {
      mode: "index",
      intersect: false,
    },
    plugins: {
      legend: {
        position: "top",
        labels: {
          font: { family: "sans-serif", size: 12 },
          usePointStyle: true,
          filter: (legendItem) =>
            legendItem.text !== t.upperBoundLabel &&
            legendItem.text !== t.lowerBoundLabel,
        },
      },
      tooltip: {
        callbacks: {
          label: (context) => {
            if (context.parsed.y === null) return "";
            return ` ${context.dataset.label}: ₹${context.parsed.y.toLocaleString("en-IN")}/q`;
          },
        },
      },
    },
    scales: {
      x: {
        grid: { display: false },
        ticks: { maxTicksLimit: 12, font: { size: 11 } },
      },
      y: {
        grid: { color: "rgba(0,0,0,0.06)" },
        ticks: {
          callback: (value) => `₹${value}`,
          font: { size: 11 },
        },
      },
    },
  };

  const endPrice = forecastData?.forecast?.slice(-1)[0]?.predicted_price;
  const trendPct = forecastData?.trend_pct ?? 0;
  const isRising = trendPct > 2.0;
  const isFalling = trendPct < -2.0;

  return (
    <div className="min-h-screen bg-[#f8fafc] flex flex-col justify-between">
      <Header activeHeading={7} />

      <main className="w-full max-w-[1280px] mx-auto px-4 py-8 flex-1">
        {/* Header section with Language Selector and Synthetic Badge */}
        <div className="flex flex-col md:flex-row md:items-center justify-between pb-6 border-b border-slate-200 gap-4">
          <div>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-emerald-600 text-white flex items-center justify-center shadow-sm">
                <AiOutlineLineChart size={24} />
              </div>
              <h1 className="text-2xl md:text-3xl font-bold text-slate-800">
                {t.title}
              </h1>
            </div>
            <p className="text-sm text-slate-600 mt-1 max-w-2xl">{t.subtitle}</p>
          </div>

          <div className="flex items-center gap-3 flex-wrap">
            {/* Synthetic Data Warning Badge */}
            {forecastData?.data_source === "synthetic" && (
              <span
                title={t.demoTooltip}
                className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-amber-100 text-amber-800 border border-amber-300 shadow-sm cursor-help"
              >
                <AiOutlineInfoCircle size={14} className="text-amber-600" />
                {t.demoBadge}
              </span>
            )}

            {/* Language Selector */}
            <div className="flex items-center bg-white border border-slate-300 rounded-lg p-1 shadow-sm">
              <button
                type="button"
                onClick={() => setLanguage("en")}
                className={`px-2.5 py-1 text-xs font-semibold rounded ${
                  language === "en"
                    ? "bg-emerald-600 text-white"
                    : "text-slate-600 hover:bg-slate-100"
                }`}
              >
                EN
              </button>
              <button
                type="button"
                onClick={() => setLanguage("hi")}
                className={`px-2.5 py-1 text-xs font-semibold rounded ${
                  language === "hi"
                    ? "bg-emerald-600 text-white"
                    : "text-slate-600 hover:bg-slate-100"
                }`}
              >
                हिंदी
              </button>
              <button
                type="button"
                onClick={() => setLanguage("mr")}
                className={`px-2.5 py-1 text-xs font-semibold rounded ${
                  language === "mr"
                    ? "bg-emerald-600 text-white"
                    : "text-slate-600 hover:bg-slate-100"
                }`}
              >
                मराठी
              </button>
            </div>
          </div>
        </div>

        {/* Filter Controls Row */}
        <div className="my-6 bg-white p-4 md:p-6 rounded-xl border border-slate-200 shadow-sm grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 items-end">
          {/* Crop Selector */}
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5 flex items-center gap-1">
              <MdOutlineAgriculture size={16} className="text-emerald-600" />
              {t.cropSelect}
            </label>
            <select
              value={selectedCrop}
              onChange={(e) => setSelectedCrop(e.target.value)}
              className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-sm text-slate-800 font-medium focus:ring-2 focus:ring-emerald-500 focus:outline-none"
            >
              <option value="onion">{t.crops.onion}</option>
              <option value="tomato">{t.crops.tomato}</option>
              <option value="potato">{t.crops.potato}</option>
              <option value="wheat">{t.crops.wheat}</option>
              <option value="soybean">{t.crops.soybean}</option>
              <option value="cotton">{t.crops.cotton}</option>
              <option value="maize">{t.crops.maize}</option>
              <option value="tur">{t.crops.tur}</option>
            </select>
          </div>

          {/* Market Selector */}
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5 flex items-center gap-1">
              <MdLocationOn size={16} className="text-emerald-600" />
              {t.marketSelect}
            </label>
            <select
              value={selectedMarket}
              onChange={(e) => setSelectedMarket(e.target.value)}
              className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-sm text-slate-800 font-medium focus:ring-2 focus:ring-emerald-500 focus:outline-none"
            >
              <option value="Lasalgaon">{t.markets.Lasalgaon}</option>
              <option value="Pune">{t.markets.Pune}</option>
              <option value="Nashik">{t.markets.Nashik}</option>
              <option value="Nagpur">{t.markets.Nagpur}</option>
              <option value="Kolhapur">{t.markets.Kolhapur}</option>
              <option value="Latur">{t.markets.Latur}</option>
            </select>
          </div>

          {/* Horizon Selector */}
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5 flex items-center gap-1">
              <BiCalendarAlt size={16} className="text-emerald-600" />
              {t.horizonSelect}
            </label>
            <div className="flex bg-slate-100 p-1 rounded-lg border border-slate-300">
              <button
                type="button"
                onClick={() => setDays(7)}
                className={`flex-1 py-1.5 text-xs font-bold rounded-md transition ${
                  days === 7
                    ? "bg-white text-emerald-700 shadow-sm"
                    : "text-slate-600 hover:text-slate-900"
                }`}
              >
                {t.days7}
              </button>
              <button
                type="button"
                onClick={() => setDays(30)}
                className={`flex-1 py-1.5 text-xs font-bold rounded-md transition ${
                  days === 30
                    ? "bg-white text-emerald-700 shadow-sm"
                    : "text-slate-600 hover:text-slate-900"
                }`}
              >
                {t.days30}
              </button>
            </div>
          </div>

          {/* Refresh Action */}
          <div>
            <button
              type="button"
              onClick={fetchForecast}
              disabled={loading}
              className="w-full h-[40px] flex items-center justify-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-semibold rounded-lg shadow-sm transition disabled:opacity-50"
            >
              <AiOutlineReload
                size={16}
                className={loading ? "animate-spin" : ""}
              />
              {t.reloadBtn}
            </button>
          </div>
        </div>

        {/* Loading Spinner State */}
        {loading && (
          <div className="my-12 p-8 text-center bg-white rounded-xl border border-slate-200 shadow-sm">
            <div className="w-12 h-12 border-4 border-emerald-200 border-t-emerald-600 rounded-full animate-spin mx-auto mb-4" />
            <p className="text-slate-600 font-medium text-sm">{t.loadingText}</p>
          </div>
        )}

        {/* Error State */}
        {!loading && error && (
          <div className="my-8 p-6 bg-red-50 border border-red-200 rounded-xl text-center">
            <h3 className="text-base font-bold text-red-800 mb-1">
              {t.errorHeading}
            </h3>
            <p className="text-sm text-red-600 mb-4">{error}</p>
            <button
              type="button"
              onClick={fetchForecast}
              className="px-4 py-2 bg-red-600 text-white text-sm font-semibold rounded-lg hover:bg-red-700 transition"
            >
              {t.retryBtn}
            </button>
          </div>
        )}

        {/* Forecast Content */}
        {!loading && !error && forecastData && (
          <>
            {/* Stat Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
              {/* Latest Price */}
              <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
                <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                  {t.latestPrice}
                </span>
                <div className="mt-2 flex items-baseline gap-2">
                  <span className="text-3xl font-extrabold text-slate-900">
                    ₹{forecastData.latest_price?.toLocaleString("en-IN")}
                  </span>
                  <span className="text-xs text-slate-500">{t.perQuintal}</span>
                </div>
                <p className="text-xs text-slate-500 mt-1">
                  As of {forecastData.latest_date}
                </p>
              </div>

              {/* Projected Price */}
              <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
                <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                  {t.projectedPrice} ({days}d)
                </span>
                <div className="mt-2 flex items-baseline gap-2">
                  <span className="text-3xl font-extrabold text-blue-600">
                    ₹{endPrice ? Math.round(endPrice).toLocaleString("en-IN") : "---"}
                  </span>
                  <span className="text-xs text-slate-500">{t.perQuintal}</span>
                </div>
                <p className="text-xs text-slate-500 mt-1">
                  Target date: {forecastData.forecast?.slice(-1)[0]?.date}
                </p>
              </div>

              {/* Trend Pill */}
              <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
                <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                  {t.projectedChange}
                </span>
                <div className="mt-2 flex items-center gap-2">
                  <div
                    className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-base font-bold ${
                      isRising
                        ? "bg-emerald-100 text-emerald-800"
                        : isFalling
                        ? "bg-rose-100 text-rose-800"
                        : "bg-sky-100 text-sky-800"
                    }`}
                  >
                    {isRising ? (
                      <AiOutlineRise size={20} />
                    ) : isFalling ? (
                      <AiOutlineFall size={20} />
                    ) : null}
                    {trendPct > 0 ? `+${trendPct}%` : `${trendPct}%`}
                  </div>
                </div>
                <p className="text-xs text-slate-500 mt-1">
                  Over next {days} days horizon
                </p>
              </div>
            </div>

            {/* Plain Language Advisory Banner */}
            {forecastData.plain_language_hint && (
              <div
                className={`p-4 rounded-xl border mb-6 flex items-start gap-3 shadow-sm ${
                  isRising
                    ? "bg-emerald-50 border-emerald-200 text-emerald-900"
                    : isFalling
                    ? "bg-amber-50 border-amber-200 text-amber-900"
                    : "bg-sky-50 border-sky-200 text-sky-900"
                }`}
              >
                <div className="p-1 rounded-full bg-white shadow-sm shrink-0">
                  <AiOutlineInfoCircle size={20} />
                </div>
                <div>
                  <h4 className="text-sm font-bold">{t.adviceTitle}</h4>
                  <p className="text-sm mt-0.5 leading-relaxed">
                    {forecastData.plain_language_hint}
                  </p>
                </div>
              </div>
            )}

            {/* Main Interactive Line Chart */}
            <div className="bg-white p-4 md:p-6 rounded-xl border border-slate-200 shadow-sm mb-8">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-4 gap-2">
                <h3 className="text-base font-bold text-slate-800">
                  {t.chartTitle}
                </h3>
                <span className="text-xs text-slate-500">
                  90-day history + {days}-day projection with 95% error margin
                </span>
              </div>
              <div className="w-full h-[380px] md:h-[460px]">
                {chartData && <Line data={chartData} options={chartOptions} />}
              </div>
            </div>
          </>
        )}
      </main>

      <Footer />
    </div>
  );
};

export default PriceTrendsPage;
