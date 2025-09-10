import React from 'react';
import { 
  ExclamationTriangleIcon, 
  XCircleIcon,
  ArrowPathIcon
} from '@heroicons/react/24/solid';

/**
 * Component to display database connection errors with helpful information
 * and recovery options for users
 */
const DatabaseErrorHandler = ({ 
  error, 
  onRetry, 
  errorType = 'general' 
}) => {
  // Different error types and their messages
  const errorMessages = {
    tooManyConnections: {
      title: 'Database Connection Limit Reached',
      message: 'The system has reached the maximum number of database connections. This usually happens when multiple users are accessing the system simultaneously.',
      solution: 'Please try again in a few moments or contact your system administrator if the problem persists.'
    },
    authError: {
      title: 'Authentication Error',
      message: 'Your session has expired or is invalid. Please log in again to continue.',
      solution: 'Click the button below to return to the login page.'
    },
    general: {
      title: 'Database Error',
      message: 'An error occurred while connecting to the database.',
      solution: 'Please try again or contact your system administrator if the problem persists.'
    }
  };

  // Determine which error type to display
  const errorInfo = errorType === 'tooManyConnections' || 
    (error && error.message && error.message.includes('Too many connections')) 
    ? errorMessages.tooManyConnections 
    : errorType === 'authError' 
      ? errorMessages.authError
      : errorMessages.general;

  return (
    <div className="rounded-md bg-red-50 p-4 border border-red-400 my-4">
      <div className="flex">
        <div className="flex-shrink-0">
          <XCircleIcon className="h-5 w-5 text-red-400" aria-hidden="true" />
        </div>
        <div className="ml-3">
          <h3 className="text-sm font-medium text-red-800">{errorInfo.title}</h3>
          <div className="mt-2 text-sm text-red-700">
            <p>{errorInfo.message}</p>
            <p className="mt-1">{errorInfo.solution}</p>
            
            {/* Technical details (collapsed by default) */}
            {error && (
              <details className="mt-3 border border-red-200 rounded-md">
                <summary className="text-sm px-2 py-1 cursor-pointer hover:bg-red-100 rounded-t-md">
                  Technical details
                </summary>
                <pre className="text-xs p-2 bg-red-50 overflow-auto max-h-32 rounded-b-md">
                  {error.message || JSON.stringify(error, null, 2)}
                </pre>
              </details>
            )}
          </div>
          
          <div className="mt-4">
            {errorType === 'authError' ? (
              <button
                type="button"
                onClick={() => window.location.href = '/login'}
                className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                Go to Login
              </button>
            ) : (
              <button
                type="button"
                onClick={onRetry}
                className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-blue-700 bg-blue-100 hover:bg-blue-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                <ArrowPathIcon className="-ml-0.5 mr-2 h-4 w-4" aria-hidden="true" />
                Try Again
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default DatabaseErrorHandler;
