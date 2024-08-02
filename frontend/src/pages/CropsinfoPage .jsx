import React from 'react'
import Footer from "../components/Layout/Footer";
import Header from "../components/Layout/Header";
import styles from "../styles/styles";
import Crops from "../components/Guide/Cropes.jsx"
import WheatImage from '../Assests/wheat.jpg';
import RiceImage from '../Assests/rice.jpg';
import MaizeImage from '../Assests/corn.jpg';
import MiltesImage from '../Assests/milets.jpg'
import  RabiImage from '../Assests/rabi.jpg'
import KharibImage from '../Assests/kharib.jpg'
import seedsImage from "../Assests/page.jpg"

const CropsinfoPage  = () => {
  const cropsData = [
    {
      title: 'Wheat / गेहूं ',
      description: 'Wheat is a grass widely cultivated for its seed, a cereal grain that is a worldwide staple food. The many species of wheat together make up the genus Tritic, the most widely grown is common wheat (T. aestivum).Wheat is an important source of carbohydrates. Globally, it is the leading source of vegetable proteins in human food, having a protein content of about 13%, which is relatively high compared to other major cereals but relatively low in protein quality (supplying essential amino acids). When eaten as the whole grain, wheat is a source of multiple nutrients and dietary fiber.',
      imageUrl:WheatImage,
      LinkUrl :"https://en.wikipedia.org/wiki/Wheat"

        
    },
    {
      title: 'Rice /चावल ',
      description: 'Rice is a cereal grain, and in its domesticated form is the staple food for over half of the world human population, particularly in Asia and Africa, due to the vast amount of soil that is able to grow rice Dry rice grain is milled to remove the outer layers; depending on how much is removed, products range from brown rice to rice with germ and white rice. Some is parboiled to make it easy to cook. Rice contains no gluten; it provides protein but not all the essential amino acids needed for good health.Rice of different types is eaten around the world. Long-grain rice tends to stay intact on cooking; ' ,
      imageUrl : RiceImage, // Adjust the path to your image
      LinkUrl :"https://en.wikipedia.org/wiki/Rice",
      //YoutubeUrl:"https://www.youtube.com/watch?v=Z9HAy9EYKKs"
    },

    {
      title: 'Maize / मक्का',
      description: 'Maize also known as corn in North American and Australian English, is a tall stout grass that produces cereal grain. It was domesticated by indigenous peoples in southern Mexico about 9,000 years ago from wild teosinte. Native Americans planted it alongside beans and squashes in the Three Sisters polyculture. The leafy stalk of the plant gives rise to male inflorescences or tassels which produce pollen, and female inflorescences called ears which yield grain, known as kernels or seeds. In modern varieties, these are usually yellow or white; other varieties can be of many colors.      ',
      imageUrl : MaizeImage, // Adjust the path to your image
      LinkUrl :"https://en.wikipedia.org/wiki/Maize",
      //YoutubeUrl:"https://www.youtube.com/watch?v=Z9HAy9EYKKs"
    },

    {
      title: 'Millets / बाजरा',
      description: 'Millets are a highly varied group of small-seeded grasses, widely grown around the world as cereal crops or grains for fodder and human food. Most species generally referred to as millets belong to the tribe Paniceae.Millets are important crops in the semiarid tropics of Asia and Africa (especially in India, Mali, Nigeria, and Niger), with 97% of millet production in developing countries.This crop is favored due to its productivity and short growing season under dry, high-temperature conditions.The term millet is sometimes understood to comprise sorghum. The annual harvest of sorghum is twice the amount of other millets.[citation needed] Of these pearl millet is the most common. Pearl millet and sorghum are important crops in India and parts of Africa.',
      imageUrl : MiltesImage, // Adjust the path to your image
      LinkUrl :"https://en.wikipedia.org/wiki/Millet",
      //YoutubeUrl:"https://www.youtube.com/watch?v=Z9HAy9EYKKs"
    },

    {
      title: 'Rabi / रबी ',
      description: 'Rabi crops or the rabi harvest, also known as winter crops, are agricultural crops that are sown in winter and harvested in the spring in India, Pakistan and Bangladesh.[1] Complementary to the rabi crop is the kharif crop, which is grown after the rabi and zaid crops are harvested one after another respectively.Rabi crops are sown around mid-November, preferably after the monsoon rains are over, and harvesting begins in April / May. The crops are grown either with rainwater that has percolated into the ground or using irrigation. Good rain in winter spoils rabi crops but is good for kharif crops.The major rabi crop in India is wheat, followed by barley, mustard, sesame and peas.',
      imageUrl : RabiImage, // Adjust the path to your image
      LinkUrl :"https://en.wikipedia.org/wiki/Rabi_crop",
      //YoutubeUrl:"https://www.youtube.com/watch?v=Z9HAy9EYKKs"
    },

    {
      title: 'Kharif / ख‍रीफ ',
      description: "Kharif crops, also known as monsoon crops or autumn crops, are domesticated plants that are cultivated and harvested in India, Pakistan and Bangladesh during the Indian subcontinent's monsoon season, which lasts from June to November depending on the area.[1] Monsoon rains may begin as early as May in some parts of the Indian subcontinent, and crops are generally harvested from the third week of September to October. Rice, maize, and cotton are some of the major Kharif crops in India. Unlike the Rabi crops, which are grown in the winter, the kharif crops require good rainfall.The Kharif season varies by crop and region, starting at the earliest in May and ending at the latest in January. In India, the season is popularly considered to start in June and end in October.",
      imageUrl : KharibImage, // Adjust the path to your image
      LinkUrl :"https://en.wikipedia.org/wiki/Kharif_crop",
    },


  ];


  return (
    <div>
        <Header/>
        <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <h2 className="mt-6 text-center text-4xl font-extrabold " style={{ color: "#422006"}}>
          Crops Information
        </h2>
      </div>
      <div className={`flex min-h-[80vh] 800px:min-h-[35vh]  w-full  ${styles.noramlFlex}`}>
        <div className='shadow-md shadow-current border-y-4' style={{borderColor:"#422006",borderStyle:"groove"}}> 
         <img
            src={seedsImage}
            alt="click me"
            className="max-w-full h-auto"
          /> </div> </div>
      <Crops crops = {cropsData} />
        <br/>
        <Footer />
         </div>
  )
}

export default CropsinfoPage ;