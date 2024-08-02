import React from 'react'
import Khad from "../components/Guide/Khadpg.jsx";
import Footer from "../components/Layout/Footer";
import Header from "../components/Layout/Header";
import styles from "../styles/styles";
import UreaImage from '../Assests/Urea.jpeg';
import DAPImage from '../Assests/DAP.jpg';
import PotashImage from '../Assests/Potash.jpg';
import NPKImage from '../Assests/npk.jpg'
import  AaImage from '../Assests/aa1.jpg'
import OrganicImage from '../Assests/of.jpeg'
import seedsImage from "../Assests/page.jpg"
const KhadPage = () => {
    const khadData = [
        {
            title: 'Urea (46-0-0) / यूरिया 46-0-0 ',
            description: 'Urea 46-0-0 is a white crystalline solid that contains 46% nitrogen. It IS a fertilizer and animal feed additive used in the agricultural industry.Urea is a highly concentrated nitrogen fertilizer that is water-soluble and releases nitrogen quickly. It is also inexpensive and has an NPK (nitrogen-phosphorus-potassium) ratio of 46-0-0. Urea can be applied to soil or used as a foliar spray for certain plants. It can also be mixed with other fertilizers, including sulfate of potash, but not with superphosphate fertilizers. Urea is not poisonous to mammals or birds and is a safe chemical to handle. However, if urea is not incorporated into the soil mechanically or watered in with rainfall or irrigation, a large portion of the nitrogen can be lost as a gas (ammonia). ',
            imageUrl:UreaImage,
            LinkUrl :"https://www.youtube.com/watch?v=LQOc6yH5a74"
      
              
          },
          {
            title: 'Diammonium phosphate (DAP) (18-46-0) / डायमोनियम फ़ॉस्फ़ेट (डीएपी)  ',
            description: 'Diammonium phosphate (DAP) 18-46-0 is a fertilizer that contains 18% nitrogen and 46% phosphorus. It IS a concentrated phosphate-based fertilizer that provides plants with water-soluble phosphorus and ammonium.DAP is a popular choice for growers around the world because of its combination of strong nitrogen and phosphorous nutrient content. It IS the second most commonly used fertilizer in India after urea. Farmers typically apply DAP just before or at the beginning of sowing. DAP is perfect for any agriculture crop to provide full phosphorus nutrition throughout crop growth and development. It also provides a starter dose of nitrogen and low sulfur. The value of nitrogen and phosphorus 18-46 increases the resistance of plants to adverse environmental factors (drought and frost), and also increases the resistance of plants to disease.',
            imageUrl : DAPImage, // Adjust the path to your image
            LinkUrl :"https://www.youtube.com/watch?v=R_1d0hI-NBw",
            
          },
      
          {
            title: 'Potash (0-0-60) / पोटाश (0-0-60)',
            description: 'Potash 0-0-60 is a concentrated fertilizer that contains 0% nitrogen, 0% phosphorus, and 60% potassium. It is used primarily in fertilizers to support plant growth, increase crop yield, and enhance water preservation. Potash is mainly mined from potassium-rich salts, most commonly potassium chloride (KCl). The ore is ground down and then filtered out by suspension. Potash is generally red or pink in color due to iron impurities. Potassium is critical to the distribution and metabolism of photosynthesized plant food. It also stimulates root growth and improves drought resistance by aiding in moisture conservation when temperatures increase.   ',
            imageUrl : PotashImage, // Adjust the path to your image
            LinkUrl :"https://www.youtube.com/watch?v=5DvrEK0huQ0",
            
          },
      
          {
            title: 'NPK fertilizers',
            description: 'NPK fertilizers are made up of three micronutrients: nitrogen (N), phosphorus (P), and potassium (K). The ratio of these three nutrients is indicated by three numbers, such as 16-20-18. For example, 16-20-18 means the fertilizer contains 16% nitrogen, 20% phosphorus, and 18% potassium.When choosing an NPK fertilizer, you can consider the following: Rooting: A fertilizer with a 1-2-1 ratio is good for encouraging plants to root.Flowering and fruiting: A fertilizer with a 1-1-2, 1-2-2, or 2-1-2 ratio is good for flowering and fruiting.Vegetables: Different vegetables have different needs, and their growth stage also plays a role. For example, tomatoes need a bit more potassium and phosphorus.When mixing NPK fertilizer ratios, you can combine solutions to create a new ratio. For example, 1 liter of a 3:4:6 solution plus 1 liter of a 5:2:6 solution yields 2 liters of a 4:3:6 solution.             ',
            imageUrl : NPKImage, // Adjust the path to your image
            LinkUrl :"https://www.youtube.com/watch?v=zKa_X2mYoEU",
            
          },
      
          {
            title: 'Anhydrous ammonia (82-0-0) / निर्जल अमोनिया (82-0-0)',
            description: 'Anhydrous ammonia is a chemical composed of one atom of nitrogen and three atoms of hydrogen; it is produced from nitrogen in the air and hydrogen from natural gas. Under normal temperatures and pressures, it exists as a gas, but is easily compressed to a liquid. The boiling point of this compound is –33° C.Anhydrous ammonia is stored as a liquid under pressure. When released into the environment, it becomes a toxic gas. It can expand 850 times when released into the air and can form large vapor clouds. Anhydrous ammonia can be used for pre-plant applications, side-dressed in the soil, or injected into irrigation water for surface irrigation. It is often the most cost-effective nitrogen fertilizer because of its high nitrogen content. ',
            imageUrl : AaImage, // Adjust the path to your image
            LinkUrl :"https://www.youtube.com/watch?v=fsZ91gmfaMA",
            
          },
      
          {
            title: 'Manure (Organic Fertilizer) / खाद (जैविक उर्वरक)',
            description: "Manures are the organic materials derived from animal, human and plant residues which contain plant nutrients in complex organic forms. Naturally occurring or synthetic chemicals containing plant nutrients are called fertilizers.Manure is an organic fertilizer made from the dung of domestic livestock, such as horses, cows, and poultry. It may also contain urine and bedding material like straw or sawdust.Manure is an environmentally valuable resource because it contains nutrients like nitrogen, phosphorus, and potassium. It adds humus (an organic component) to the soil, which makes it fertile.Soils with large amounts of the organic matter remain loose and light, retain more water and nutrients and promote the growth of soil microorganisms, thereby improving plant health and root development.",
            imageUrl : OrganicImage, // Adjust the path to your image
            LinkUrl :"https://www.youtube.com/watch?v=VndcqwV15zs",
          },
      
      
        ];
      

  return (
    <div>
        <Header/>
        <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <h2 className="mt-6 text-center text-4xl font-extrabold " style={{color:"#422006"}}>
          FERTILIZERS INFORMATION
        </h2>
      </div>
      
      <div className={`flex min-h-[80vh] 800px:min-h-[35vh]  w-full  ${styles.noramlFlex}`}>
        <div className='shadow-md shadow-current border-y-4' style={{borderColor:"#422006",borderStyle:"groove"}}> 
         <img
            src={seedsImage}
            alt="click me"
            className="max-w-full h-auto"
          /> </div> </div>
        <Khad khadji = {khadData}/>
        <br/>
        <Footer />
    </div>
  )
}

export default KhadPage;