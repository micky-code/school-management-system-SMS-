const jwt = require('jsonwebtoken');

/**
 * Generate JWT token
 * @param {Object} user - User object
 * @returns {string} - JWT token
 */
const generateToken = (user) => {
  return jwt.sign(
    { 
      id: user.id,
      username: user.username,
      email: user.email,
      role_id: user.role_id,
      profile_type: user.profile_type
    },
    process.env.JWT_SECRET,
    {
      expiresIn: process.env.JWT_EXPIRES_IN
    }
  );
};

/**
 * Generate and send JWT token response
 * @param {Object} user - User object
 * @param {number} statusCode - HTTP status code
 * @param {Object} res - Express response object
 */
const sendTokenResponse = (user, statusCode, res) => {
  // Create token
  const token = generateToken(user);

  // Cookie options
  const options = {
    expires: new Date(
      Date.now() + process.env.JWT_COOKIE_EXPIRES_IN * 24 * 60 * 60 * 1000
    ),
    httpOnly: true
  };

  // Use secure flag in production
  if (process.env.NODE_ENV === 'production') {
    options.secure = true;
  }

  // Update last login time
  user.last_login = new Date();
  user.save();

  res.status(statusCode).json({
    success: true,
    token,
    user: {
      id: user.id,
      username: user.username,
      email: user.email,
      role_id: user.role_id,
      profile_type: user.profile_type,
      is_active: user.is_active,
      last_login: user.last_login
    }
  });
};

module.exports = {
  generateToken,
  sendTokenResponse
};
