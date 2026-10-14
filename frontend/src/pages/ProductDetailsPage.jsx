import React, { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import Footer from "../components/Layout/Footer";
import Header from "../components/Layout/Header";
import ProductDetails from "../components/Products/ProductDetails";
import SuggestedProduct from "../components/Products/SuggestedProduct";
import Loader from "../components/Layout/Loader";
import { useSelector } from "react-redux";
import axios from "axios";
import { server } from "../server";
import { useTranslation } from "react-i18next";

const ProductDetailsPage = () => {
  const { t } = useTranslation();
  const { allProducts, isLoading: productsLoading } = useSelector(
    (state) => state.products
  );
  const { id } = useParams();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;
    const existing = allProducts && allProducts.find((i) => i._id === id);

    if (existing) {
      setData(existing);
      setLoading(false);
    } else if (id) {
      setLoading(true);
      axios
        .get(`${server}/product/get-product/${id}`)
        .then((res) => {
          if (isMounted) {
            setData(res.data.product);
            setLoading(false);
          }
        })
        .catch(() => {
          if (isMounted) {
            setData(null);
            setLoading(false);
          }
        });
    }

    return () => {
      isMounted = false;
    };
  }, [allProducts, id]);

  return (
    <div>
      <Header />
      {loading ? (
        <div className="py-20 flex justify-center items-center">
          <Loader />
        </div>
      ) : data ? (
        <>
          <ProductDetails data={data} />
          <SuggestedProduct data={data} />
        </>
      ) : (
        <div className="w-full text-center py-20 bg-white min-h-[50vh] flex flex-col justify-center items-center">
          <h3 className="text-[22px] font-medium text-gray-700 mb-4">
            {t("products.notFound")}
          </h3>
          <p className="text-gray-500 mb-6">
            {t("products.notFoundDesc")}
          </p>
          <Link
            to="/products"
            className="bg-green-600 hover:bg-green-700 text-white px-6 py-2 rounded-md font-medium transition"
          >
            {t("products.browseProducts")}
          </Link>
        </div>
      )}
      <Footer />
    </div>
  );
};

export default ProductDetailsPage;
