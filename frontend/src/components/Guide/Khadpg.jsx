import React from 'react'
import { Link } from "react-router-dom";
import Fade from 'react-reveal/Fade';
import Flip from 'react-reveal/Flip';
const Khadpg = ({khadji}) => {
  return (
    <div>
    {khadji.map((tip, index) => (
      <div key={index} className="flex items-center mb-8" >
        <Fade left distance="10%" duration={2000} >
         <div className="circle-icon ">
          <img src={tip.imageUrl}  className=" w-[250px] h-[250px] rounded-full border-[3px] shadow-lg shadow-current mx-12" style={{borderColor:"#422006"}} alt={tip.title} /> </div></Fade>
       
        <Fade right distance='10%' duration={2000} >
        <div className="description-container shadow-lg shadow-current bg-blue-700 bg-opacity-20   border-2  p-2 rounded-lg my-4 w-2/3 m-20 hover:shadow-xl transition-shadow duration-300" >
        <h1 className= "text-center shadow-lg text-shadow-sm" style={{ fontSize: '2rem', marginBottom: '2rem', fontWeight: 'bold' ,fontStyle: 'italic' }}>{tip.title}</h1>
{/* Content goes here */}
          <p className="text-black mt-1 mx-4 ">{tip.description} 
          <Link to={tip.LinkUrl} className="inline-block">
          <div className='w-[200px] bg-transparent  h-[10px]  flex items-center justify-center rounded-[10px] cursor-pointer'>
               <span className="text-[#FF0000] font-[italic] text-[18px] font-extrabold">
                  Click to watch Video...
               </span>
          </div>
        </Link>
        </p><br/>
        </div>
        </Fade>
           
        <hr />
        </div>
      ))}

    </div>
  )
}

export default Khadpg;