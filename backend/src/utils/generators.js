/**
 * Utility functions for generating passwords and student IDs
 */

const crypto = require('crypto');
const bcrypt = require('bcryptjs');

/**
 * Generate a random password
 * @param {number} length - Length of the password
 * @returns {string} - Generated password
 */
const generatePassword = (length = 8) => {
  const chars = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*()';
  let password = '';
  
  for (let i = 0; i < length; i++) {
    const randomIndex = Math.floor(Math.random() * chars.length);
    password += chars[randomIndex];
  }
  
  return password;
};

/**
 * Generate a default password (spi123)
 * @returns {string} - Default hashed password
 */
const generateDefaultPassword = async () => {
  const salt = await bcrypt.genSalt(10);
  return await bcrypt.hash('spi123', salt);
};

/**
 * Generate a student ID card number
 * @param {number} year - Enrollment year
 * @param {number} programId - Program ID
 * @param {number} majorId - Major ID
 * @param {number} sequence - Sequence number
 * @returns {string} - Generated student ID
 */
const generateStudentIdCard = (year, programId, majorId, sequence) => {
  // Format: YYYY-PP-MM-SSSS
  // YYYY: Year of enrollment
  // PP: Program ID (padded with leading zero if needed)
  // MM: Major ID (padded with leading zero if needed)
  // SSSS: Sequence number (padded with leading zeros)
  
  const yearStr = year.toString();
  const programStr = programId.toString().padStart(2, '0');
  const majorStr = majorId.toString().padStart(2, '0');
  const sequenceStr = sequence.toString().padStart(4, '0');
  
  return `${yearStr}-${programStr}-${majorStr}-${sequenceStr}`;
};

/**
 * Generate a unique receipt number for payments
 * @returns {string} - Generated receipt number
 */
const generateReceiptNumber = () => {
  // Format: REC-YYYYMMDD-XXXXX
  // YYYYMMDD: Current date
  // XXXXX: Random 5-digit number
  
  const now = new Date();
  const year = now.getFullYear();
  const month = (now.getMonth() + 1).toString().padStart(2, '0');
  const day = now.getDate().toString().padStart(2, '0');
  const random = Math.floor(Math.random() * 100000).toString().padStart(5, '0');
  
  return `REC-${year}${month}${day}-${random}`;
};

module.exports = {
  generatePassword,
  generateDefaultPassword,
  generateStudentIdCard,
  generateReceiptNumber
};
