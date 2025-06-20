/**
 * Error handling middleware
 */

// Error handler
const errorHandler = (err, req, res, next) => {
  let error = { ...err };
  error.message = err.message;

  // Log to console for dev
  console.error(err);

  // Sequelize validation error
  if (err.name === 'SequelizeValidationError') {
    const message = Object.values(err.errors).map(val => val.message);
    error = new Error(message);
    return res.status(400).json({
      success: false,
      error: message
    });
  }

  // Sequelize unique constraint error
  if (err.name === 'SequelizeUniqueConstraintError') {
    const message = Object.values(err.errors).map(val => val.message);
    error = new Error(message);
    return res.status(400).json({
      success: false,
      error: message
    });
  }

  // Sequelize foreign key constraint error
  if (err.name === 'SequelizeForeignKeyConstraintError') {
    const message = 'Referenced record does not exist';
    error = new Error(message);
    return res.status(400).json({
      success: false,
      error: message
    });
  }

  // JWT error
  if (err.name === 'JsonWebTokenError') {
    const message = 'Invalid token';
    error = new Error(message);
    return res.status(401).json({
      success: false,
      error: message
    });
  }

  // JWT expired error
  if (err.name === 'TokenExpiredError') {
    const message = 'Token expired';
    error = new Error(message);
    return res.status(401).json({
      success: false,
      error: message
    });
  }

  res.status(error.statusCode || 500).json({
    success: false,
    error: error.message || 'Server Error'
  });
};

module.exports = errorHandler;
