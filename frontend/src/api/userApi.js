import apiClient from "./client";

export const userApi = {
  createUser: (data) => apiClient.post("/user/create-user", data),
  activateUser: (activation_token) => apiClient.post("/user/activation", { activation_token }),
  loginUser: (data) => apiClient.post("/user/login-user", data),
  getUser: () => apiClient.get("/user/getuser"),
  logoutUser: () => apiClient.get("/user/logout"),
  updateUserInfo: (data) => apiClient.put("/user/update-user-info", data),
  updateAvatar: (avatar) => apiClient.put("/user/update-avatar", { avatar }),
  updateAddresses: (data) => apiClient.put("/user/update-user-addresses", data),
  deleteAddress: (id) => apiClient.delete(`/user/delete-user-address/${id}`),
  updatePassword: (data) => apiClient.put("/user/update-user-password", data),
  getPublicUserInfo: (id) => apiClient.get(`/user/user-info/${id}`),
  getAdminAllUsers: () => apiClient.get("/user/admin-all-users"),
  adminDeleteUser: (id) => apiClient.delete(`/user/delete-user/${id}`),
};

export default userApi;
