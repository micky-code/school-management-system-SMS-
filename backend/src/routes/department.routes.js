const express = require('express');
const {
  getDepartments,
  getDepartment,
  createDepartment,
  updateDepartment,
  deleteDepartment
} = require('../controllers/department.controller');
const { protect, authorize, checkPermission } = require('../middleware/auth.middleware');

const router = express.Router();

// Protect all routes
router.use(protect);

// Routes with different permissions
router.get('/', checkPermission('departments', 'read'), getDepartments);
router.get('/:id', checkPermission('departments', 'read'), getDepartment);
router.post('/', checkPermission('departments', 'create'), createDepartment);
router.put('/:id', checkPermission('departments', 'update'), updateDepartment);
router.delete('/:id', checkPermission('departments', 'delete'), deleteDepartment);

module.exports = router;
