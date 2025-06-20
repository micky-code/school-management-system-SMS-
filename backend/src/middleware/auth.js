const jwt = require('jsonwebtoken');
const mysql = require('mysql2/promise');

// Protect routes
exports.protect = async (req, res, next) => {
  let token;

  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    token = req.headers.authorization.split(' ')[1];
  }

  // Make sure token exists
  if (!token) {
    return res.status(401).json({
      success: false,
      error: 'Not authorized to access this route'
    });
  }

  try {
    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Get user from database
    const connection = await mysql.createConnection({
      host: process.env.DB_HOST || '127.0.0.1',
      user: process.env.DB_USER || 'root',
      password: process.env.DB_PASSWORD || '',
      database: process.env.DB_NAME || 'sms_spi'
    });

    const [rows] = await connection.execute(
      `SELECT u.*, r.name as role_name 
       FROM tbl_user u 
       JOIN tbl_role r ON u.role_id = r.id 
       WHERE u.id = ? AND u.active = 1`,
      [decoded.id]
    );

    await connection.end();

    if (rows.length === 0) {
      return res.status(401).json({
        success: false,
        error: 'Not authorized to access this route'
      });
    }

    req.user = rows[0];
    next();
  } catch (error) {
    return res.status(401).json({
      success: false,
      error: 'Not authorized to access this route'
    });
  }
};

// Grant access to specific roles
exports.authorize = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role_name)) {
      return res.status(403).json({
        success: false,
        error: `User role ${req.user.role_name} is not authorized to access this route`
      });
    }
    next();
  };
};
