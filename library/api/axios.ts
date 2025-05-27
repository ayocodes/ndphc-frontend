// src/lib/axios.ts
import axios from 'axios';
import { useAuthStore } from '../store/auth-store';
// import { useAuthStore } from '@/store/authStore';

const baseURL = process.env.NEXT_PUBLIC_API_URL;

const axiosInstance = axios.create({
  baseURL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Helper function to get current store state
const getAuthState = () => {
  try {
    const authStorage = localStorage.getItem('auth-storage');
    return authStorage ? JSON.parse(authStorage).state : null;
  } catch (error) {
    console.error('Error parsing auth storage:', error);
    return null;
  }
};

axiosInstance.interceptors.request.use(
  async (config) => {
    // Use Zustand store directly instead of localStorage
    const { token } = useAuthStore.getState();
    
    if (token?.access_token) {
      config.headers.Authorization = `Bearer ${token.access_token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

axiosInstance.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      
      // Use Zustand actions to handle logout
      useAuthStore.getState().logout();
      window.location.href = '/login';
    }
    
    return Promise.reject(error);
  }
);

export default axiosInstance;