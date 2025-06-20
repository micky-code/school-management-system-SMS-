const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middleware/auth');
const {
  getMainPrograms,
  getMainProgram,
  createMainProgram,
  updateMainProgram,
  deleteMainProgram,
  getProgramsByMainProgram
} = require('../controllers/mainProgram.controller');

// Routes for /api/main-programs
router
  .route('/')
  .get(protect, getMainPrograms)
  .post(protect, authorize('admin'), createMainProgram);

router
  .route('/:id')
  .get(protect, getMainProgram)
  .put(protect, authorize('admin'), updateMainProgram)
  .delete(protect, authorize('admin'), deleteMainProgram);

router
  .route('/:id/programs')
  .get(protect, getProgramsByMainProgram);

module.exports = router;
