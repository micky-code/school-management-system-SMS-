const jwt = require('jsonwebtoken');
const { User, Role } = require('../models');

/**
 * Middleware to protect routes - verify JWT token
 */
exports.protect = async (req, res, next) => {
  try {
    let token;

    // Check if token exists in headers
    if (
      req.headers.authorization &&
      req.headers.authorization.startsWith('Bearer')
    ) {
      token = req.headers.authorization.split(' ')[1];
    }

    // Check if token exists
    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'Not authorized to access this route'
      });
    }

    try {
      // Verify token
      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      // Get user from token
      const user = await User.findByPk(decoded.id, {
        include: [
          {
            model: Role,
            attributes: ['role']
          }
        ]
      });

      if (!user) {
        return res.status(401).json({
          success: false,
          message: 'User not found'
        });
      }

      // Check if user is active
      if (user.status === '0') {
        return res.status(401).json({
          success: false,
          message: 'User account is inactive'
        });
      }

      // Add user to request
      req.user = user;
      next();
    } catch (error) {
      return res.status(401).json({
        success: false,
        message: 'Not authorized to access this route'
      });
    }
  } catch (error) {
    next(error);
  }
};

/**
 * Middleware to restrict access to specific roles
 */
exports.authorize = (...roles) => {
  return (req, res, next) => {
    if (!req.user || !req.user.Role || !roles.includes(req.user.Role.name)) {
      return res.status(403).json({
        success: false,
        message: `User role ${req.user.Role.name} is not authorized to access this route`
      });
    }
    next();
  };
};

/**
 * Middleware to check permissions for a specific module and action
 */
exports.checkPermission = (module, action) => {
  return async (req, res, next) => {
    try {
      const roleId = req.user.role_id;
      
      // Get role permissions
      const permission = await RolePermission.findOne({
        where: {
          role_id: roleId,
          module: module
        }
      });

      if (!permission) {
        return res.status(403).json({
          success: false,
          message: `No permission found for this module`
        });
      }

      // Check if user has permission for the action
      let hasPermission = false;
      
      switch (action) {
        case 'create':
          hasPermission = permission.can_create;
          break;
        case 'read':
          hasPermission = permission.can_read;
          break;
        case 'update':
          hasPermission = permission.can_update;
          break;
        case 'delete':
          hasPermission = permission.can_delete;
          break;
        default:
          hasPermission = false;
      }

      if (!hasPermission) {
        return res.status(403).json({
          success: false,
          message: `Not authorized to ${action} in this module`
        });
      }

      next();
    } catch (error) {
      next(error);
    }
  };
};
