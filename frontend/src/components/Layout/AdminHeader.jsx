import React from 'react'
import { BiMessageSquareDetail } from 'react-icons/bi'
import { CiMap } from 'react-icons/ci'
import { FiPackage, FiShoppingBag } from 'react-icons/fi'
import { useSelector } from 'react-redux'
import { Link } from 'react-router-dom'

const AdminHeader = () => {
    const {user} = useSelector((state) => state.user);

  return (
         <div className="w-full h-[80px] bg-white shadow sticky top-0 left-0 z-30 flex items-center justify-between px-4">
      <div>
        <Link to="/">
            <img src="https://onedrive.live.com/embed?resid=64385608D20B2754%2117783&authkey=%21ABZsajvNiJidnmM&width=250&height=80" alt="" />
        </Link>
      </div>
      <div className="flex items-center">
        <div className="flex items-center mr-4">
        <Link to="/dashboard-lands" className="800px:block hidden">
            <CiMap
              color="#008000"
              size={30}
              className="mx-5 cursor-pointer"
            />
          </Link>
          <Link to="/dashboard-products" className="800px:block hidden">
            <FiShoppingBag
              color="#008000"
              size={30}
              className="mx-5 cursor-pointer"
            />
          </Link>
          <Link to="/dashboard-orders" className="800px:block hidden">
            <FiPackage color="#008000" size={30} className="mx-5 cursor-pointer" />
          </Link>
          <Link to="/dashboard-messages" className="800px:block hidden">
            <BiMessageSquareDetail
              color="#008000"
              size={30}
              className="mx-5 cursor-pointer"
            />
          </Link>
            <img
              src={`${user?.avatar?.url}`}
              alt=""
              className="w-[50px] h-[50px] rounded-full object-cover"
            />
        </div>
      </div>
    </div>
  )
}

export default AdminHeader