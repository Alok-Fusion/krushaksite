import apiClient from "./client";

export const shopApi = {
  createShop: (data) => apiClient.post("/shop/create-shop", data),
  activateShop: (activation_token) => apiClient.post("/shop/activation", { activation_token }),
  loginShop: (data) => apiClient.post("/shop/login-shop", data),
  getSeller: () => apiClient.get("/shop/getSeller"),
  logoutShop: () => apiClient.get("/shop/logout"),
  getPublicShopInfo: (id) => apiClient.get(`/shop/get-shop-info/${id}`),
  updateAvatar: (avatar) => apiClient.put("/shop/update-shop-avatar", { avatar }),
  updateShopInfo: (data) => apiClient.put("/shop/update-seller-info", data),
  updatePaymentMethods: (withdrawMethod) =>
    apiClient.put("/shop/update-payment-methods", { withdrawMethod }),
  deletePaymentMethod: () => apiClient.delete("/shop/delete-withdraw-method"),
  getAdminAllSellers: () => apiClient.get("/shop/admin-all-sellers"),
  adminDeleteSeller: (id) => apiClient.delete(`/shop/delete-seller/${id}`),
};

export default shopApi;
