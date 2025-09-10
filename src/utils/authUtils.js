import { jwtDecode } from 'jwt-decode';

/**
 * Validates JWT token and returns decoded data if valid
 * @returns {Object|null} Decoded token or null if invalid
 */
export const validateToken = () => {
  try {
    const token = localStorage.getItem('token');
    if (!token) return null;
    
    const decoded = jwtDecode(token);
    const currentTime = Date.now() / 1000;
    
    if (decoded.exp < currentTime) {
      console.warn('Token expired, exp:', decoded.exp, 'current:', currentTime);
      return null; // Token expired
    }
    
    return decoded;
  } catch (error) {
    console.warn('Token validation error:', error);
    return null;
  }
};

/**
 * Gets user data from localStorage and token
 * @returns {Object|null} User data or null if not available
 */
export const getUserData = () => {
  try {
    const userStr = localStorage.getItem('user');
    if (!userStr) return null;
    
    const userData = JSON.parse(userStr);
    const tokenData = validateToken();
    
    if (tokenData) {
      // Merge user data with token data
      return {
        ...userData,
        role: tokenData.role || userData.role,
        // Add token validation timestamp to track when this was last validated
        _validated: Date.now()
      };
    }
    
    return userData;
  } catch (error) {
    console.warn('Error getting user data:', error);
    return null;
  }
};

/**
 * Checks if user is authenticated
 * @returns {boolean} True if authenticated
 */
export const isAuthenticated = () => {
  const tokenValid = !!validateToken();
  const userData = getUserData();
  
  if (!tokenValid) {
    // If token is invalid but we're still trying to authenticate,
    // check if we've exceeded max attempts
    const authAttempts = parseInt(sessionStorage.getItem('auth_attempts') || '0');
    if (authAttempts > 3) {
      // Clear auth data after too many failed attempts
      clearAuthData();
      return false;
    }
    
    // Increment auth attempts
    sessionStorage.setItem('auth_attempts', (authAttempts + 1).toString());
  } else {
    // Reset auth attempts counter on successful validation
    sessionStorage.removeItem('auth_attempts');
  }
  
  return tokenValid && !!userData;
};

/**
 * Clears all authentication data
 */
export const clearAuthData = () => {
  localStorage.removeItem('token');
  localStorage.removeItem('user');
  sessionStorage.removeItem('auth_attempts');
  
  // Clear any axios headers
  if (window.axios) {
    delete window.axios.defaults.headers.common['Authorization'];
  }
};

/**
 * Refreshes authentication state
 * @returns {boolean} True if refresh was successful
 */
export const refreshAuthState = () => {
  const token = localStorage.getItem('token');
  const userStr = localStorage.getItem('user');
  
  if (!token || !userStr) return false;
  
  try {
    const decoded = validateToken();
    if (!decoded) {
      // If token is invalid, check if we should clear auth data
      const authAttempts = parseInt(sessionStorage.getItem('auth_attempts') || '0');
      if (authAttempts > 3) {
        clearAuthData();
      }
      return false;
    }
    
    // Update axios headers
    if (window.axios) {
      window.axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    }
    
    // Reset auth attempts counter on successful validation
    sessionStorage.removeItem('auth_attempts');
    
    return true;
  } catch (error) {
    return false;
  }
};
