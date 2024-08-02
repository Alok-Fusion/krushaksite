import React, { useEffect, useState } from "react";
import axios from "axios";
import styles from "../../styles/styles";
import { Link } from "react-router-dom";
const News = () => {
  const [news, setNews] = useState([]);
  useEffect(() => {
    axios
      .get(
        "https://newsapi.org/v2/top-headlines?country=in&apiKey=b6c42530f0de46ad850171ec9e65904a"
      )
      .then((res) => {
        console.log(res.data.articles);
        setNews(res.data.articles);
      });
  }, []);
  return (
    <>
      <div className={`${styles.section} bg-white`}>
        <br />
        <h1 className="text-center  font-Poppins font-extrabold text-[40px] text-[#101339ed]">
          News Headlines
        </h1>
        <br/>
        <div className="grid grid-cols-1 gap-[20px] md:grid-cols-2 md:gap-[25px] lg:grid-cols-3 lg:gap-[25px] xl:grid-cols-4 xl:gap-[30px] mb-12 border-0 ml-2">
          {news.map((val) => {
            return (
              <div>
                <div
                  className="w-[20rem] h-auto border border-1px shadow-sm rounded-[8px]"
                >
                  <Link to={val.url}>
                    <img
                      src={val.urlToImage}
                      className="card-img-top w-full h-[170px] object-contain"
                      alt="Loading..."
                    />
                  </Link>
                  <div className="card-body">
                    <h5 className="text-center font-Poppins font-semibold">
                      {val.title}
                    </h5>
                    <br />
                    <p className="text-center">{val.description}</p>
                    <Link to={val.url}>
                      <p className="text-right font-Poppins text-blue-700">
                        Read more
                      </p>
                    </Link>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </>
  );
};

export default News;
