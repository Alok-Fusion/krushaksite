import React, { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useParams } from "react-router-dom";
import { getAllOrdersOfUser } from "../../redux/actions/order";
import { useTranslation } from "react-i18next";

const TrackOrder = () => {
  const { t } = useTranslation();
  const { orders } = useSelector((state) => state.order);
  const { user } = useSelector((state) => state.user);
  const dispatch = useDispatch();

  const { id } = useParams();

  useEffect(() => {
    if (user?._id) {
      dispatch(getAllOrdersOfUser(user._id));
    }
  }, [dispatch, user?._id]);

  const data = orders && orders.find((item) => item._id === id);

  return (
    <div className="w-full h-[80vh] flex justify-center items-center">
      {" "}
      <>
        {data && data?.status === "Processing" ? (
          <h1 className="text-[20px]">{t("profile.orderStatusProcessing")}</h1>
        ) : data?.status === "Transferred to delivery partner" ? (
          <h1 className="text-[20px]">
            {t("profile.orderStatusTransferred")}
          </h1>
        ) : data?.status === "Shipping" ? (
          <h1 className="text-[20px]">
            {t("profile.orderStatusShipping")}
          </h1>
        ) : data?.status === "Received" ? (
          <h1 className="text-[20px]">
            {t("profile.orderStatusReceived")}
          </h1>
        ) : data?.status === "On the way" ? (
          <h1 className="text-[20px]">
            {t("profile.orderStatusOnTheWay")}
          </h1>
        ) : data?.status === "Delivered" ? (
          <h1 className="text-[20px]">{t("profile.orderStatusDelivered")}</h1>
        ) : data?.status === "Processing refund" ? (
          <h1 className="text-[20px]">{t("profile.orderStatusRefundProcessing")}</h1>
        ) : data?.status === "Refund Success" ? (
          <h1 className="text-[20px]">{t("profile.orderStatusRefundSuccess")}</h1>
        ) : null}
      </>
    </div>
  );
};

export default TrackOrder;
