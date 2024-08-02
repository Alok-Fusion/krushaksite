import React, { useEffect, useState } from 'react'
import Header from '../components/Layout/Header'
import Footer from '../components/Layout/Footer'
import LandsDetails from "../components/Route/Lands/LandsDetail.jsx";
import { useSelector } from 'react-redux';
import { useParams } from 'react-router-dom';
const LandsDetailsPage = () => {
    const { allLands } = useSelector((state) => state.lands);
    const { id } = useParams();
    const [ data , setData ] = useState(null);

    useEffect(() => {
        const data = allLands && allLands.find((i) =>  i._id === id);
        setData(data);
    },[allLands]);
  return (
    <div>
        <Header />
        <LandsDetails data={data}/>
        <Footer />
    </div>
  )
}

export default LandsDetailsPage