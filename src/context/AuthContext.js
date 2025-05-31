import React, { createContext, useState, useContext, useEffect } from 'react';
import axios from 'axios';
import Cookies from 'js-cookie';

const AuthContext = createContext({});

// Configure axios defaults
const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:3001';
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
      const token = Cookies.get('token');
      if (token && token !== 'none') {
        const response = await axios.get('/api/auth/me');
        setUser(response.data.data);
      }
    } catch (err) {
      console.log('Not authenticated');
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
        setUser(response.data.user);
        return { success: true };
      } else {
        throw new Error(response.data.error || 'Login failed');
      }
    } catch (err) {
      console.error('Login error:', err);
      const errorMsg = err.response?.data?.error || 'Login failed';
      setError(errorMsg);
      return { success: false, error: errorMsg };
    }
  };

  const logout = async () => {
    try {
      await axios.get('/api/auth/logout');
      setUser(null);
      Cookies.remove('token');
    } catch (err) {
      console.error('Logout error:', err);
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
