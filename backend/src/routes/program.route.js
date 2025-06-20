const express = require('express');
const router = express.Router();
const { 
  getPrograms, 
  getProgram, 
  createProgram, 
  updateProgram, 
  deleteProgram
} = require('../controllers/program.controller');
const { protect, authorize } = require('../middleware/auth');

// All routes are protected
router.use(protect);

router.route('/')
  .get(getPrograms)
  .post(authorize('admin'), createProgram);

router.route('/:id')
  .get(getProgram)
  .put(authorize('admin'), updateProgram)
  .delete(authorize('admin'), deleteProgram);

module.exports = router;
