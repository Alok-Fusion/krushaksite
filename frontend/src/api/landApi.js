import apiClient from "./client";

export const landApi = {
  getAllLands: (params = {}) => apiClient.get("/lands/get-all-lands", { params }),
  getLandById: (id) => apiClient.get(`/lands/get-land/${id}`),
  getSellerLands: (sellerId) => apiClient.get(`/lands/get-all-lands/${sellerId}`),
  createLand: (data) => apiClient.post("/lands/create-lands", data),
  deleteLand: (id) => apiClient.delete(`/lands/delete-seller-land/${id}`),
  getAdminAllLands: () => apiClient.get("/lands/admin-all-lands"),
  adminDeleteLand: (id) => apiClient.delete(`/lands/admin-delete-land/${id}`),
};

export default landApi;
