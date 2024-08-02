import React from 'react'
import styles from '../../../styles/styles'
import LandsCard from '../LandsCard/LandsCard'
import { useSelector } from 'react-redux'

const Lands = () => {
    const {allLands} = useSelector((state) => state.lands);
  return (
    <div>
        <div className={`${styles.section}`}>
            <div className={`${styles.heading}`}>
                <h1>Lands </h1>
            </div>
            <div className="grid grid-cols-1 gap-[20px] md:grid-cols-2 md:gap-[25px] lg:grid-cols-4 lg:gap-[25px] xl:grid-cols-5 xl:gap-[30px] mb-12 border-0">
                {
                    allLands && allLands.length !== 0 &&(
                        <>
                        {allLands && allLands.map((i, index) => <LandsCard data={i} key={index} />)}
                        </>
                    )
                }
            </div>
        </div>
    </div>
  )
}

export default Lands