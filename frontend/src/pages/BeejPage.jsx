import React from 'react'
import Beej from "../components/Guide/Beejpg.jsx";
import Footer from "../components/Layout/Footer";
import Header from "../components/Layout/Header";
import styles from "../styles/styles";
import NucleusImage from '../Assests/nucleus seeds.jpg';
import BreederImage from '../Assests/breeder-seed.png';
import FoundationImage from '../Assests/foundation-seed.png';
import CertifiedImage from '../Assests/certified-seed.png'
import  RegisteredImage from '../Assests/registered seed.jpg'
import CommercialImage from '../Assests/commerial-seed.png'
import seedsImage from "../Assests/page.jpg"

const BeejPage = () => {
    const beejData = [
        {
            title: 'Nucleus Seed / नाभिक बीज',
            description: 'A nucleus seed is the initial amount of pure seed produced by a breeder to develop a new variety. Nucleus seeds are 100% pure and do not contain any other impurities. The breeder who developed the variety produces the nucleus seeds.The nucleus seed is genetically cent percent pure and does not contain other physical impurities. The nucleus seed is produced strictly under isolation so as to avoid both genetically and physical contamination. Nucleus seed should retain original vigour of the variety or parental line.This is the hundred percent genetically pure seed with physical purity and produced by the original breeder/Institute /State Agriculture University (SAU) from basic nucleus seed stock. A pedigree certificate is issued by the producing breeder.',
            imageUrl:NucleusImage,
          
      
              
          },
          {
            title: 'Breeder Seed / प्रजनक बीज',
            description: 'A breeder seed is a seed or vegetative propagating material that is directly controlled by the plant breeder who developed the variety.Breeder seeds are the source of all seeds used to produce cultivars of the certified class.Breeder seeds are produced from nucleus seed, which is 100% genetically pure and produced under the direct supervision of the concerned plant breeder. Breeder seeds are typically issued a white tag and do not have an official color designation.Breeder seeds are the source of all seeds used to produce cultivars of the certified class.Breeder seeds are produced from nucleus seed, which is 100% genetically pure and produced under the direct supervision of the concerned plant breeder. Breeder seeds are typically issued a white tag and do not have an official color designation. ',
            imageUrl : BreederImage, // Adjust the path to your image
           
          },
      
          {
            title: 'Foundation Seed / आधार बीज ',
            description: 'Foundation seed, also known as basic seed, is a type of seed that is produced by trained officers at an agricultural station. It is the descendant of breeder seed and is produced under conditions that ensure maintaining genetic purity and identity.Foundation seeds are produced in accordance with regulated national standards.Foundation seeds are produced by recognized seed producing agencies in public and private sector.Foundation seeds are produced under the supervision of seed certification agencies.Foundation seeds are the source of all other certified seed classes.Certified seed is the progeny of foundation seed and its production is supervised and approved by certification agency',
            imageUrl : FoundationImage, // Adjust the path to your image
            
          },
      
          {
            title: 'Certified Seed / प्रमाणित बीज',
            description: 'Certified seed is seed from a known variety that meets strict seed certification standards. Certified seed is the progeny of foundation seed, which is produced by trained officers of an agricultural station. Certified seed is produced by state and national seeds corporations, and private seed companies on the farms of progressive growers. Certified seed is free of prohibited noxious weed seeds and must meet specified standards for other crops, inert matter, weed seeds, and germination. Before harvest, certified seed crops are inspected by AsureQuality to confirm the variety and check for any problem weeds.Certified Seed: Certified seed shall be the progeny of foundation seed and its production shall be so handled as to maintain specific genetic identity and purity according to the standards prescribed for the crop being certified',
            imageUrl : CertifiedImage, // Adjust the path to your image
           
          },
      
          {
            title: 'Registered Seed / पंजीकृत बीज',
            description: 'A registered seed is a seed that is produced from foundation seed, cultivated according to certification regulations, and meets the specifications of the state is official seed certifying agency.Registered seeds are the progeny of foundation seeds that are handled to maintain their genetic identity and purity according to the standard specified for the particular crop being certified. Registered seed : Registered seed shall be the progeny of foundation seed that is so handled as to maintain its genetic identity and purity according to standard specified for the particular crop being certified. A purple colour certificate is issued for this category of seed.',
            imageUrl : RegisteredImage, // Adjust the path to your image
           
          },
      
          {
            title: 'Commercial Seed /  वाणिज्यिक बीज ',
            description: "Commercial seeds are seeds that farmers use to grow their crops. They can include maize, soybeans, vegetables, cereals, cotton, rice, canola, and other products.Formal seed systems are largely commercial and can come from research institutions, governments, and seed companies. They ensure quality since production, processing, and marketing are all subject to regulation, inspection, and certification.COMMERCIAL SEED means REGISTERED SEED, CERTIFIED SEED, or NON-CERTIFIED SEED, that is sold for purposes other than seed production. COMMERCIAL SEED means seed of HYBRIDS that is sold for purposes other than the production of propagating material.",
            imageUrl : CommercialImage, // Adjust the path to your image
           
          },
      
      
    ]
  return (
    <div>
        <Header/>
        <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <h2 className="mt-6 text-center text-4xl font-extrabold" style ={{color :"#422006"}}>
          SEEDS INFORMATION 
        </h2>
      </div>
      <div className={`flex min-h-[80vh] 800px:min-h-[35vh]  w-full  ${styles.noramlFlex}`}>
        <div className='shadow-md shadow-current border-y-4' style={{borderColor:"#422006",borderStyle:"groove"}}> 
         <img
            src={seedsImage}
            alt="click me"
            className="max-w-full h-auto"
          /> </div> </div>
          
        <Beej beeji = {beejData}/>
        <br/>
        <Footer />
    </div>
  )
}

export default BeejPage;