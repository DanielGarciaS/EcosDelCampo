import React, { createContext, useState, useContext, useEffect } from 'react';
import * as SecureStore from 'expo-secure-store';
import axios from 'axios';
import { ENDPOINTS } from '../constants/endpoints';

axios.defaults.timeout = 15000; // 10 segundos


const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadUser();
  }, []);

  const loadUser = async () => {
    try {
      const storedToken = await SecureStore.getItemAsync('token');
      const storedUser = await SecureStore.getItemAsync('user');

      if (storedToken && storedUser) {
        setToken(storedToken);
        setUser(JSON.parse(storedUser));
      }
    } catch (error) {
      console.error('Error loading user:', error);
    } finally {
      setLoading(false);
    }
  };

  const login = async (email, password) => {
  try {
    console.log('🔄 Intentando login a:', ENDPOINTS.LOGIN);
    const response = await axios.post(ENDPOINTS.LOGIN, {
      email,
      password,
    });

    console.log('✅ Respuesta del servidor:', response.data);

    if (response.data.success) {
      const { token: newToken, ...userData } = response.data.data;
      
      await SecureStore.setItemAsync('token', newToken);
      await SecureStore.setItemAsync('user', JSON.stringify(userData));

      setToken(newToken);
      setUser(userData);

      return { success: true };
    }
  } catch (error) {
    console.error('❌ Error completo:', error);
    console.error('❌ Error response:', error.response?.data);
    
    return {
      success: false,
      message: error.response?.data?.message || 
               error.message || 
               'No se pudo conectar con el servidor. Verifica tu conexión.',
    };
  }
};


  const register = async (userData) => {
    try {
        console.log('🔄 Intentando register a:', ENDPOINTS.REGISTER);
      const response = await axios.post(ENDPOINTS.REGISTER, userData);

       console.log('✅ Respuesta del servidor:', response.data);



      if (response.data.success) {
        const { token: newToken, ...user } = response.data.data;
        
        await SecureStore.setItemAsync('token', newToken);
        await SecureStore.setItemAsync('user', JSON.stringify(user));

        setToken(newToken);
        setUser(user);

        return { success: true };
      }
    } catch (error) {
         console.error('❌ Error completo:', error);
    console.error('❌ Error response:', error.response?.data);

      return {
        success: false,
        message: error.response?.data?.message || 
               error.message || 
               'No se pudo conectar con el servidor. Verifica tu conexión.',
      };
    }
  };

  const logout = async () => {
    try {
      await SecureStore.deleteItemAsync('token');
      await SecureStore.deleteItemAsync('user');
      setToken(null);
      setUser(null);
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  const value = {
    user,
    token,
    loading,
    login,
    register,
    logout,
    isAuthenticated: !!token,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth debe usarse dentro de AuthProvider');
  }
  return context;
};
