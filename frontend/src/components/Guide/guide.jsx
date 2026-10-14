import React from 'react'
import { Link } from 'react-router-dom';
import Slider from 'react-slick';
import { useTranslation } from "react-i18next";

const Guide = () => {
    const { t } = useTranslation();
    const settings = {
        dots: true,
        infinite: true,
        speed: 500,
        slidesToShow: 3,
        slidesToScroll: 2,
        autoplay: true,
        autoplaySpeed: 2000, 
        prevArrow: <SampleNextArrow />,
        nextArrow: <SamplePrevArrow />,
    };

    const guideItems = [
      {
        name: t("guide.farmingTips"),
        img: "/data/my11.png",
        path: "/guide/farmingtips"
      },
      {
        name: t("guide.weather"),
        img: "/data/my2.jpg",
        path: "/guide/weather"
      },
      {
        name: t("guide.cropInfo"),
        img: "/data/my12.jpg",
        path: "/guide/cropsinfo"
      },
      {
        name: t("guide.seeds"),
        img: "/data/my7.jpg",
        path: "/guide/seeds" 
      },
      {
        name: t("guide.marketNews"),
        img: "/data/my8.jpg",
        path:"/guide/news"
      }
    ];

 return( 
 <div  className=" w-3/4 m-auto">
    <div className=" mt-3">
    <Slider {...settings}>
        {guideItems.map((d, index)=> (
            <div className='bg-[#65a30d] h-[400px] text-black rounded-xl' key={index}>
                <div className='h-56 rounded-t-xl bg-indigo-500 flex justify-center items-center'>
                    <img src={d.img} alt=""  className='h-44 w-44 rounded-full'/>
                </div>
               <div className='"flex flex-col justify-center items-center gap-4 p-4'>
               <p className='text-xl font-semibold text-center'>{d.name}</p> 
               <br/>
               <Link to={d.path}>
               <div className='flex justify-center'>
               <button className='bg-indigo-500 text-white text-lg px-6 py-1 rounded-xl '>{t("common.readMore")}</button>
               </div>
               </Link>
               </div>
           </div>
        ))}
        </Slider>
    
    </div> 

 </div>
 );
}

function SampleNextArrow(props) {
    const { className, style, onClick } = props;
    return (
      <div
        className={className}
        style={{ ...style, display: "block", background: "green" }}
        onClick={onClick}
      />
    );
  }
  
  function SamplePrevArrow(props) {
    const { className, style, onClick } = props;
    return (
      <div
        className={className}
        style={{ ...style, display: "block", background: "green" }}
        onClick={onClick}
      />
    );
  }

export default Guide;