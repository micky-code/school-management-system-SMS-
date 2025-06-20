const express = require('express');
const {
  getParents,
  getParent,
  createParent,
  updateParent,
  deleteParent
} = require('../controllers/parent.controller');
const { protect, authorize, checkPermission } = require('../middleware/auth.middleware');

const router = express.Router();

// Protect all routes
router.use(protect);

// Routes with different permissions
router.get('/', checkPermission('parents', 'read'), getParents);
router.get('/:id', checkPermission('parents', 'read'), getParent);
router.post('/', checkPermission('parents', 'create'), createParent);
router.put('/:id', checkPermission('parents', 'update'), updateParent);
router.delete('/:id', checkPermission('parents', 'delete'), deleteParent);

module.exports = router;
