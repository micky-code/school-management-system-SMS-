/**
 * Format a date string to a user-friendly format
 * @param {string} dateString - The date string to format
 * @param {string} format - The format to use (default: 'medium')
 * @returns {string} - The formatted date string
 */
export const formatDate = (dateString, format = 'medium') => {
  if (!dateString) return '';
  
  const date = new Date(dateString);
  
  // Check if date is valid
  if (isNaN(date.getTime())) {
    return dateString;
  }
  
  switch (format) {
    case 'short':
      return date.toLocaleDateString();
    case 'long':
      return date.toLocaleDateString(undefined, {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      });
    case 'medium':
    default:
      return date.toLocaleDateString(undefined, {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
      });
  }
};

/**
 * Format a number as currency
 * @param {number} amount - The amount to format
 * @param {string} currency - The currency code (default: 'USD')
 * @returns {string} - The formatted currency string
 */
export const formatCurrency = (amount, currency = 'USD') => {
  if (amount === null || amount === undefined) return '';
  
  return new Intl.NumberFormat(undefined, {
    style: 'currency',
    currency
  }).format(amount);
};

/**
 * Format a number with commas
 * @param {number} number - The number to format
 * @returns {string} - The formatted number string
 */
export const formatNumber = (number) => {
  if (number === null || number === undefined) return '';
  
  return new Intl.NumberFormat().format(number);
};

/**
 * Truncate a string to a specified length
 * @param {string} text - The text to truncate
 * @param {number} length - The maximum length
 * @returns {string} - The truncated text
 */
export const truncateText = (text, length = 50) => {
  if (!text) return '';
  
  if (text.length <= length) return text;
  
  return text.substring(0, length) + '...';
};
