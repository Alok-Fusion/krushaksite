import React from "react";
import { Route } from "react-router-dom";
import ProtectedRoute from "./ProtectedRoute";
import {
  CheckoutPage,
  PaymentPage,
  OrderSuccessPage,
  ProfilePage,
  UserInbox,
  OrderDetailsPage,
  TrackOrderPage,
} from "./Routes";
import { Elements } from "@stripe/react-stripe-js";
import { loadStripe } from "@stripe/stripe-js";

/**
 * Authenticated user routes
 */
export const getUserRoutes = (stripeApikey) => [
  <Route
    key="checkout"
    path="/checkout"
    element={
      <ProtectedRoute>
        <CheckoutPage />
      </ProtectedRoute>
    }
  />,
  <Route
    key="payment"
    path="/payment"
    element={
      <ProtectedRoute>
        {stripeApikey ? (
          <Elements stripe={loadStripe(stripeApikey)}>
            <PaymentPage />
          </Elements>
        ) : (
          <PaymentPage />
        )}
      </ProtectedRoute>
    }
  />,
  <Route key="order-success" path="/order/success" element={<OrderSuccessPage />} />,
  <Route
    key="profile"
    path="/profile"
    element={
      <ProtectedRoute>
        <ProfilePage />
      </ProtectedRoute>
    }
  />,
  <Route
    key="inbox"
    path="/inbox"
    element={
      <ProtectedRoute>
        <UserInbox />
      </ProtectedRoute>
    }
  />,
  <Route
    key="user-order-details"
    path="/user/order/:id"
    element={
      <ProtectedRoute>
        <OrderDetailsPage />
      </ProtectedRoute>
    }
  />,
  <Route
    key="user-track-order"
    path="/user/track/order/:id"
    element={
      <ProtectedRoute>
        <TrackOrderPage />
      </ProtectedRoute>
    }
  />,
];

export default getUserRoutes;
