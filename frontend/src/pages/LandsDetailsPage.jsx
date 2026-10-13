import React, { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import Header from "../components/Layout/Header";
import Footer from "../components/Layout/Footer";
import LandsDetails from "../components/Route/Lands/LandsDetail.jsx";
import Loader from "../components/Layout/Loader";
import { useSelector } from "react-redux";
import axios from "axios";
import { server } from "../server";

const LandsDetailsPage = () => {
  const { allLands } = useSelector((state) => state.lands);
  const { id } = useParams();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;
    const existing = allLands && allLands.find((i) => i._id === id);

    if (existing) {
      setData(existing);
      setLoading(false);
    } else if (id) {
      setLoading(true);
      axios
        .get(`${server}/lands/get-land/${id}`)
        .then((res) => {
          if (isMounted) {
            setData(res.data.land);
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
  }, [allLands, id]);

  return (
    <div>
      <Header />
      {loading ? (
        <div className="py-20 flex justify-center items-center">
          <Loader />
        </div>
      ) : data ? (
        <LandsDetails data={data} />
      ) : (
        <div className="w-full text-center py-20 bg-white min-h-[50vh] flex flex-col justify-center items-center">
          <h3 className="text-[22px] font-medium text-gray-700 mb-4">
            Land Listing Not Found
          </h3>
          <p className="text-gray-500 mb-6">
            The land listing you are looking for may have been removed or does not exist.
          </p>
          <Link
            to="/lands"
            className="bg-green-600 hover:bg-green-700 text-white px-6 py-2 rounded-md font-medium transition"
          >
            Browse Lands
          </Link>
        </div>
      )}
      <Footer />
    </div>
  );
};

export default LandsDetailsPage;