import React from "react";
import { Route } from "react-router-dom";
import {
  HomePage,
  LoginPage,
  SignupPage,
  ActivationPage,
  SellerActivationPage,
  ProductsPage,
  ProductDetailsPage,
  BestSellingPage,
  EventsPage,
  GuidePage,
  FarmingtipsPage,
  WeatherPage,
  CropsinfoPage,
  SeedsPage,
  BeejPage,
  KhadPage,
  MarkettrendsPage,
  FAQPage,
  LandsPage,
  LandsDetailsPage,
  DiseaseDetectionPage,
  PriceTrendsPage,
  AboutUsPage,
  ShopCreatePage,
  ShopLoginPage,
} from "./Routes";
import { ShopPreviewPage } from "./ShopRoutes";

/**
 * Public routes accessible to all platform visitors
 */
export const publicRoutes = [
  <Route key="home" path="/" element={<HomePage />} />,
  <Route key="login" path="/login" element={<LoginPage />} />,
  <Route key="sign-up" path="/sign-up" element={<SignupPage />} />,
  <Route key="activation" path="/activation/:activation_token" element={<ActivationPage />} />,
  <Route key="seller-activation" path="/seller/activation/:activation_token" element={<SellerActivationPage />} />,
  <Route key="products" path="/products" element={<ProductsPage />} />,
  <Route key="product-details" path="/product/:id" element={<ProductDetailsPage />} />,
  <Route key="best-selling" path="/best-selling" element={<BestSellingPage />} />,
  <Route key="events" path="/events" element={<EventsPage />} />,
  <Route key="guide" path="/guide" element={<GuidePage />} />,
  <Route key="guide-farmingtips" path="/guide/farmingtips" element={<FarmingtipsPage />} />,
  <Route key="guide-weather" path="/guide/weather" element={<WeatherPage />} />,
  <Route key="guide-cropsinfo" path="/guide/cropsinfo" element={<CropsinfoPage />} />,
  <Route key="guide-seeds" path="/guide/seeds" element={<SeedsPage />} />,
  <Route key="guide-seeds-beej" path="/guide/seeds/beej" element={<BeejPage />} />,
  <Route key="guide-seeds-khad" path="/guide/seeds/khad" element={<KhadPage />} />,
  <Route key="guide-news" path="/guide/news" element={<MarkettrendsPage />} />,
  <Route key="faq" path="/faq" element={<FAQPage />} />,
  <Route key="lands" path="/lands" element={<LandsPage />} />,
  <Route key="lands-details" path="/lands/:id" element={<LandsDetailsPage />} />,
  <Route key="disease-detection" path="/disease-detection" element={<DiseaseDetectionPage />} />,
  <Route key="crop-doctor" path="/crop-doctor" element={<DiseaseDetectionPage />} />,
  <Route key="price-trends" path="/price-trends" element={<PriceTrendsPage />} />,
  <Route key="mandi-forecast" path="/mandi-forecast" element={<PriceTrendsPage />} />,
  <Route key="about" path="/about" element={<AboutUsPage />} />,
  <Route key="shop-create" path="/shop-create" element={<ShopCreatePage />} />,
  <Route key="shop-login" path="/shop-login" element={<ShopLoginPage />} />,
  <Route key="shop-preview" path="/shop/preview/:id" element={<ShopPreviewPage />} />,
];

export default publicRoutes;
