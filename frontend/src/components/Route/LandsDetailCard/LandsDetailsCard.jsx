import React, { useEffect, useState } from 'react';
import { RxCross1 } from 'react-icons/rx';
import { Link, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import styles from '../../../styles/styles';
import { AiFillHeart, AiOutlineHeart, AiOutlineMessage } from 'react-icons/ai';
import { addToWishlist, removeFromWishlist } from '../../../redux/actions/wishlist';
import { useDispatch, useSelector } from 'react-redux';
import axios from 'axios';
import { server } from '../../../server';
import { toast } from 'react-toastify';

const LandsDetailsCard = ({ setOpen, data }) => {
  const { t } = useTranslation();
  const { wishlist } = useSelector((state) => state.wishlist);
  const dispatch = useDispatch();
  const [click, setClick] = useState(false);
  const { user, isAuthenticated } = useSelector((state) => state.user);
  const navigate = useNavigate();

  const handleMessageSubmit = async () => {
    if (isAuthenticated) {
      const groupTitle = data._id + user._id;
      const userId = user._id;
      const sellerId = data.shop._id;
      await axios
        .post(`${server}/conversation/create-new-conversation`, {
          groupTitle,
          userId,
          sellerId,
        })
        .then((res) => {
          navigate(`/inbox?${res.data.conversation._id}`);
        })
        .catch((error) => {
          toast.error(error.response?.data?.message || "Failed to create conversation");
        });
    } else {
      toast.error("Please login to create a conversation");
    }
  };

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

  return (
    <div className="bg-[#fff]">
      {data ? (
        <div className="fixed w-full h-screen top-0 left-0 bg-[#00000030] z-40 flex items-center justify-center">
          <div className="w-[90%] 800px:w-[60%] h-[90vh] overflow-y-scroll 800px:h-[75vh] bg-white rounded-md shadow-sm relative p-4">
            <RxCross1 size={30} className="absolute right-3 top-3 z-50 cursor-pointer" onClick={() => setOpen(false)} />
            <div className="block w-full 800px:flex">
              <div className="w-full 800px:w-[50%]">
                <img src={`${data.images && data.images[0]?.url}`} alt="" />
                <div className="flex">
                  <Link to={`/shop/preview/${data.shop._id}`} className="flex">
                    <img src={`${data.images && data.images[0]?.url}`} alt="" className="w-[50px] h-[50px] rounded-full mr-2" />
                    <div>
                      <h3 className={`${styles.shop_name}`}>
                        {data.shop.name}
                      </h3>
                      <h5 className="pb-3 text-[15px]">{data?.ratings} {t("products.ratings")}</h5>
                    </div>
                  </Link>
                </div>
                <div className={`${styles.button} bg-[#000] mt-4 rounded-[4px] h-11`} onClick={handleMessageSubmit}>
                  <span className="flex items-center text-[#fff]">
                    {t("products.sendMessage")} <AiOutlineMessage className="ml-1" />
                  </span>
                </div>
              </div>
              <div className="w-full 800px:w-[50%] pt-5 pl-[5px] pr-[5px]">
                <h1 className={`${styles.landsTitle} text-[20px]`}>{data.name}</h1>
                <p>{data.description}</p>
                <br />
                <br />
                <h3 className="font-[700] text-[17px]">{t("lands.ownerAddress")}</h3>
                <p>{data.address}</p>
                <div className="flex pt-3">
                  <h4 className={`${styles.landActualPrice}`}>{"₹" + data.price}</h4>
                </div>
                <div className="flex items-center mt-12 justify-between pr-3">
                  <div className="flex items-center">
                    {click ? (
                      <AiFillHeart
                        size={30}
                        className="cursor-pointer mr-2"
                        onClick={() => removeFromWishlistHandler(data)}
                        title={t("products.removeFromWishlist")}
                      />
                    ) : (
                      <AiOutlineHeart
                        size={30}
                        className="cursor-pointer mr-2"
                        onClick={() => addToWishlistHandler(data)}
                        title={t("products.addToWishlist")}
                      />
                    )}
                    <span>{t("lands.addRemoveWishlist")}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
};

export default LandsDetailsCard;