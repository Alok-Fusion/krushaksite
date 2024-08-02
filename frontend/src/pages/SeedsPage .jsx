import React from 'react'
import Footer from "../components/Layout/Footer";
import Header from "../components/Layout/Header";
import styles from "../styles/styles";
import Seeds from "../components/Guide/seeds.jsx";
import seedsImage from "../Assests/page.jpg"
const SeedsPage  = () => {
  return (
    <div>
        <Header/>
        <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <h2 className="mt-6 text-center text-4xl font-extrabold  "style={{ color: "#422006" }}>
          Seeds and Fertilizers 
        </h2>
        </div>
        <div className={`flex min-h-[80vh] 800px:min-h-[35vh]  w-full  ${styles.noramlFlex}`}>
        <div className='shadow-md shadow-current border-y-4' style={{borderColor:"#422006",borderStyle:"groove"}}> 
         <img
            src={seedsImage}
            alt="click me"
            className="max-w-full h-auto"
          /> </div> </div>
      <Seeds/>
        <br/>
        <Footer />
        </div>
  )
}

export default SeedsPage 