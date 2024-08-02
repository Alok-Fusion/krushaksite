import React from 'react'
import { Link } from "react-router-dom";
//import YouTube from 'react-youtube';
import Bounce from 'react-reveal/Bounce'

const farmingtips = ({farmingTips}) => {
  return (
   <div>
    <Bounce middle distance='10%' duration={5000} > 
    <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <h2 className="mt-4 text-center text-3xl font-extrabold  " style={{color : "#422006"}}>
          What is Farming ?
        </h2>
      </div> </Bounce>
    <div className='p-6'><p className='text-lg font-bold my-1' style={{color: "#009900",fontStyle: 'italic'}}>Farming is the process of working the ground, planting seeds, and growing edible plants. It can also include raising animals for milk or meat, or cultivating domestic animals, fish, birds, plants, and crops. The purpose of farming is to harvest products or reproduce a biological means of production. 
Farming can involve the following steps: Soil preparation, Cleaning, Drying, Fumigation. 
Synonyms of farming include: Agriculture, Cultivation, Husbandry, Land management.The major agricultural products can be broadly grouped into foods, fibers, fuels, and raw materials (such as rubber). Food classes include cereals (grains), vegetables, fruits, cooking oils, meat, milk, eggs, and fungi.</p> 
<Bounce middle distance='10%' duration={5000} > 
<div className="sm:mx-auto sm:w-full sm:max-w-md">
        <h2 className="mt-4 text-center text-3xl font-extrabold  " style={{color : "#422006"}}>
          What is Smart Farming ?
        </h2>
      </div>
 </Bounce> 
 <p className='text-lg font-bold my-1 p-4' style={{color: "#009900",fontStyle: 'italic'}}>Smart farming in agriculture involves using various software and equipment to optimize and automate routine processes. With the spread of the Internet and mobile devices, such technologies have become 
 available not only for large companies but also for small private farms.</p> 
 <Bounce middle distance='10%' duration={5000} > 
 <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <h2 className="mt-4 text-center text-3xl font-extrabold  " style={{color : "#422006"}}>
          Smart Farming Tips & Techniques
        </h2>
      </div>
      </Bounce>
 </div>



      {/* Map through farming tips data and render each topic */}
      {farmingTips.map((tip, index) => (
        <div key={index} className="flex items-center" >
           <div className="circle-icon">
            <img src={tip.imageUrl}  className="  h-2/3 w-2/3 rounded-full m-20 border-4 border-green-500" alt={tip.title} /> </div>
         
          
          <div className="description-container  bg-blue-700 bg-opacity-20   border-2 border-green-700 p-10 rounded-lg my-4 w-2/3 m-20">
          <h1 className= "text-center" style={{ fontSize: '2rem', marginBottom: '2rem', fontWeight: 'bold' ,fontStyle: 'italic' }}>{tip.title}</h1>
  {/* Content goes here */}
            <p className="text-black">{tip.description} 
            <Link to={tip.LinkUrl} className="inline-block">
            <div className='w-[110px] bg-transparent  h-[10px]  flex items-center justify-center rounded-[10px] cursor-pointer'>
                 <span className="text-[#000000] font-[italic] text-[18px] font-extrabold">
                    Read more...
                 </span>
            </div>
        </Link>
            </p>
            
          
          </div>
          
          <hr />
        </div>
      ))}
    </div>
  )
}

export default farmingtips;

