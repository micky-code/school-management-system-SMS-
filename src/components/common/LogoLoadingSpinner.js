import React from 'react';
import SPILogo from '../../assets/images/SPI-logo-landscape.png';

const LogoLoadingSpinner = ({ size = 'md' }) => {
  const sizeClasses = {
    sm: 'h-8',
    md: 'h-16',
    lg: 'h-24',
    xl: 'h-32'
  };

  return (
    <div className="flex flex-col items-center justify-center">
      <img 
        src={SPILogo} 
        alt="SPI Logo" 
        className={`${sizeClasses[size]} w-auto mb-4`}
      />
      <div className="flex justify-center items-center">
        <svg
          className="animate-spin h-6 w-6 text-blue-600"
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
        >
          <circle
            className="opacity-25"
            cx="12"
            cy="12"
            r="10"
            stroke="currentColor"
            strokeWidth="4"
          ></circle>
          <path
            className="opacity-75"
            fill="currentColor"
            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
          ></path>
        </svg>
      </div>
    </div>
  );
};

export default LogoLoadingSpinner;
