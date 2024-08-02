import React, { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import Footer from "../components/Layout/Footer";
import Header from "../components/Layout/Header";
import Loader from "../components/Layout/Loader";
import LandsCard from "../components/Route/LandsCard/LandsCard";
import styles from "../styles/styles";

const LandsPage = () => {
  
 const {allLands,isLoading} = useSelector((state) => state.lands);
 const [data, setData] = useState([]);
 
 useEffect(() => {
   if(allLands === null){
     setData([]);
   }else{
     setData(allLands);
   }
   //    window.scrollTo(0,0);
 }, [allLands]);

 return (
   <>
   {
     isLoading ? (
       <Loader />
     ) : (
       <div>
       <Header activeHeading={4} />
       <br />
       <br />
       <div className={`${styles.section}`}>
         <div className="grid grid-cols-1 gap-[20px] md:grid-cols-2 md:gap-[25px] lg:grid-cols-4 lg:gap-[25px] xl:grid-cols-5 xl:gap-[30px] mb-12">
           {data && data.map((i, index) => <LandsCard data={i} key={index}/>)}
         </div>
         {data && data.length === 0 ? (
           <h1 className="text-center w-full pb-[100px] text-[20px]">
             No lands available!
           </h1>
         ) : null}
       </div>
       <Footer />
     </div>
     )
   }
   </>
 );
};

export default LandsPage;