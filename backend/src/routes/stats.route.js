const express = require('express');
const router = express.Router();
const { getStats, getStudentStats } = require('../controllers/stats.controller');
const { protect, authorize } = require('../middleware/auth');

// All routes are protected
router.use(protect);

router.route('/')
  .get(authorize('admin', 'teacher'), getStats);

router.route('/students')
  .get(authorize('admin', 'teacher'), getStudentStats);

module.exports = router;
