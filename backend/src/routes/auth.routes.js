const express = require('express');
const { 
  register, 
  login, 
  getMe, 
  logout, 
  updatePassword, 
  resetPassword 
} = require('../controllers/auth.controller');
const { protect, authorize } = require('../middleware/auth.middleware');

const router = express.Router();

// Public routes
router.post('/register', register);
router.post('/login', login);

// Protected routes
router.get('/me', protect, getMe);
router.get('/logout', protect, logout);
router.put('/updatepassword', protect, updatePassword);

// Admin only routes
router.put('/resetpassword/:id', protect, authorize('admin'), resetPassword);

module.exports = router;
