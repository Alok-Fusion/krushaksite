import React from 'react'
import Header from "../components/Layout/Header";
import Footer from "../components/Layout/Footer";
import Slider from "react-slick";
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";
import { Link} from "react-router-dom";
import Guide from "../components/Guide/guide.jsx";

const GuidePage = () => {
  return (
    <div>
        <Header activeHeading={5}/>
        <br/>
        <Guide/>
        <br/>
        <Footer />
    </div>
  )
}

/*const Guide = () => {
    const settings = {
        dots: true,
        infinite: true,
        speed: 500,
        slidesToShow: 3,
        slidesToScroll: 1,
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
               <Link to="/">
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
    img: "/data/my1.png"
   },
   {
    name: "weather",
    img: "/data/my2.jpg"
   },
   {
    name: "Farming tips",
    img: "/data/my3.jpg"
   },
   {
    name: "Farming tips",
    img: "/data/my3.jpg"
   },
   {
    name: "Farming tips",
    img: "/data/my3.jpg"
   }
]
*/
export default GuidePage