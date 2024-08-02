import React, { useState } from "react";
import { HiLocationMarker } from "react-icons/hi";
import { WiHumidity } from "react-icons/wi";
import { TiWeatherWindy } from "react-icons/ti";
import { CiTempHigh } from "react-icons/ci";
const Weather = () => {
  const api = {
    key: "0a5cba009d748e0bf9b924bf3fb1a977",
    base: "https://api.openweathermap.org/data/2.5/",
  };

  const [search, setSearch] = useState("");
  const [weather, setWeather] = useState({});

  const searchPressed = () => {
    fetch(`${api.base}weather?q=${search}&units=metric&APPID=${api.key}`)
      .then((res) => res.json())
      .then((result) => {
        console.log(result);
        setWeather(result);
      });
  };
  return (
    <div
      style={{
        backgroundImage: `url(${require("../../Assests/p.jpg")})`,
      }}
    >
    
      <h1 className=" text-center text-[35px] text-white font-Poppins font-semibold">
        Weather Information
      </h1>
      <div  className="flex justify-center">
      <div className="container w-[40%] bg-[#b7b7b717] rounded-3xl text-white">
        <br />
        <div className="flex justify-center relative">
          <input
            type="text"
            placeholder="Enter your city name"
            onChange={(e) => setSearch(e.target.value)}
            className="h-[40px] w-auto px-2 bg-[#b7b7b717] border-[2px] rounded-2px justify-end "
          />
          <button
            onClick={searchPressed}
            className="border-[2px] rounded-2px h-[40px] w-auto bg-[#b7b7b717] "
          >
            Search
          </button>
        </div>
        <br />
        {typeof weather.main !== "undefined" ? (
          <div>
            <div className=" flex justify-center relative">
              <HiLocationMarker size={45} />
              <p className="text-[73px] font-Poppins font-extrabold text-left">
                {weather.name}
              </p>
              <p className="font-Poppins font-semibold text-[20px]">
                {weather.sys.country}
              </p>
            </div>
            <div className="flex justify-center">
              <CiTempHigh size={40} />
              <h5 className="font-Poppins font-medium text-[53px] text-center mr-9">
                {Math.round(weather.main.temp)}℃
              </h5>
            </div>
            <br />
            <div className="flex justify-center">
              <p className="font-Poppins font-semibold text-[47px]">
                {weather.weather[0].main}
              </p>
            </div>
            <br />
            <div className=" flex justify-center">
              <WiHumidity size={40} />
              <h5 className="font-Poppins font-bold text-[47px] ">
                {weather.main.humidity}% Humidity
              </h5>
            </div>
            <br />
            <div className=" flex justify-center">
              <TiWeatherWindy size={40} />
              <h5 className="font-Poppins font-bold text-[47px] ">
                {weather.wind.speed} Kmph
              </h5>
            </div>
          </div>
        ) : (
          <div>
            <div className=" flex justify-center relative">
              <HiLocationMarker size={45} />
              <p className="text-[73px] font-Poppins font-extrabold text-left">
                Mumbai
              </p>
              <p className="font-Poppins font-semibold text-[20px]">
                IN
              </p>
            </div>
            <div className="flex justify-center">
              <CiTempHigh size={40} />
              <h5 className="font-Poppins font-medium text-[53px] text-center mr-9">
                31℃
              </h5>
            </div>
            <br />
            <div className="flex justify-center">
              <p className="font-Poppins font-semibold text-[47px]">
                Smoke
              </p>
            </div>
            <br />
            <div className=" flex justify-center">
              <WiHumidity size={40} />
              <h5 className="font-Poppins font-bold text-[47px] ">
                33% Humidity
              </h5>
            </div>
            <br />
            <div className=" flex justify-center">
              <TiWeatherWindy size={40} />
              <h5 className="font-Poppins font-bold text-[47px] ">
                6.1 Kmph
              </h5>
            </div>
          </div>
        )}
      </div>
      <br/>
    </div>
    </div>
  );
};

export default Weather;
