import React, { useEffect, useState } from "react";
import styles from "../../styles/styles";
import { AiOutlineArrowRight, AiOutlineMoneyCollect } from "react-icons/ai";
import { MdBorderClear } from "react-icons/md";
import { Link } from "react-router-dom";
import { DataGrid } from "@material-ui/data-grid";
import { useDispatch, useSelector } from "react-redux";
import { getAllOrdersOfAdmin } from "../../redux/actions/order";
import Loader from "../Layout/Loader";
import { getAllSellers } from "../../redux/actions/sellers";
import { getAllUsers } from "../../redux/actions/user";
import AdminTotalSales from "./AdminTotalSales";
import AdminChart from "./AdminChart";

const AdminDashboardMain = () => {
  const dispatch = useDispatch();

  // Redux state selectors
  const { adminOrders, adminOrderLoading } = useSelector((state) => state.order);
  const { sellers } = useSelector((state) => state.seller);
  const { users } = useSelector((state) => state.user);

  // Fetch data on component mount
  useEffect(() => {
    dispatch(getAllOrdersOfAdmin());
    dispatch(getAllSellers());
    dispatch(getAllUsers());
  }, [dispatch]);

  // Calculate total earnings
  const adminEarning = adminOrders && adminOrders.reduce((acc, item) => acc + item.totalPrice * 0.01, 0);
  const adminBalance = adminEarning?.toFixed(2);

  // DataGrid columns definition
  const columns = [
    { field: "id", headerName: "Order ID", minWidth: 150, flex: 0.7 },
    {
      field: "status",
      headerName: "Status",
      minWidth: 130,
      flex: 0.7,
      cellClassName: (params) =>
        params.getValue(params.id, "status") === "Delivered" ? "greenColor" : "redColor",
    },
    {
      field: "itemsQty",
      headerName: "Items Qty",
      type: "number",
      minWidth: 130,
      flex: 0.7,
    },
    {
      field: "total",
      headerName: "Total",
      type: "number",
      minWidth: 130,
      flex: 0.8,
    },
    {
      field: "createdAt",
      headerName: "Order Date",
      type: "number",
      minWidth: 130,
      flex: 0.8,
    },
  ];

  // Transform orders data for DataGrid
  const rows = adminOrders?.map((item) => ({
    id: item._id,
    itemsQty: item?.cart?.reduce((acc, item) => acc + item.qty, 0),
    total: `${item?.totalPrice} ₹`,
    status: item?.status,
    createdAt: item?.createdAt.slice(0, 10),
  })) || [];

  return (
    <>
      {adminOrderLoading ? (
        <Loader />
      ) : (
        <div className="w-full p-4">
          <h3 className="text-[22px] font-Poppins pb-2">Overview</h3>
          <div className="w-full block 800px:flex items-center justify-between">
            <div className="w-full mb-4 800px:w-[22%] min-h-[20vh] bg-white shadow rounded px-1 py-2">
              <div className="flex items-center">
                <AiOutlineMoneyCollect size={30} className="mr-2" fill="#00000085" />
                <h3 className={`${styles.productTitle} !text-[18px] leading-5 !font-[400] text-[#00000085]`}>
                  Total Earning
                </h3>
              </div>
              <h5 className="pt-2 pl-[36px] text-[22px] font-[500]">₹ {adminBalance}</h5>
            </div>

            <div className="w-full mb-4 800px:w-[22%] min-h-[20vh] bg-white shadow rounded px-1 py-2">
              <div className="flex items-center">
                <MdBorderClear size={30} className="mr-2" fill="#00000085" />
                <h3 className={`${styles.productTitle} !text-[18px] leading-5 !font-[400] text-[#00000085]`}>
                  All Sellers
                </h3>
              </div>
              <h5 className="pt-2 pl-[36px] text-[22px] font-[500]">{sellers?.length || 0}</h5>
              <Link to="/admin-sellers">
                <h5 className="pt-4 pl-2 text-[#077f9c]">View Sellers</h5>
              </Link>
            </div>

            <div className="w-full mb-4 800px:w-[22%] min-h-[20vh] bg-white shadow rounded px-1 py-2">
              <div className="flex items-center">
                <MdBorderClear size={30} className="mr-2" fill="#00000085" />
                <h3 className={`${styles.productTitle} !text-[18px] leading-5 !font-[400] text-[#00000085]`}>
                  All Users
                </h3>
              </div>
              <h5 className="pt-2 pl-[36px] text-[22px] font-[500]">{users?.length || 0}</h5>
              <Link to="/admin-users">
                <h5 className="pt-4 pl-2 text-[#077f9c]">View Users</h5>
              </Link>
            </div>

            <div className="w-full mb-4 800px:w-[22%] min-h-[20vh] bg-white shadow rounded px-1 py-2">
              <div className="flex items-center">
                <AiOutlineMoneyCollect size={30} className="mr-2" fill="#00000085" />
                <h3 className={`${styles.productTitle} !text-[18px] leading-5 !font-[400] text-[#00000085]`}>
                  All Orders
                </h3>
              </div>
              <h5 className="pt-2 pl-[36px] text-[22px] font-[500]">{adminOrders?.length || 0}</h5>
              <Link to="/admin-orders">
                <h5 className="pt-4 pl-2 text-[#077f9c]">View Orders</h5>
              </Link>
            </div>
          </div>

          {/* Align AdminTotalSales and AdminChart side by side */}
          <div className="w-full flex flex-col 800px:flex-row gap-4">
            <div className="w-full 800px:w-[50%] bg-white shadow rounded px-4 py-4">
              <AdminTotalSales />
            </div>
            <div className="w-full 800px:w-[50%] bg-white shadow rounded px-4 py-4">
              <AdminChart />
            </div>
          </div>

          <br />
          <h3 className="text-[22px] font-Poppins pb-2">Latest Orders</h3>
          <div className="w-full min-h-[45vh] bg-white rounded">
            <DataGrid
              rows={rows}
              columns={columns}
              pageSize={4}
              disableSelectionOnClick
              autoHeight
            />
          </div>
        </div>
      )}
    </>
  );
};

export default AdminDashboardMain;
