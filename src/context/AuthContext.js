import React, { createContext, useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { jwtDecode } from 'jwt-decode';
import ApiAdapter from '../services/api-adapter';

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    // Check if user is already logged in
    const token = localStorage.getItem('token');
    const userStr = localStorage.getItem('user');
    
    // Define valid roles in the system
    const validRoles = ['admin', 'teacher', 'student', 'parent'];
    
    if (token && userStr) {
      try {
        // First try to get user from localStorage
        const userData = JSON.parse(userStr);
        
        // Set axios default header
        axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
        
        try {
          // Then validate token
          const decoded = jwtDecode(token);
          
          // Check if token is expired
          const currentTime = Date.now() / 1000;
          if (decoded.exp < currentTime) {
            console.log('Token expired in AuthContext');
            // Token is expired, clear auth data
            localStorage.removeItem('token');
            localStorage.removeItem('user');
            delete axios.defaults.headers.common['Authorization'];
            setCurrentUser(null);
          } else {
            // Merge user data with token data
            // Ensure role is one of the valid roles, default to admin if not
            let userRole = (decoded.role || userData.role || '').toLowerCase();
            if (!validRoles.includes(userRole)) {
              console.log(`Invalid role detected: ${userRole}, defaulting to admin`);
              userRole = 'admin';
            }
            
            const updatedUser = {
              ...userData,
              // Use normalized role
              role: userRole,
              // Add validation timestamp
              _validated: Date.now()
            };
            
            // Update localStorage with the merged data
            localStorage.setItem('user', JSON.stringify(updatedUser));
            
            // Update current user state
            setCurrentUser(updatedUser);
            console.log('User session restored from localStorage');
          }
        } catch (error) {
          // If token decode fails, still use the user data
          console.warn('Token decode failed, using stored user data:', error);
          setCurrentUser(userData);
        }
      } catch (error) {
        console.error('Error loading user data:', error);
        // Clear invalid data
        localStorage.removeItem('user');
        setCurrentUser(null);
      }
    }
    setLoading(false);
  }, []);

  const login = async (username, password) => {
    try {
      setError(null);
      setLoading(true);
      
      // Remove any existing tokens/user data first
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      delete axios.defaults.headers.common['Authorization'];
      
      console.log('Attempting login with:', { username });
      
      // Use ApiAdapter for better compatibility with both backends
      const response = await ApiAdapter.auth.login({ username, password });
      
      console.log('Login response:', response);
      
      // Extract token and user data based on the response structure
      // FastAPI returns { access_token, token_type, user }
      // Node.js returns { token, user }
      const token = response.access_token || response.token;
      const user = response.user;
      
      console.log('Extracted token:', token ? 'Token exists' : 'No token');
      console.log('Extracted user:', user);
      
      if (!token || !user) {
        throw new Error('Invalid response from server. Missing token or user data.');
      }
      
      // Ensure user has a role, default to 'admin' if missing
      // Use 'admin' as default instead of 'user' since 'user' is not a valid role in the system
      // Valid roles are: admin, teacher, student, parent
      const validRoles = ['admin', 'teacher', 'student', 'parent'];
      
      // Get role from user data and normalize it
      let userRole = (user.role || '').toLowerCase();
      
      // If role is not valid, default to admin
      if (!validRoles.includes(userRole)) {
        console.log(`Invalid role detected during login: ${userRole}, defaulting to admin`);
        userRole = 'admin';
      }
      
      const normalizedUser = {
        ...user,
        role: userRole, // Use the validated role
        _validated: Date.now() // Add validation timestamp
      };
      
      console.log('Normalized user:', normalizedUser);
      
      // Set axios default header first to ensure API calls work immediately
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      console.log('Authorization header set in axios');
      
      // Save token to local storage
      localStorage.setItem('token', token);
      console.log('Token saved to localStorage');
      
      // Reset any auth attempts
      sessionStorage.removeItem('auth_attempts');
      sessionStorage.removeItem('redirectUrl'); // Clear any saved redirect URLs
      
      // Save user data to local storage
      localStorage.setItem('user', JSON.stringify(normalizedUser));
      console.log('User data saved to localStorage');
      
      // Update current user state - this will trigger the useEffect in Login component
      setCurrentUser(normalizedUser);
      console.log('Current user state updated');
      
      setLoading(false);
      return normalizedUser;
    } catch (error) {
      console.error('Login error:', error);
      setError(error.message || 'Failed to login');
      setLoading(false);
      throw error;
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    sessionStorage.removeItem('auth_attempts');
    delete axios.defaults.headers.common['Authorization'];
    setCurrentUser(null);
  };

  const register = async (userData) => {
    try {
      setError(null);
      setLoading(true);
      
      // Use ApiAdapter for better compatibility with both backends
      const response = await ApiAdapter.auth.register(userData);
      
      return response;
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
      
      // Use ApiAdapter for better compatibility with both backends
      // Add this method to ApiAdapter if it doesn't exist yet
      if (ApiAdapter.auth.updatePassword) {
        const response = await ApiAdapter.auth.updatePassword({
          currentPassword,
          newPassword
        });
        return response;
      } else {
        // Fallback to direct API call if not implemented in adapter yet
        const response = await axios.put('http://localhost:5000/api/auth/update-password', {
          currentPassword,
          newPassword
        });
        return response.data;
      }
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
