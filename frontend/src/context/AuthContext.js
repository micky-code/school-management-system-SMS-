import React, { createContext, useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { jwtDecode } from 'jwt-decode';

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    // Check if user is already logged in
    const token = localStorage.getItem('token');
    if (token) {
      try {
        const decoded = jwtDecode(token);
        
        // Check if token is expired
        const currentTime = Date.now() / 1000;
        if (decoded.exp < currentTime) {
          localStorage.removeItem('token');
          setCurrentUser(null);
        } else {
          setCurrentUser(decoded);
          // Set axios default header
          axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
        }
      } catch (error) {
        console.error('Invalid token:', error);
        localStorage.removeItem('token');
        setCurrentUser(null);
      }
    }
    setLoading(false);
  }, []);

  const login = async (username, password) => {
    try {
      setError(null);
      setLoading(true);
      
      console.log('Attempting login with:', { username });
      
      const response = await axios.post('http://localhost:3001/api/auth/login', {
        username,
        password
      });
      
      console.log('Login response:', response.data);
      
      const { token, user } = response.data;
      
      if (!token || !user) {
        throw new Error('Invalid response from server. Missing token or user data.');
      }
      
      // Save token to local storage
      localStorage.setItem('token', token);
      
      // Set axios default header
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      
      // Set current user with role information
      const userData = {
        ...user,
        // Ensure role is available for redirection
        role: user.role || ''
      };
      
      setCurrentUser(userData);
      console.log('User authenticated:', userData);
      
      return userData;
    } catch (error) {
      setError(
        error.response?.data?.message || 
        'An error occurred during login. Please try again.'
      );
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    delete axios.defaults.headers.common['Authorization'];
    setCurrentUser(null);
  };

  const register = async (userData) => {
    try {
      setError(null);
      setLoading(true);
      
      const response = await axios.post('http://localhost:5000/api/auth/register', userData);
      
      return response.data;
    } catch (error) {
      setError(
        error.response?.data?.message || 
        'An error occurred during registration. Please try again.'
      );
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const updatePassword = async (currentPassword, newPassword) => {
    try {
      setError(null);
      setLoading(true);
      
      const response = await axios.put('http://localhost:5000/api/auth/update-password', {
        currentPassword,
        newPassword
      });
      
      return response.data;
    } catch (error) {
      setError(
        error.response?.data?.message || 
        'An error occurred while updating password. Please try again.'
      );
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const resetPassword = async (username) => {
    try {
      setError(null);
      setLoading(true);
      
      const response = await axios.post('http://localhost:5000/api/auth/reset-password', {
        username
      });
      
      return response.data;
    } catch (error) {
      setError(
        error.response?.data?.message || 
        'An error occurred while resetting password. Please try again.'
      );
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const value = {
    currentUser,
    loading,
    error,
    login,
    logout,
    register,
    updatePassword,
    resetPassword
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export default AuthContext;
