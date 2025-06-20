const express = require('express');
const router = express.Router();
const { 
  getBatches, 
  getBatch, 
  createBatch, 
  updateBatch, 
  deleteBatch
} = require('../controllers/batch.controller');
const { protect, authorize } = require('../middleware/auth');

// All routes are protected
router.use(protect);

router.route('/')
  .get(getBatches)
  .post(authorize('admin'), createBatch);

router.route('/:id')
  .get(getBatch)
  .put(authorize('admin'), updateBatch)
  .delete(authorize('admin'), deleteBatch);

module.exports = router;
