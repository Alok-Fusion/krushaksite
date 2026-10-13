import React from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { navItems } from '../../static/data';
import styles from '../../styles/styles';

const navKeyMap = {
  "/": "nav.home",
  "/best-selling": "nav.bestSelling",
  "/products": "nav.products",
  "/lands": "nav.lands",
  "/guide": "nav.guide",
  "/disease-detection": "nav.cropDoctor",
  "/price-trends": "nav.priceTrends",
  "/faq": "nav.faq",
};

const Navbar = ({ active }) => {
  const { t } = useTranslation();

  return (
    <div className={`block 800px:${styles.noramlFlex} flex-wrap`}>
      {navItems &&
        navItems.map((i, index) => {
          const localizedTitle = navKeyMap[i.url] ? t(navKeyMap[i.url]) : i.title;
          return (
            <div className="flex whitespace-nowrap" key={index}>
              <Link
                to={i.url}
                className={`${
                  active === index + 1 ? "text-[#f63b60] font-bold" : "text-white"
                } pb-[20px] 800px:pb-0 font-[500] px-3 1100px:px-4 cursor-pointer hover:text-white/80 transition text-sm select-none`}
              >
                {localizedTitle}
              </Link>
            </div>
          );
        })}
    </div>
  );
};

export default Navbar;