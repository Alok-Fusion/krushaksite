import React, { useState } from "react";
import { Link } from "react-router-dom";
import styles from "../../styles/styles";
import { categoriesData, productData } from "../../static/data";
import {
  AiOutlineHeart,
  AiOutlineSearch,
  AiOutlineShoppingCart,
  AiOutlineLoading3Quarters,
} from "react-icons/ai";
import { BsMic, BsMicFill } from "react-icons/bs";
import { IoIosArrowDown, IoIosArrowForward } from "react-icons/io";
import { BiMenuAltLeft } from "react-icons/bi";
import { CgProfile } from "react-icons/cg";
import DropDown from "./DropDown";
import Navbar from "./Navbar";
import { useSelector } from "react-redux";
import Cart from "../cart/Cart";
import Wishlist from "../Wishlist/Wishlist";
import { RxCross1 } from "react-icons/rx";
import img1 from "../../Assests/Logo/a.jpeg";
import axios from "axios";
import { server } from "../../server";
import { toast } from "react-toastify";
import { useTranslation } from "react-i18next";
import LanguageSwitcher from "./LanguageSwitcher";

const Header = ({ activeHeading }) => {
  const { t } = useTranslation();
  const { isAuthenticated, user } = useSelector((state) => state.user);
  const { isSeller } = useSelector((state) => state.seller);
  const { wishlist } = useSelector((state) => state.wishlist);
  const { cart } = useSelector((state) => state.cart);
  const { allProducts } = useSelector((state) => state.products);
  const [searchTerm, setSearchTerm] = useState("");
  const [searchData, setSearchData] = useState(null);
  const [active, setActive] = useState(false);
  const [dropDown, setDropDown] = useState(false);
  const [openCart, setOpenCart] = useState(false);
  const [openWishlist, setOpenWishlist] = useState(false);
  const [open, setOpen] = useState(false);

  // Voice Search states
  const [voiceLang, setVoiceLang] = useState("hi-IN");
  const [isListening, setIsListening] = useState(false);
  const [isNormalizing, setIsNormalizing] = useState(false);

  // Web Speech API availability check
  const SpeechRecognition =
    typeof window !== "undefined"
      ? window.SpeechRecognition || window.webkitSpeechRecognition
      : null;
  const isSpeechSupported = !!SpeechRecognition;

  const filterAndSetResults = (term) => {
    setSearchTerm(term);
    if (!term || !term.trim()) {
      setSearchData(null);
      return;
    }
    const clean = term.trim().toLowerCase();
    const filteredProducts =
      allProducts &&
      allProducts.filter(
        (product) =>
          product.name?.toLowerCase().includes(clean) ||
          product.category?.toLowerCase().includes(clean) ||
          product.description?.toLowerCase().includes(clean)
      );
    setSearchData(filteredProducts);
  };

  const handleSearchChange = (e) => {
    filterAndSetResults(e.target.value);
  };

  const handleNormalizeAndSearch = async (transcriptText) => {
    if (!transcriptText || !transcriptText.trim()) return;
    setIsNormalizing(true);
    try {
      const { data } = await axios.post(`${server}/ai/normalize-query`, {
        transcript: transcriptText.trim(),
        language: voiceLang,
      });
      const resolvedKeyword = (data?.keyword && data.keyword.trim()) || transcriptText.trim();
      filterAndSetResults(resolvedKeyword);
      toast.success(`Voice query: "${resolvedKeyword}"`);
    } catch (err) {
      console.warn("Normalize voice query fallback:", err);
      filterAndSetResults(transcriptText.trim());
    } finally {
      setIsNormalizing(false);
    }
  };

  const toggleListening = () => {
    if (!SpeechRecognition) {
      toast.error("Speech recognition is not supported in this browser.");
      return;
    }

    if (isListening) {
      setIsListening(false);
      return;
    }

    try {
      const recognition = new SpeechRecognition();
      recognition.lang = voiceLang;
      recognition.continuous = false;
      recognition.interimResults = false;
      recognition.maxAlternatives = 1;

      recognition.onstart = () => {
        setIsListening(true);
      };

      recognition.onresult = (event) => {
        setIsListening(false);
        const transcript = event.results[0][0].transcript;
        if (transcript) {
          handleNormalizeAndSearch(transcript);
        }
      };

      recognition.onerror = (event) => {
        setIsListening(false);
        if (event.error === "not-allowed") {
          toast.error("Microphone access denied. Please grant microphone permissions.");
        } else if (event.error === "no-speech") {
          toast.info("No speech detected. Please speak clearly into the mic.");
        } else {
          toast.error(`Speech recognition error: ${event.error}`);
        }
      };

      recognition.onend = () => {
        setIsListening(false);
      };

      recognition.start();
    } catch (err) {
      setIsListening(false);
      toast.error("Failed to start voice recognition: " + err.message);
    }
  };

  window.addEventListener("scroll", () => {
    if (window.scrollY > 70) {
      setActive(true);
    } else {
      setActive(false);
    }
  });

  return (
    <>
      <div className={`${styles.section}`}>
        <div className="hidden 800px:h-[50px] 800px:my-[20px] 800px:flex items-center justify-between">
          <div>
            <Link to="/">
            <img src="https://onedrive.live.com/embed?resid=64385608D20B2754%2117783&authkey=%21ABZsajvNiJidnmM&width=250&height=80" alt="" />
            </Link>
          </div>
          {/* search box */}
          <div className="w-[50%] relative">
            <div className="flex items-center w-full h-[40px] px-2 border-[#0ea5e9] border-[2px] rounded-md bg-white focus-within:ring-2 focus-within:ring-[#0ea5e9]/30">
              <input
                type="text"
                placeholder={t("nav.searchPlaceholder")}
                value={searchTerm}
                onChange={handleSearchChange}
                className="h-full flex-1 px-1 text-sm outline-none bg-transparent"
              />

              {/* Language Selector */}
              <select
                value={voiceLang}
                onChange={(e) => setVoiceLang(e.target.value)}
                title={t("nav.voiceSearch", "Voice search language")}
                className="text-xs bg-slate-100 hover:bg-slate-200 border border-slate-300 rounded px-1.5 py-1 text-slate-700 font-medium cursor-pointer outline-none mr-1.5"
              >
                <option value="en-IN">EN</option>
                <option value="hi-IN">हिंदी</option>
                <option value="mr-IN">मराठी</option>
              </select>

              {/* Mic Button (hidden if Web Speech API unsupported) */}
              {isSpeechSupported && (
                <button
                  type="button"
                  onClick={toggleListening}
                  title={
                    isListening
                      ? t("common.loading")
                      : t("nav.voiceSearch", "Voice search in English, Hindi, or Marathi")
                  }
                  className={`p-1 rounded-full transition flex items-center justify-center mr-1 ${
                    isListening
                      ? "bg-red-500 text-white animate-pulse"
                      : isNormalizing
                      ? "bg-amber-100 text-amber-600 cursor-wait"
                      : "text-slate-600 hover:text-[#0ea5e9] hover:bg-slate-100"
                  }`}
                >
                  {isNormalizing ? (
                    <AiOutlineLoading3Quarters size={18} className="animate-spin" />
                  ) : isListening ? (
                    <BsMicFill size={18} />
                  ) : (
                    <BsMic size={18} />
                  )}
                </button>
              )}

              <AiOutlineSearch 
                size={26}
                className="text-[#0ea5e9] cursor-pointer"
              />
            </div>

            {/* Listening / Normalizing Indicators */}
            {isListening && (
              <div className="absolute top-[44px] left-0 bg-red-600 text-white text-xs px-2.5 py-1 rounded shadow-md z-[12] flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-white animate-ping" />
                {t("nav.listening", { lang: voiceLang === "hi-IN" ? "हिंदी" : voiceLang === "mr-IN" ? "मराठी" : "English" })}
              </div>
            )}

            {isNormalizing && (
              <div className="absolute top-[44px] left-0 bg-sky-600 text-white text-xs px-2.5 py-1 rounded shadow-md z-[12] flex items-center gap-1.5">
                <AiOutlineLoading3Quarters size={12} className="animate-spin" />
                {t("nav.interpretingVoice", "Interpreting voice query with Gemini AI...")}
              </div>
            )}

            {searchData && searchData.length !== 0 ? (
              <div className="absolute w-full min-h-[30vh] max-h-[60vh] overflow-y-auto bg-slate-50 shadow-md rounded-md z-[11] p-3 top-[44px] border border-slate-200">
                {searchData.map((i, index) => {
                  return (
                    <Link to={`/product/${i._id}`} key={index}>
                      <div className="w-full flex items-center py-2 px-2 hover:bg-slate-100 rounded transition border-b border-slate-100 last:border-b-0">
                        <img
                          src={i.images?.[0]?.url || i.image_Url?.[0]?.url || ""}
                          alt=""
                          className="w-[40px] h-[40px] object-cover rounded mr-[10px]"
                        />
                        <div>
                          <h1 className="text-sm font-semibold text-slate-800">{i.name}</h1>
                          <p className="text-xs text-slate-500">₹{i.discountPrice || i.originalPrice} &bull; {i.category}</p>
                        </div>
                      </div>
                    </Link>
                  );
                })}
              </div>
            ) : null}
          </div>

          <div className="flex items-center gap-3">
            <LanguageSwitcher />
            <div className={`${styles.button}`}>
              <Link to={`${isSeller ? "/dashboard" : "/shop-create"}`}>
                <h1 className="text-[#fff] flex items-center whitespace-nowrap">
                  {isSeller ? t("nav.dashboard") : t("nav.becomeSeller")}{" "}
                  <IoIosArrowForward className="ml-1" />
                </h1>
              </Link>
            </div>
          </div>
        </div>
      </div>
      <div
        className={`${
          active === true ? "shadow-sm  fixed top-0 left-0 z-10" : null
        } transition hidden 800px:flex items-center justify-between w-full bg-[#4CBB17]  h-[70px]`}
      >
        <div
          className={`${styles.section} relative ${styles.noramlFlex} justify-between `}
        >
          {/* categories */}
          <div onClick={() => setDropDown(!dropDown)}>
            <div className="relative h-[60px] mt-[10px] w-[270px] hidden 1000px:block">
              <BiMenuAltLeft size={30} className="absolute top-3 left-2"  color="#0ea5e9"/>
              <button
                className={`h-[100%] w-full flex justify-between items-center pl-10 bg-white font-sans text-lg text-[#0ea5e9] font-[500] select-none rounded-t-md`}
              >
                {t("nav.allCategories")}
              </button>
              <IoIosArrowDown
                 color="#0ea5e9"
                size={20}
                className="absolute right-2 top-4 cursor-pointer"
                onClick={() => setDropDown(!dropDown)}
              />
              {dropDown ? (
                <DropDown
                  categoriesData={categoriesData}
                  setDropDown={setDropDown}
                />
              ) : null}
            </div>
          </div>
          {/* navitems */}
          <div className={`${styles.noramlFlex}`}>
            <Navbar active={activeHeading} />
          </div>

          <div className="flex">
            <div className={`${styles.noramlFlex}`}>
              <div
                className="relative cursor-pointer mr-[15px]"
                onClick={() => setOpenWishlist(true)}
              >
                <AiOutlineHeart size={30} color="rgb(255 255 255 / 83%)" />
                <span className="absolute right-0 top-0 rounded-full bg-[#4b3621] w-4 h-4 top right p-0 m-0 text-white font-mono text-[12px] leading-tight text-center">
                  {wishlist && wishlist.length}
                </span>
              </div>
            </div>

            <div className={`${styles.noramlFlex}`}>
              <div
                className="relative cursor-pointer mr-[15px]"
                onClick={() => setOpenCart(true)}
              >
                <AiOutlineShoppingCart
                  size={30}
                  color="rgb(255 255 255 / 83%)"
                />
                <span className="absolute right-0 top-0 rounded-full bg-[#4b3621] w-4 h-4 top right p-0 m-0 text-white font-mono text-[12px] leading-tight text-center">
                  {cart && cart.length}
                </span>
              </div>
            </div>

            <div className={`${styles.noramlFlex}`}>
              <div className="relative cursor-pointer mr-[15px]">
                {isAuthenticated ? (
                  <Link to="/profile">
                    <img
                      src={`${user?.avatar?.url}`}
                      className="w-[35px] h-[35px] rounded-full"
                      alt=""
                    />
                  </Link>
                ) : (
                  <Link to="/login">
                    <CgProfile size={30} color="rgb(255 255 255 / 83%)" />
                  </Link>
                )}
              </div>
            </div>

            {/* cart popup */}
            {openCart ? <Cart setOpenCart={setOpenCart} /> : null}

            {/* wishlist popup */}
            {openWishlist ? (
              <Wishlist setOpenWishlist={setOpenWishlist} />
            ) : null}
          </div>
        </div>
      </div>

      {/* mobile header */}
      <div
        className={`${
          active === true ? "shadow-sm fixed top-0 left-0 z-10" : null
        }
      w-full h-[60px] bg-[#fff] z-50 top-0 left-0 shadow-sm 800px:hidden`}
      >
        <div className="w-full flex items-center justify-between">
          <div>
            <BiMenuAltLeft
              size={40}
              className="ml-4"
              onClick={() => setOpen(true)}
            />
          </div>
          <div>
            <Link to="/">
            <img src="https://onedrive.live.com/embed?resid=64385608D20B2754%2117783&authkey=%21ABZsajvNiJidnmM&width=250&height=80" alt="" />
            </Link>
          </div>
          <div>
            <div
              className="relative mr-[20px]"
              onClick={() => setOpenCart(true)}
            >
              <AiOutlineShoppingCart size={30} />
              <span class="absolute right-0 top-0 rounded-full bg-[#4b3621] w-4 h-4 top right p-0 m-0 text-white font-mono text-[12px]  leading-tight text-center">
                {cart && cart.length}
              </span>
            </div>
          </div>
          {/* cart popup */}
          {openCart ? <Cart setOpenCart={setOpenCart} /> : null}

          {/* wishlist popup */}
          {openWishlist ? <Wishlist setOpenWishlist={setOpenWishlist} /> : null}
        </div>

        {/* header sidebar */}
        {open && (
          <div
            className={`fixed w-full bg-[#0000005f] z-20 h-full top-0 left-0`}
          >
            <div className="fixed w-[70%] bg-[#fff] h-screen top-0 left-0 z-10 overflow-y-scroll">
              <div className="w-full justify-between items-center flex px-3 pt-3">
                <div className="flex items-center gap-2">
                  <div
                    className="relative mr-[15px]"
                    onClick={() => setOpenWishlist(true) || setOpen(false)}
                  >
                    <AiOutlineHeart size={30} className="mt-2 ml-1" />
                    <span className="absolute right-0 top-0 rounded-full bg-[#4b3621] w-4 h-4 top right p-0 m-0 text-white font-mono text-[12px] leading-tight text-center">
                      {wishlist && wishlist.length}
                    </span>
                  </div>
                  <LanguageSwitcher />
                </div>
                <RxCross1
                  size={26}
                  className="cursor-pointer"
                  onClick={() => setOpen(false)}
                />
              </div>

              <div className="my-6 w-[92%] m-auto relative">
                <div className="flex items-center w-full h-[40px] px-2 border-[#008000] border-[2px] rounded-md bg-white">
                  <input
                    type="search"
                    placeholder={t("nav.searchPlaceholder")}
                    className="h-full flex-1 px-1 text-sm outline-none"
                    value={searchTerm}
                    onChange={handleSearchChange}
                  />

                  {/* Language Selector */}
                  <select
                    value={voiceLang}
                    onChange={(e) => setVoiceLang(e.target.value)}
                    title={t("nav.voiceSearch", "Voice search language")}
                    className="text-xs bg-slate-100 border border-slate-300 rounded px-1 py-0.5 text-slate-700 outline-none mr-1"
                  >
                    <option value="en-IN">EN</option>
                    <option value="hi-IN">हिंदी</option>
                    <option value="mr-IN">मराठी</option>
                  </select>

                  {/* Mic Button */}
                  {isSpeechSupported && (
                    <button
                      type="button"
                      onClick={toggleListening}
                      className={`p-1 rounded-full ${
                        isListening ? "bg-red-500 text-white animate-pulse" : "text-slate-600"
                      }`}
                    >
                      {isListening ? <BsMicFill size={16} /> : <BsMic size={16} />}
                    </button>
                  )}
                </div>

                {isListening && (
                  <div className="text-xs text-red-600 font-medium mt-1">
                    {t("nav.listening", { lang: voiceLang === "hi-IN" ? "हिंदी" : voiceLang === "mr-IN" ? "मराठी" : "English" })}
                  </div>
                )}

                {searchData && (
                  <div className="absolute bg-[#fff] z-10 shadow w-full left-0 p-3 mt-1 rounded-md max-h-[50vh] overflow-y-auto">
                    {searchData.map((i, index) => {
                      return (
                        <Link to={`/product/${i._id || i.name?.replace(/\s+/g, "-")}`} key={index}>
                          <div className="flex items-center py-1.5 border-b border-slate-100">
                            <img
                              src={i.images?.[0]?.url || i.image_Url?.[0]?.url || ""}
                              alt=""
                              className="w-[40px] h-[40px] object-cover rounded mr-2"
                            />
                            <div>
                              <h5 className="text-sm font-medium">{i.name}</h5>
                              <p className="text-xs text-slate-500">₹{i.discountPrice || i.originalPrice}</p>
                            </div>
                          </div>
                        </Link>
                      );
                    })}
                  </div>
                )}
              </div>

              <Navbar active={activeHeading} />
              <div className={`${styles.button} ml-4 !rounded-[4px]`}>
                <Link to={isSeller ? "/dashboard" : "/shop-create"}>
                  <h1 className="text-[#fff] flex items-center">
                    {isSeller ? t("nav.dashboard") : t("nav.becomeSeller")} <IoIosArrowForward className="ml-1" />
                  </h1>
                </Link>
              </div>
              <br />
              <br />
              <br />

              <div className="flex w-full justify-center">
                {isAuthenticated ? (
                  <div>
                    <Link to="/profile">
                      <img
                        src={`${user.avatar?.url}`}
                        alt=""
                        className="w-[60px] h-[60px] rounded-full border-[3px] border-[#0eae88]"
                      />
                    </Link>
                  </div>
                ) : (
                  <>
                    <Link
                      to="/login"
                      className="text-[18px] pr-[10px] text-[#000000b7]"
                    >
                      {t("nav.login")} /
                    </Link>
                    <Link
                      to="/sign-up"
                      className="text-[18px] text-[#000000b7]"
                    >
                      {t("nav.signup")}
                    </Link>
                  </>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  );
};

export default Header;
