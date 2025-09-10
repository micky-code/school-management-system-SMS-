/**
 * Authentication service for handling JWT tokens and auth-related functions
 */

// Get auth token from localStorage
export const getAuthToken = () => {
  const token = localStorage.getItem('token');
  console.log('Retrieved token from localStorage:', token ? 'Token exists' : 'No token');
  return token;
};

// Set auth token in localStorage
export const setAuthToken = (token) => {
  if (token) {
    console.log('Setting auth token in localStorage');
    localStorage.setItem('token', token);
    // Also set in axios headers for immediate use
    const axios = require('axios');
    axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
  } else {
    console.log('Removing auth token from localStorage');
    localStorage.removeItem('token');
    // Also remove from axios headers
    const axios = require('axios');
    delete axios.defaults.headers.common['Authorization'];
  }
};

// Remove auth token from localStorage
export const removeAuthToken = () => {
  localStorage.removeItem('token');
};

// Check if user is authenticated
export const isAuthenticated = () => {
  const token = getAuthToken();
  return !!token; // Returns true if token exists
};

// Get user info from token
export const getUserInfo = () => {
  const userInfo = localStorage.getItem('userInfo');
  return userInfo ? JSON.parse(userInfo) : null;
};

// Set user info in localStorage
export const setUserInfo = (userInfo) => {
  if (userInfo) {
    localStorage.setItem('userInfo', JSON.stringify(userInfo));
  } else {
    localStorage.removeItem('userInfo');
  }
};

// Remove user info from localStorage
export const removeUserInfo = () => {
  localStorage.removeItem('userInfo');
};

// Logout user
export const logout = () => {
  removeAuthToken();
  removeUserInfo();
};

export default {
  getAuthToken,
  setAuthToken,
  removeAuthToken,
  isAuthenticated,
  getUserInfo,
  setUserInfo,
  removeUserInfo,
  logout
};
