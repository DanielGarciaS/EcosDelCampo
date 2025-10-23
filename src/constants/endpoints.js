const API_BASE_URL = 'http://192.168.100.11:5000/api';

export const ENDPOINTS = {
  LOGIN: `${API_BASE_URL}/auth/login`,
  REGISTER: `${API_BASE_URL}/auth/register`,
  PROFILE: `${API_BASE_URL}/auth/profile`,
  
  PRODUCTS: `${API_BASE_URL}/products`,
  MY_PRODUCTS: `${API_BASE_URL}/products/agricultor/mis-productos`,
  
  CART: `${API_BASE_URL}/cart`,
  CART_ADD: `${API_BASE_URL}/cart/add`,

  // NUEVOS ENDPOINTS DEL CARRITO
  CART: `${API_BASE_URL}/cart`,
  CART_ADD: `${API_BASE_URL}/cart/add`,
  CART_UPDATE: `${API_BASE_URL}/cart/update`,
  CART_REMOVE: (itemId) => `${API_BASE_URL}/cart/remove/${itemId}`,
  CART_CLEAR: `${API_BASE_URL}/cart/clear`,
  
  ORDERS: `${API_BASE_URL}/orders`,
  MY_ORDERS: `${API_BASE_URL}/orders/mis-pedidos`,
};

export default API_BASE_URL;
