import React from 'react'
import CreateLand from "../../components/Shop/CreateLand.jsx";
import DashboardHeader from '../../components/Shop/Layout/DashboardHeader'
import DashboardSideBar from '../../components/Shop/Layout/DashboardSideBar'

const ShopCreateLand = () => {
  return (
    <div>
    <DashboardHeader />
    <div className="flex items-center justify-between w-full">
        <div className="w-[80px] 800px:w-[330px]">
          <DashboardSideBar active={7} />
        </div>
        <div className="w-full justify-center flex">
            <CreateLand />
        </div>
      </div>
</div>
  )
}

export default ShopCreateLand