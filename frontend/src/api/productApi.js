import apiClient from "./client";

export const productApi = {
  getAllProducts: (params = {}) => apiClient.get("/product/get-all-products", { params }),
  getProductById: (id) => apiClient.get(`/product/get-product/${id}`),
  getShopProducts: (shopId) => apiClient.get(`/product/get-all-products-shop/${shopId}`),
  createProduct: (data) => apiClient.post("/product/create-product", data),
  deleteProduct: (id) => apiClient.delete(`/product/delete-shop-product/${id}`),
  createReview: (data) => apiClient.put("/product/create-new-review", data),
  getAdminAllProducts: () => apiClient.get("/product/admin-all-products"),
};

export default productApi;
