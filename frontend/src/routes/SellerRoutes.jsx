import React from "react";
import { Route } from "react-router-dom";
import SellerProtectedRoute from "./SellerProtectedRoute";
import {
  ShopHomePage,
  ShopDashboardPage,
  ShopCreateProduct,
  ShopCreateLand,
  ShopAllOrders,
  ShopAllRefunds,
  ShopOrderDetails,
  ShopAllProducts,
  ShopAllLands,
  ShopWithDrawMoneyPage,
  ShopInboxPage,
  ShopSettingsPage,
} from "./ShopRoutes";

/**
 * Seller portal protected routes
 */
export const sellerRoutes = [
  <Route
    key="shop-home"
    path="/shop/:id"
    element={
      <SellerProtectedRoute>
        <ShopHomePage />
      </SellerProtectedRoute>
    }
  />,
  <Route
    key="shop-settings"
    path="/settings"
    element={
      <SellerProtectedRoute>
        <ShopSettingsPage />
      </SellerProtectedRoute>
    }
  />,
  <Route
    key="shop-dashboard"
    path="/dashboard"
    element={
      <SellerProtectedRoute>
        <ShopDashboardPage />
      </SellerProtectedRoute>
    }
  />,
  <Route
    key="shop-create-product"
    path="/dashboard-create-product"
    element={
      <SellerProtectedRoute>
        <ShopCreateProduct />
      </SellerProtectedRoute>
    }
  />,
  <Route
    key="shop-create-lands"
    path="/dashboard-create-lands"
    element={
      <SellerProtectedRoute>
        <ShopCreateLand />
      </SellerProtectedRoute>
    }
  />,
  <Route
    key="shop-orders"
    path="/dashboard-orders"
    element={
      <SellerProtectedRoute>
        <ShopAllOrders />
      </SellerProtectedRoute>
    }
  />,
  <Route
    key="shop-refunds"
    path="/dashboard-refunds"
    element={
      <SellerProtectedRoute>
        <ShopAllRefunds />
      </SellerProtectedRoute>
    }
  />,
  <Route
    key="shop-order-details"
    path="/order/:id"
    element={
      <SellerProtectedRoute>
        <ShopOrderDetails />
      </SellerProtectedRoute>
    }
  />,
  <Route
    key="shop-products"
    path="/dashboard-products"
    element={
      <SellerProtectedRoute>
        <ShopAllProducts />
      </SellerProtectedRoute>
    }
  />,
  <Route
    key="shop-lands"
    path="/dashboard-lands"
    element={
      <SellerProtectedRoute>
        <ShopAllLands />
      </SellerProtectedRoute>
    }
  />,
  <Route
    key="shop-withdraw"
    path="/dashboard-withdraw-money"
    element={
      <SellerProtectedRoute>
        <ShopWithDrawMoneyPage />
      </SellerProtectedRoute>
    }
  />,
  <Route
    key="shop-messages"
    path="/dashboard-messages"
    element={
      <SellerProtectedRoute>
        <ShopInboxPage />
      </SellerProtectedRoute>
    }
  />,
];

export default sellerRoutes;
