import API_URL from '../config';
import React, { createContext, useState, useContext, useEffect } from 'react';
import axios from 'axios';
import Cookies from 'js-cookie';

const AuthContext = createContext({});

// Configure axios defaults

axios.defaults.baseURL = API_URL;
axios.defaults.withCredentials = true;

console.log('API URL configured:', API_URL);

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Check if user is logged in on mount
  useEffect(() => {
    checkUser();
  }, []);

  const checkUser = async () => {
    try {
      // Do not read token from cookie directly as it is httpOnly
      // Just call /api/auth/me to get user info
      const response = await axios.get('/api/auth/me');
      console.log('Auth check response:', response.data);
      
      if (response.data.success) {
        setUser(response.data.data);
      } else {
        console.error('Auth check failed:', response.data.error);
        setUser(null);
      }
    } catch (err) {
      console.error('Auth check error:', {
        message: err.message,
        response: err.response?.data,
        status: err.response?.status
      });
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  const register = async (name, email, password) => {
    try {
      setError(null);
      
      console.log('Attempting registration...');
      console.log('API URL:', axios.defaults.baseURL);
      console.log('Data:', { name, email, password: '***' });
      
      const response = await axios.post('/api/auth/register', {
        name,
        email,
        password
      });
      
      console.log('Registration response:', response.data);
      
      if (response.data.success) {
        setUser(response.data.user);
        return { success: true };
      } else {
        throw new Error(response.data.error || 'Registration failed');
      }
    } catch (err) {
      console.error('Registration error details:', {
        message: err.message,
        response: err.response?.data,
        status: err.response?.status,
        headers: err.response?.headers
      });
      
      const errorMsg = err.response?.data?.error || err.message || 'Registration failed';
      setError(errorMsg);
      return { success: false, error: errorMsg };
    }
  };

  const login = async (email, password) => {
    try {
      setError(null);
      
      console.log('Attempting login...');
      
      const response = await axios.post('/api/auth/login', {
        email,
        password
      });
      
      console.log('Login response:', response.data);
      
      if (response.data.success) {
        // Store token in cookie
        // Removed manual cookie set to rely on backend cookie
        // if (response.data.token) {
        //   console.log('Setting token cookie...');
        //   Cookies.set('token', response.data.token, {
        //     expires: 7, // 7 days
        //     path: '/',
        //     sameSite: 'Lax',
        //     secure: process.env.NODE_ENV === 'production'
        //   });
        //   // Set Authorization header
        //   axios.defaults.headers.common['Authorization'] = `Bearer ${response.data.token}`;
        // }
        
        // Set Authorization header from token
        if (response.data.token) {
          axios.defaults.headers.common['Authorization'] = `Bearer ${response.data.token}`;
        }
        
        setUser(response.data.user);
        return { success: true };
      } else {
        throw new Error(response.data.error || 'Login failed');
      }
    } catch (err) {
      console.error('Login error:', {
        message: err.message,
        response: err.response?.data,
        status: err.response?.status
      });
      const errorMsg = err.response?.data?.error || 'Login failed';
      setError(errorMsg);
      Cookies.remove('token');
      delete axios.defaults.headers.common['Authorization'];
      return { success: false, error: errorMsg };
    }
  };

  const logout = async () => {
    try {
      await axios.get('/api/auth/logout');
      setUser(null);
      Cookies.remove('token', { path: '/' });
      delete axios.defaults.headers.common['Authorization'];
      console.log('Logged out successfully');
    } catch (err) {
      console.error('Logout error:', {
        message: err.message,
        response: err.response?.data,
        status: err.response?.status
      });
      // Still clear everything even if the API call fails
      setUser(null);
      Cookies.remove('token', { path: '/' });
      delete axios.defaults.headers.common['Authorization'];
    }
  };

  const updateProfile = async (data) => {
    try {
      const response = await axios.put('/api/auth/updatedetails', data);
      setUser(response.data.data);
      return { success: true };
    } catch (err) {
      const errorMsg = err.response?.data?.error || 'Update failed';
      return { success: false, error: errorMsg };
    }
  };

  const value = {
    user,
    loading,
    error,
    register,
    login,
    logout,
    updateProfile,
    checkUser
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};
