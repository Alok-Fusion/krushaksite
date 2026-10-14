import React, { useState, useEffect } from "react";
import {
  AiFillHeart,
  AiOutlineEye,
  AiOutlineHeart,
  AiOutlineShoppingCart,
} from "react-icons/ai";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import styles from "../../../styles/styles";
import { useDispatch, useSelector } from "react-redux";
import ProductDetailsCard from "../ProductDetailsCard/ProductDetailsCard";
import {
  addToWishlist,
  removeFromWishlist,
} from "../../../redux/actions/wishlist";
import { addTocart } from "../../../redux/actions/cart";
import { toast } from "react-toastify";
import Ratings from "../../Products/Ratings";

const ProductCard = ({ data, isEvent }) => {
  const { t } = useTranslation();
  const { wishlist } = useSelector((state) => state.wishlist);
  const { cart } = useSelector((state) => state.cart);
  const [click, setClick] = useState(false);
  const [open, setOpen] = useState(false);
  const dispatch = useDispatch();

  useEffect(() => {
    if (wishlist && wishlist.find((i) => i._id === data._id)) {
      setClick(true);
    } else {
      setClick(false);
    }
  }, [wishlist, data._id]);

  const removeFromWishlistHandler = (item) => {
    setClick(!click);
    dispatch(removeFromWishlist(item));
  };

  const addToWishlistHandler = (item) => {
    setClick(!click);
    dispatch(addToWishlist(item));
  };

  const addToCartHandler = (id) => {
    const isItemExists = cart && cart.find((i) => i._id === id);
    if (isItemExists) {
      toast.error(t("products.itemAlreadyInCart"));
    } else {
      if (data.stock < 1) {
        toast.error(t("products.stockLimited"));
      } else {
        const cartData = { ...data, qty: 1 };
        dispatch(addTocart(cartData));
        toast.success(t("products.addedToCart"));
      }
    }
  };

  return (
    <>
      <div className="w-full h-[370px] bg-white rounded-lg shadow-md p-3 relative cursor-pointer">
        <div className="flex justify-end"></div>
        <Link to={`${isEvent === true ? `/product/${data._id}?isEvent=true` : `/product/${data._id}`}`}>
          <img
            src={`${data.images && data.images[0]?.url}`}
            alt=""
            className="w-full h-[170px] object-contain"
          />
        </Link>
        <Link to={`/shop/preview/${data?.shop._id}`}>
          <h5 className={`${styles.shop_name}`}>{data.shop.name}</h5>
        </Link>
        <Link to={`${isEvent === true ? `/product/${data._id}?isEvent=true` : `/product/${data._id}`}`}>
          <h4 className="pb-3 font-[500]">
            {data.name.length > 40 ? data.name.slice(0, 40) + "..." : data.name}
          </h4>

          <div className="flex">
            <Ratings rating={data?.ratings} />
          </div>

          <div className="py-2 flex items-center justify-between">
            <div className="flex">
              <h5 className={`${styles.productDiscountPrice}`}>
                ₹{data.discountPrice} {t("common.units.perKg")}
              </h5>
            </div>
            <span className="font-[400] text-[17px] text-[#68d284]">
              {t("products.soldCount", { count: data?.sold_out || 0 })}
            </span>
          </div>
        </Link>

        {/* side options */}
        <div>
          {click ? (
            <AiFillHeart
              size={22}
              className="cursor-pointer absolute right-2 top-5"
              onClick={() => removeFromWishlistHandler(data)}
              color={click ? "red" : "#333"}
              title={t("products.removeFromWishlist")}
            />
          ) : (
            <AiOutlineHeart
              size={22}
              className="cursor-pointer absolute right-2 top-5"
              onClick={() => addToWishlistHandler(data)}
              color={click ? "red" : "#333"}
              title={t("products.addToWishlist")}
            />
          )}
          <AiOutlineEye
            size={22}
            className="cursor-pointer absolute right-2 top-14"
            onClick={() => setOpen(!open)}
            color="#333"
            title={t("products.quickView")}
          />
          <AiOutlineShoppingCart
            size={25}
            className="cursor-pointer absolute right-2 top-24"
            onClick={() => addToCartHandler(data._id)}
            color="#444"
            title={t("products.addToCart")}
          />
          {open ? <ProductDetailsCard setOpen={setOpen} data={data} /> : null}
        </div>
      </div>
    </>
  );
};

export default ProductCard;
