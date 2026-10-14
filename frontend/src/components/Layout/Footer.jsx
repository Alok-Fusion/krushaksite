import React from "react";
import {
  AiFillFacebook,
  AiFillInstagram,
  AiFillYoutube,
  AiOutlineTwitter,
} from "react-icons/ai";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import {
  footercompanyLinks,
  footerProductLinks,
  footerSupportLinks,
} from "../../static/data";

const Footer = () => {
  const { t } = useTranslation();

  const getTranslatedLink = (name) => {
    const map = {
      "About us": t("footer.aboutUs"),
      Careers: t("footer.careers"),
      "Our Blog": t("footer.ourBlog"),
      Reviews: t("footer.reviews"),
      Crops: t("footer.crops"),
      Pulses: t("footer.pulses"),
      Fertilizers: t("footer.fertilizers"),
      Seeds: t("footer.seeds"),
      "Featured Products": t("footer.featuredProducts"),
      FAQ: t("footer.faq"),
      "Contact Us": t("footer.contactUs"),
      Shipping: t("footer.shipping"),
      "Live chat": t("footer.liveChat"),
    };
    return map[name] || name;
  };

  return (
    <div className="bg-black text-white">
      <div className="md:flex md:justify-between md:items-center sm:px-12 px-4 bg-[#4CBB17] py-7">
        <h1 className="lg:text-4xl text-3xl md:mb-0 mb-6 lg:leading-normal font-semibold md:w-2/5">
          {t("footer.subscribeTitle")}
        </h1>
        <div>
          <input
            type="text"
            required
            placeholder={t("footer.emailPlaceholder")}
            className="text-gray-800
                sm:w-72 w-full sm:mr-5 mr-1 lg:mb-0 mb-4 py-2.5 rounded px-2 focus:outline-none"
          />
          <button className="bg-[#4b3621] hover:bg-sky-500 duration-300 px-5 py-2.5 rounded-md text-white md:w-auto w-full">
            {t("footer.submit")}
          </button>
        </div>
      </div>
      <div className="grid grid-cols-1 sm:gird-cols-3 lg:grid-cols-4 gap-6 sm:px-8 px-5 py-16 sm:text-center">
        <ul className="px-5 text-center sm:text-start flex sm:block flex-col items-center">
          <img
            src="https://onedrive.live.com/embed?resid=64385608D20B2754%2117784&authkey=%21ANLyZvQXIiH2hQg&width=327&height=135"
            alt=""
            style={{ filter: "brightness(0) invert(1)" }}
          />
          <br />
          <p>{t("footer.subscribeTagline")}</p>
          <div className="flex items-center mt-[15px]">
            <AiFillFacebook size={25} className="cursor-pointer" />
            <AiOutlineTwitter
              size={25}
              style={{ marginLeft: "15px", cursor: "pointer" }}
            />
            <AiFillInstagram
              size={25}
              style={{ marginLeft: "15px", cursor: "pointer" }}
            />
            <AiFillYoutube
              size={25}
              style={{ marginLeft: "15px", cursor: "pointer" }}
            />
          </div>
        </ul>

        <ul className="text-center sm:text-start">
          <h1 className="mb-1 font-semibold">{t("footer.company")}</h1>
          {footerProductLinks.map((link, index) => (
            <li key={index}>
              <Link
                className="text-gray-400 hover:text-sky-400 duration-300
                   text-sm cursor-pointer leading-6"
                to={link.link || "#"}
              >
                {getTranslatedLink(link.name)}
              </Link>
            </li>
          ))}
        </ul>

        <ul className="text-center sm:text-start">
          <h1 className="mb-1 font-semibold">{t("footer.shop")}</h1>
          {footercompanyLinks.map((link, index) => (
            <li key={index}>
              <Link
                className="text-gray-400 hover:text-sky-400 duration-300
                   text-sm cursor-pointer leading-6"
                to={link.link || "#"}
              >
                {getTranslatedLink(link.name)}
              </Link>
            </li>
          ))}
        </ul>

        <ul className="text-center sm:text-start">
          <h1 className="mb-1 font-semibold">{t("footer.support")}</h1>
          {footerSupportLinks.map((link, index) => (
            <li key={index}>
              <Link
                className="text-gray-400 hover:text-sky-400 duration-300
                   text-sm cursor-pointer leading-6"
                to={link.link || "#"}
              >
                {getTranslatedLink(link.name)}
              </Link>
            </li>
          ))}
        </ul>
      </div>

      <div
        className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-10
         text-center pt-2 text-gray-400 text-sm pb-8"
      >
        <span>{t("footer.copyright")}</span>
        <span>{t("footer.termsPrivacy")}</span>
        <div className="sm:block flex items-center justify-center w-full">
          <img
            src="https://hamart-shop.vercel.app/_next/image?url=%2F_next%2Fstatic%2Fmedia%2Ffooter-payment.a37c49ac.png&w=640&q=75"
            alt=""
          />
        </div>
      </div>
    </div>
  );
};

export default Footer;
