import React from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { brandingData, categoriesData } from "../../../static/data";
import styles from "../../../styles/styles";

const Categories = () => {
  const navigate = useNavigate();
  const { t } = useTranslation();

  const getBrandingContent = (id, fallbackTitle, fallbackDesc) => {
    switch (id) {
      case 1:
        return {
          title: t("home.branding.freeShippingTitle"),
          desc: t("home.branding.freeShippingDesc"),
        };
      case 2:
        return {
          title: t("home.branding.qualityProductsTitle"),
          desc: t("home.branding.qualityProductsDesc"),
        };
      case 4:
        return {
          title: t("home.branding.affordablePricesTitle"),
          desc: t("home.branding.affordablePricesDesc"),
        };
      case 5:
        return {
          title: t("home.branding.securePaymentsTitle"),
          desc: t("home.branding.securePaymentsDesc"),
        };
      default:
        return { title: fallbackTitle, desc: fallbackDesc };
    }
  };

  const getCategoryTitle = (title) => {
    const map = {
      Pulses: t("categories.pulses"),
      Vegetables: t("categories.vegetables"),
      Spices: t("categories.spices"),
      Flowers: t("categories.flowers"),
      Dairy: t("categories.dairy"),
      "Animal based": t("categories.animalBased"),
      Crops: t("categories.crops"),
      "Crops Fertilizers": t("categories.cropsFertilizers"),
      Seeds: t("categories.seeds"),
      Others: t("categories.others"),
    };
    return map[title] || title;
  };

  return (
    <>
      <div className={`${styles.section} hidden sm:block`}>
        <div
          className={`branding my-12 flex justify-between w-full shadow-sm bg-white p-5 rounded-md`}
        >
          {brandingData &&
            brandingData.map((i, index) => {
              const content = getBrandingContent(i.id, i.title, i.Description);
              return (
                <div className="flex items-start" key={index}>
                  {i.icon}
                  <div className="px-3">
                    <h3 className="font-bold text-sm md:text-base">{content.title}</h3>
                    <p className="text-xs md:text-sm">{content.desc}</p>
                  </div>
                </div>
              );
            })}
        </div>
      </div>

      <div
        className={`${styles.section} bg-white p-6 rounded-lg mb-12`}
        id="categories"
      >
        <div className="grid grid-cols-1 gap-[5px] md:grid-cols-2 md:gap-[10px] lg:grid-cols-4 lg:gap-[20px] xl:grid-cols-5 xl:gap-[25px]">
          {categoriesData &&
            categoriesData.map((i) => {
              const handleSubmit = (cat) => {
                navigate(`/products?category=${cat.title}`);
              };
              return (
                <div
                  className="w-full h-[100px] flex items-center justify-between cursor-pointer overflow-hidden"
                  key={i.id}
                  onClick={() => handleSubmit(i)}
                >
                  <h5 className={`text-[18px] leading-[1.3]`}>{getCategoryTitle(i.title)}</h5>
                  <img
                    src={i.image_Url}
                    className="w-[120px] object-cover"
                    alt={i.title}
                  />
                </div>
              );
            })}
        </div>
      </div>
    </>
  );
};

export default Categories;
