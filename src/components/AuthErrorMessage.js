import React from 'react';
import { useNavigate } from 'react-router-dom';

/**
 * Component to display authentication error messages
 * Used when a feature is accessed with invalid authentication
 * but we don't want to automatically redirect to login
 */
const AuthErrorMessage = ({ message = 'Authentication error. Please log in again to view dashboard data.', showLoginButton = true }) => {
  const navigate = useNavigate();

  return (
    <div className="flex items-center justify-between bg-red-50 border-l-4 border-red-400 p-4">
      <div className="flex items-center">
        <svg className="h-5 w-5 text-red-400 mr-2" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
        </svg>
        <span className="text-red-700">{message}</span>
      </div>
      {showLoginButton && (
        <button
          onClick={() => navigate('/login', { replace: true })}
          className="bg-red-100 hover:bg-red-200 text-red-800 px-3 py-1 rounded-md text-sm font-medium"
        >
          Go to Login
        </button>
      )}
    </div>
  );
};

export default AuthErrorMessage;
