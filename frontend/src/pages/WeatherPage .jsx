import React from 'react'
import Footer from "../components/Layout/Footer";
import Header from "../components/Layout/Header";
import styles from "../styles/styles";
import Weather from "../components/Guide/Weather.jsx";

const WeatherPage  = () => {
  return (
    <div>
        <Header/>
        <Weather />
        <Footer />
        </div>
  )
}

export default WeatherPage 