const API_BASE_URL = 'http://192.168.100.11:5000/api';

export const ENDPOINTS = {
  LOGIN: `${API_BASE_URL}/auth/login`,
  REGISTER: `${API_BASE_URL}/auth/register`,
  PROFILE: `${API_BASE_URL}/auth/profile`,
  FORGOT_PASSWORD: `${API_BASE_URL}/auth/forgot-password`, // ← NUEVO
  RESET_PASSWORD: `${API_BASE_URL}/auth/reset-password`, // ← NUEVO
  
  PRODUCTS: `${API_BASE_URL}/products`,
  MY_PRODUCTS: `${API_BASE_URL}/products/agricultor/mis-productos`,
  
  // CARRITO
  CART: `${API_BASE_URL}/cart`,
  CART_ADD: `${API_BASE_URL}/cart/add`,
  CART_UPDATE: `${API_BASE_URL}/cart/update`,
  CART_REMOVE: (itemId) => `${API_BASE_URL}/cart/remove/${itemId}`,
  CART_CLEAR: `${API_BASE_URL}/cart/clear`,
  
  // PEDIDOS
  ORDERS: `${API_BASE_URL}/orders`,
  MY_ORDERS: `${API_BASE_URL}/orders/mis-pedidos`,
  AGRICULTOR_ORDERS: `${API_BASE_URL}/orders/agricultor`,
  UPDATE_ORDER_STATUS: (orderId) => `${API_BASE_URL}/orders/${orderId}/estado`,
  CANCEL_ORDER: (orderId) => `${API_BASE_URL}/orders/${orderId}/cancelar`,
};

export default API_BASE_URL;
