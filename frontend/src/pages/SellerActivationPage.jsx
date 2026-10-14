import axios from "axios";
import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { server } from "../server";
import { useTranslation } from "react-i18next";

const SellerActivationPage = () => {
  const { t } = useTranslation();
  const { activation_token } = useParams();
  const [error, setError] = useState(false);

  useEffect(() => {
    if (activation_token) {
      const sendRequest = async () => {
        await axios
          .post(`${server}/shop/activation`, {
            activation_token,
          })
          .then((res) => {
            console.log(res);
          })
          .catch((err) => {
            setError(true);
          });
      };
      sendRequest();
    }
  }, [activation_token]);

  return (
    <div
      style={{
        width: "100%",
        height: "100vh",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
      }}
    >
      {error ? (
        <p className="text-xl text-red-500">{t("auth.tokenExpired")}</p>
      ) : (
        <p className="text-xl text-green-600">{t("auth.accountCreated")}</p>
      )}
    </div>
  );
};

export default SellerActivationPage;
