import React from 'react'
import { Link } from 'react-router-dom';
import Slider from 'react-slick';

const guide = () => {
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
 return( 
 <div  className=" w-3/4 m-auto">
    <div className=" mt-3">
    <Slider {...settings}>
        {data.map((d)=> (
            <div className='bg-[#65a30d] h-[400px] text-black rounded-xl'>
                <div className='h-56 rounded-t-xl bg-indigo-500 flex justify-center items-center'>
                    <img src={d.img} alt=""  className='h-44 w-44 rounded-full'/>
                </div>
               <div className='"flex flex-col justify-center items-center gap-4 p-4'>
               <p className='text-xl font-semibold text-center'>{d.name}</p> 
               <br/>
               <Link to={d.path}>
               <div className='flex justify-center'>
               <button className='bg-indigo-500 text-white text-lg px-6 py-1 rounded-xl '>Read more</button>
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
  
 

const data = [
   {
    name: "Farming tips",
    img: "/data/my11.png",
    path: "/guide/farmingtips"
   },
   {
    name: "Weather",
    img: "/data/my2.jpg",
    path: "/guide/weather"
   },
   {
    name: "Crops Information",
    img: "/data/my12.jpg",
    path: "/guide/cropsinfo"
   },
   {
    name: "Seeds & Fertilizers Information",
    img: "/data/my7.jpg",
    path: "/guide/seeds" 
   },
   {
    name: "News",
    img: "/data/my8.jpg",
    path:"/guide/news"
   }
]
export default guide