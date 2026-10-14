import apiClient from "./client";

export const orderApi = {
  createOrder: (data) => apiClient.post("/order/create-order", data),
  getUserOrders: (userId) => apiClient.get(`/order/get-all-orders/${userId}`),
  getSellerOrders: (shopId) => apiClient.get(`/order/get-seller-all-orders/${shopId}`),
  updateOrderStatus: (orderId, status) =>
    apiClient.put(`/order/update-order-status/${orderId}`, { status }),
  requestRefund: (orderId, status) =>
    apiClient.put(`/order/order-refund/${orderId}`, { status }),
  processRefundSuccess: (orderId, status) =>
    apiClient.put(`/order/order-refund-success/${orderId}`, { status }),
  getAdminAllOrders: () => apiClient.get("/order/admin-all-orders"),
};

export default orderApi;
