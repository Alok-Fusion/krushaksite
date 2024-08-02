import React from "react";
import { Link } from "react-router-dom";
import styles from "../../../styles/styles";
//import farmersImage from '../../Assests/farmers.png'; // Corrected import
import farmersImage from '../../../Assests/ynot.jpg';


const Hero = () => {
  return (
    <div
      className={`relative min-h-[80vh] 800px:min-h-[100vh] w-full  bg-no-repeat ${styles.noramlFlex}`}
      style={{
        backgroundImage:
        `url(${farmersImage})`,
        //backgroundColor: 'rgba(0, 0, 0, 1)', // Adjust the alpha channel (0.5 for 50% opacity)
      }}
    >
      <div className={`${styles.section} w-[90%] 800px:w-[60%]`}>
        
        <h1
          className={`text-[35px] leading-[1] 800px:text-[50px] text-[#fff] font-[600] capitalize  pb-32`}
        >
          Krushak:) Fresh from the farms 
        </h1>
        { /*<p className="pt-5 text-[16px] font-[Poppins] font-[400] text-[#fff]">
          
    </p> */}
        <Link to="/products" className="inline-block">
            <div className='w-[150px] border border-3px bg-[#6a4321] h-[50px] my-3 flex items-center justify-center rounded-[10px] cursor-pointer'>
                 <span className="text-[#fff] font-[Poppins] text-[18px]">
                    Shop Now
                 </span>
            </div>
        </Link>
      </div>
    </div>
  );
};

export default Hero;