const { User, Role } = require('../models');
const { sequelize } = require('../config/db.config');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { generateDefaultPassword } = require('../utils/generators');

/**
 * @desc    Register user
 * @route   POST /api/auth/register
 * @access  Public
 */
exports.register = async (req, res, next) => {
  try {
    const { username, email, password, role_id, profile_type } = req.body;

    // Check if user already exists
    const userExists = await User.findOne({ 
      where: { 
        email 
      } 
    });

    if (userExists) {
      return res.status(400).json({
        success: false,
        message: 'User already exists'
      });
    }

    // Create user
    const user = await User.create({
      username,
      email,
      password,
      role_id,
      profile_type
    });

    // Send token response
    sendTokenResponse(user, 201, res);
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Login user
 * @route   POST /api/auth/login
 * @access  Public
 */
exports.login = async (req, res, next) => {
  try {
    console.log('Login request body:', req.body);
    // Extract username and password from request body
    const { username, password } = req.body;
    
    console.log('Login attempt with username:', username);
    
    // For debugging - log all request headers
    console.log('Request headers:', req.headers);

    // Validate username & password
    if (!username || !password) {
      console.log('Missing username or password');
      return res.status(400).json({
        success: false,
        message: 'Please provide username and password'
      });
    }

    // First try a simple MySQL query to get the user
    try {
      const mysql = require('mysql2/promise');
      const connection = await mysql.createConnection({
        host: '127.0.0.1', // Force IPv4 instead of localhost
        user: process.env.DB_USER || 'root',
        password: process.env.DB_PASSWORD || '',
        database: process.env.DB_NAME || 'sms_spi',
        port: process.env.DB_PORT || 3306
      });
      
      console.log('Connected to database');
      
      // Get user from database
      console.log('Querying database for user:', username);
      const [users] = await connection.execute(
        'SELECT u.*, r.role as role_name FROM tbl_user u LEFT JOIN tbl_role r ON u.role_id = r.id WHERE u.username = ? OR u.email = ?', 
        [username, username]
      );
      
      console.log('Database query result:', { userCount: users.length });
      
      // Check if user exists
      if (users.length === 0) {
        await connection.end();
        console.log('User not found');
        return res.status(401).json({
          success: false,
          message: 'Invalid credentials'
        });
      }
      
      console.log('User found:', { id: users[0].id, username: users[0].username });
      
      const user = users[0];
      console.log('User found:', { id: user.id, name: user.name, email: user.email });
      
      // Check if user is active
      if (user.status === '0') {
        await connection.end();
        console.log('User account is inactive');
        return res.status(401).json({
          success: false,
          message: 'User account is inactive'
        });
      }
      
      // Check if password matches using bcrypt
      console.log('Checking password match for user:', user.username);
      console.log('Password from request:', password);
      console.log('Stored password hash:', user.password ? user.password.substring(0, 10) + '...' : 'null');
      
      // Check if password is null or empty
      if (!user.password) {
        await connection.end();
        console.log('User has no password set');
        return res.status(401).json({
          success: false,
          message: 'Account setup incomplete. Please contact administrator.'
        });
      }
      
      try {
        const isMatch = await bcrypt.compare(password, user.password);
        console.log('Password comparison result:', isMatch);
        
        if (!isMatch) {
          await connection.end();
          console.log('Password does not match');
          return res.status(401).json({
            success: false,
            message: 'Invalid credentials'
          });
        }
      } catch (bcryptError) {
        console.error('bcrypt error during password comparison:', bcryptError);
        await connection.end();
        return res.status(500).json({
          success: false,
          message: 'Authentication error. Please try again.'
        });
      }
      
      console.log('Password matches, creating token');
      
      // Create token
      const token = jwt.sign(
        { id: user.id, role: user.role_name },
        process.env.JWT_SECRET || 'secret',
        { expiresIn: process.env.JWT_EXPIRE || '1d' }
      );

      await connection.end();
      
      // Log the successful login
      console.log('Login successful for user:', user.username);
      
      // Return token and user info in the format expected by the frontend
      return res.status(200).json({
        success: true,
        token,
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          username: user.username,
          role: user.role_name,
          status: user.status
        }
      });
    } catch (dbError) {
      console.error('Database error during login:', dbError);
      return res.status(500).json({
        success: false,
        message: 'Database error during login'
      });
    }
  } catch (error) {
    console.error('Login error:', error);
    return res.status(500).json({
      success: false,
      message: 'Server error during login'
    });
  }
};

/**
 * @desc    Get current logged in user
 * @route   GET /api/auth/me
 * @access  Private
 */
exports.getMe = async (req, res, next) => {
  try {
    const user = await User.findByPk(req.user.id, {
      include: [
        {
          model: Role,
          attributes: ['name']
        }
      ],
      attributes: { exclude: ['password'] }
    });

    // Get profile data based on profile_type
    let profileData = null;
    
    if (user.profile_id) {
      switch (user.profile_type) {
        case 'student':
          profileData = await Student.findByPk(user.profile_id);
          break;
        case 'teacher':
          profileData = await Teacher.findByPk(user.profile_id);
          break;
        case 'parent':
          profileData = await Parent.findByPk(user.profile_id);
          break;
        default:
          break;
      }
    }

    res.status(200).json({
      success: true,
      data: {
        user,
        profile: profileData
      }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Logout user / clear cookie
 * @route   GET /api/auth/logout
 * @access  Private
 */
exports.logout = async (req, res, next) => {
  try {
    res.status(200).json({
      success: true,
      message: 'User logged out successfully'
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Update password
 * @route   PUT /api/auth/updatepassword
 * @access  Private
 */
exports.updatePassword = async (req, res, next) => {
  try {
    const { currentPassword, newPassword } = req.body;

    // Get user
    const user = await User.findByPk(req.user.id);

    // Check current password
    const isMatch = await user.matchPassword(currentPassword);

    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: 'Current password is incorrect'
      });
    }

    // Update password
    user.password = newPassword;
    await user.save();

    // Send token response
    sendTokenResponse(user, 200, res);
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Reset user password
 * @route   PUT /api/auth/resetpassword/:id
 * @access  Private/Admin
 */
exports.resetPassword = async (req, res, next) => {
  try {
    const user = await User.findByPk(req.params.id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Generate default password
    const defaultPassword = await generateDefaultPassword();
    
    // Update password
    user.password = defaultPassword;
    await user.save();

    res.status(200).json({
      success: true,
      message: 'Password reset successful'
    });
  } catch (error) {
    next(error);
  }
};
