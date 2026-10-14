import React from "react";
import { Routes } from "react-router-dom";
import publicRoutes from "./PublicRoutes";
import getUserRoutes from "./UserRoutes";
import sellerRoutes from "./SellerRoutes";
import adminRoutes from "./AdminDashboardRoutes";

/**
 * Master Application Router composing all platform route domains
 */
export const AppRoutes = ({ stripeApikey }) => {
  return (
    <Routes>
      {publicRoutes}
      {getUserRoutes(stripeApikey)}
      {sellerRoutes}
      {adminRoutes}
    </Routes>
  );
};

export default AppRoutes;
