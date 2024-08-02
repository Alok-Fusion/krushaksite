import React from 'react'
import DashboardSideBar from '../../components/Shop/Layout/DashboardSideBar'
import DashboardHeader from '../../components/Shop/Layout/DashboardHeader'
import AllLands from "../../components/Shop/AllLands";
const ShopAllLands = () => {
  return (
    <div>
    <DashboardHeader />
    <div className="flex justify-between w-full">
        <div className="w-[80px] 800px:w-[330px]">
          <DashboardSideBar active={8} />
        </div>
        <div className="w-full justify-center flex">
            <AllLands />
        </div>
      </div>
</div>
  )
}

export default ShopAllLands