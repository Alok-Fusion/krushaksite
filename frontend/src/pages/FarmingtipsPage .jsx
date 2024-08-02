import React from 'react'
import Footer from "../components/Layout/Footer";
import Header from "../components/Layout/Header";
import styles from "../styles/styles";
import Farmingtips from "../components/Guide/farmingtips.jsx";
import farmersImage from '../Assests/harvest.jpg';
import irrigateImage from '../Assests/irrigate.jpg';
import seedsImage from "../Assests/page.jpg"
//import Bounce from 'react-reveal/Bounce'
const FarmingtipsPage  = () => {
  // Sample data for farming tips
  const farmingTipsData = [
    {
      title: 'Harvesting Tips',
      description: 'One of the most common and oldest methods of irrigation is surface irrigation.This method uses the force of gravity to distribute the water, which then seeps into the soil. Its also known as flood irrigation because it simply allows water to flow into an area. This method is not as efficient as other options because too much water is typically used to saturate the land A well-maintained landscape brings property owners a sense of pride and joy and improves curb appeal. However, it takes careful planning and finding the best irrigation techniques for your property to ensure effective and efficient watering. While there are many different types of irrigation systems, they all promote a healthy, green lawn and landscape and are beneficial in many ways, including the following:' ,
      imageUrl:farmersImage,
      LinkUrl :"https://www.vedantu.com/biology/harvesting/"

        
    },
    {
      title: 'Irrigation Techniques',
      description: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit.A well-maintained landscape brings property owners a sense of pride and joy and improves curb appeal. However, it takes careful planning and finding the best irrigation techniques for your property to ensure effective and efficient watering. While there are many different types of irrigation systems, they all promote a healthy, green lawn and landscape and are beneficial in many ways, including the following:Saving time: Watering your yard by hand is a time-consuming process, especially if you have a large yard. Choosing the proper irrigation system will free up your precious time and allow you to stop worryin',
      imageUrl : irrigateImage, // Adjust the path to your image
      LinkUrl :"https://www.geeksforgeeks.org/harvesting/",
      //YoutubeUrl:"https://www.youtube.com/watch?v=Z9HAy9EYKKs"
    },
    // Add more topics as needed
  ];

  return (
    <div
    >
        <Header/>
        <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <h2 className="mt-6 text-center text-4xl font-extrabold " style={{color : "#422006"}}>
          Farming Tips for Farmers
        </h2>
      </div>
  
    <div className={`flex min-h-[80vh] 800px:min-h-[35vh]  w-full  ${styles.noramlFlex}`}>
        <div className='shadow-md shadow-current border-y-4' style={{borderColor:"#422006",borderStyle:"groove"}}> 
         <img
            src={seedsImage}
            alt="click me"
            className="max-w-full h-auto"
          /> </div> </div>
          
      
         {/* Pass farming tips data to the Farmingtips component */}
      <Farmingtips farmingTips={farmingTipsData} />
        <br/>
       
        <Footer />
    </div>
  )
}

export default FarmingtipsPage ;