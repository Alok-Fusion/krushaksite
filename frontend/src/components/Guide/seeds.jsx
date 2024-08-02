import React from 'react';
import { Link } from 'react-router-dom';
import styles from '../../styles/styles';
import seedsImage from '../../Assests/seeds.jpg';
import seedImage from "../../Assests/Seedss.jpg";
import fertilizerImage from "../../Assests/fertilizer.jpg";
import localVideo from '../../Assests/istockphoto-1478542045-640_adpp_is.mp4';  // Replace with the path to your downloaded video
import Fade from 'react-reveal/Fade';
import Bounce from 'react-reveal/Bounce'
const Seeds = () => {
  return (
    <div className="container mx-auto">
      <div className={`flex min-h-[50vh] my-4 mx-6  ${styles.noramlFlex}`}>
        <div style={{ border: '4px solid #422006', marginRight: '20px', width:'1800px' }}>
         <img
            src={seedsImage}
            alt="click me"
            className="max-w-full h-auto"
          />
         </div>
        <div  className='p-4'>
          <p className="text-lg font-bold " style={{ color: "#009900",fontStyle: 'italic'}}>
          Seeds and fertilizers are important in agriculture. Seeds are a key factor in agricultural production, and the quality of seeds can affect the performance of other inputs.
          Fertilizers provide plants with nutrients and organic matter to enhance soil fertility and ensure strong vegetative growth.They are the primary way that plantsreproduce.Seeds contain an embryo,nutrients for the embryo, and a seed coat. 
          </p>
          
        </div>
      </div>
      <Fade top distance='10%' duration={5000} forever>
      <div className="container mx-auto">
      <h2 className="mt-3 text-center text-4xl font-extrabold  "style={{ color: "#009900" }}>
        "Stop chemical, harvest natural" </h2></div> </Fade>
        
        <div className='p-8'>
        <p className="text-lg font-bold " style={{ color: "#009900", fontStyle: 'italic', float: 'left', width: '50%'}}>
        <h1 className='text-2xl font-semibold  underline underline-offset-8 '>Here are some tips for using fertilizers:</h1>
        <br/>
When to apply : <br/>
Apply fertilizer during planting, 1–2 inches below or below and to the side of the seed row. In cool, wet areas, you can apply a starter application in a subsurface band to boost seedling growth.
       <br/> 
       <br/>
How to apply : <br/>
Apply fertilizer around the base of the plant, extending to the drip line. For vegetables, place the fertilizer in a strip parallel to the planting row.
      <br/>
      <br/>
Application methods : <br/>
There are four main types of fertilizer application methods: broadcasting, foliar, placement, and fertigation. 

        </p>
      </div>
        <div className=" my-4 mx-4 shadow-md shadow-current" style={{marginLeft:'680px'}} >
        {/* Add the <video> element for your locally hosted video */}
        <video width="640" height="360" controls autoPlay loop>
          <source src={localVideo} type="video/mp4" />
          Your browser does not support the video tag.
        </video>
      </div>
      <br/>
     
      <div className=' sm:mx-auto sm:w-full sm:max-w-md  '> <Bounce middle distance='10%' duration={5000} forever> <h2 className=" text-center p-4 text-3xl font-extrabold "style={{ color: "#009900"  }}>Choose Seeds or Fertilizers </h2> </Bounce> </div>
      
      
     <div>
      <div >
         <Link to="/guide/seeds/beej">
          <div className='relative group overflow-hidden shadow-2xl shadow-current' style={{  marginRight: '20px', width:'380px' , marginLeft:"130px",marginBottom:"40px"}}>
          <img
            src={seedImage}
            alt="click me"
            className="max-w-full h-auto cursor-pointer transition-transform transform group-hover:scale-105"
          />
          {/* Text overlay */}
            <div className="absolute top-0 left-0 right-0 bottom-0 text-center opacity-10 group-hover:opacity-100 transition-opacity">
              <p className="text-white w-full h-full text-3xl font-extrabold bg-black p-4 opacity-40">Seeds</p>
            </div>
          </div>
          </Link>
          <div >    
         <Link to="/guide/seeds/khad">  
          <div className='relative group overflow-hidden my-50 mx-4 shadow-2xl shadow-current' style={{  marginLeft: '730px', width:'400px', marginTop:"-289px" }}>
          <img
            src={fertilizerImage }
            alt="click me"
            className="max-w-full h-auto cursor-pointer transition-transform transform group-hover:scale-105"
          />
          {/* Text overlay */}
            <div className="absolute top-0 left-0 right-0 bottom-0 text-center opacity-10 group-hover:opacity-100 transition-opacity">
              <p className="text-white w-full h-full text-3xl  font-extrabold bg-black p-4 opacity-40">Fertilizers</p>
            </div>
          </div>
          </Link>
        </div>
        </div>
      </div>
      <br/>
      
      <div  className='p-4'>
          <p className="text-lg font-bold " style={{ color: "#009900",fontStyle: 'italic'}}>
          Placing fertilizer in-furrow with the seed during planting is a common practice in small grain production and to some extent in row crop production. Placing fertilizer with the seed can be an effective and beneficial management practice, but over application and mismanagement can result in seedling damage, and ultimate stand and yield loss. The type of crop, fertilizer source, row spacing, and soil environment all affect how much fertilizer can be safely applied with seed.

Type of crop: Some crops are more susceptible to injury from in-furrow fertilization than others. Oil seed crops are particularly sensitive; therefore most guidelines allow no fertilizer placed with the seed of these crops. The general order of sensitively (most to least) among major Great Plains crops is soybeans ,sorghum ,corn , small grains. 

Type of fertilizer: Fertilizers are salts, and these salts can affect the ability of the seedling to absorb water… too much fertilizer (salt) and seedling desiccation or “burn” can occur. Some fertilizer materials have a higher salt index or burn potential than others. Salt index values are usually included in basic agronomic texts, or are available from fertilizer dealers or extension resources. As a general rule, most common N and K fertilizers have higher salt indexes than P fertilizers; therefore, a common predictor for the potential for salt damage is the sum of N+K2O per acre applied with the seed. For example, most guidelines for corn in 30 inch rows will allow for no more than 10 lb/A of N+K2O in medium to fine textured soils—assuming no urea-containing products are used. 
          </p>
          
        </div>

    </div>
  );
};

export default Seeds;