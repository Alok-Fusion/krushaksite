import React from "react";
import { Route } from "react-router-dom";
import ProtectedAdminRoute from "./ProtectedAdminRoute";
import {
  AdminDashboardPage,
  AdminDashboardUsers,
  AdminDashboardSellers,
  AdminDashboardOrders,
  AdminDashboardProducts,
  AdminDashboardLands,
  AdminDashboardWithdraw,
} from "./AdminRoutes";

/**
 * Admin portal protected routes
 */
export const adminRoutes = [
  <Route
    key="admin-dashboard"
    path="/admin/dashboard"
    element={
      <ProtectedAdminRoute>
        <AdminDashboardPage />
      </ProtectedAdminRoute>
    }
  />,
  <Route
    key="admin-users"
    path="/admin-users"
    element={
      <ProtectedAdminRoute>
        <AdminDashboardUsers />
      </ProtectedAdminRoute>
    }
  />,
  <Route
    key="admin-sellers"
    path="/admin-sellers"
    element={
      <ProtectedAdminRoute>
        <AdminDashboardSellers />
      </ProtectedAdminRoute>
    }
  />,
  <Route
    key="admin-orders"
    path="/admin-orders"
    element={
      <ProtectedAdminRoute>
        <AdminDashboardOrders />
      </ProtectedAdminRoute>
    }
  />,
  <Route
    key="admin-products"
    path="/admin-products"
    element={
      <ProtectedAdminRoute>
        <AdminDashboardProducts />
      </ProtectedAdminRoute>
    }
  />,
  <Route
    key="admin-lands"
    path="/admin-all-lands"
    element={
      <ProtectedAdminRoute>
        <AdminDashboardLands />
      </ProtectedAdminRoute>
    }
  />,
  <Route
    key="admin-withdraw"
    path="/admin-withdraw-request"
    element={
      <ProtectedAdminRoute>
        <AdminDashboardWithdraw />
      </ProtectedAdminRoute>
    }
  />,
];

export default adminRoutes;
