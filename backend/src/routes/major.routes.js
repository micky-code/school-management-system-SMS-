const express = require('express');
const {
  getMajors,
  getMajor,
  createMajor,
  updateMajor,
  deleteMajor,
  getMajorsByDepartment
} = require('../controllers/major.controller');
const { protect, authorize, checkPermission } = require('../middleware/auth.middleware');

const router = express.Router();

// Protect all routes
router.use(protect);

// Routes with different permissions
router.get('/', checkPermission('majors', 'read'), getMajors);
router.get('/:id', checkPermission('majors', 'read'), getMajor);
router.post('/', checkPermission('majors', 'create'), createMajor);
router.put('/:id', checkPermission('majors', 'update'), updateMajor);
router.delete('/:id', checkPermission('majors', 'delete'), deleteMajor);

// Special routes
router.get('/department/:departmentId', checkPermission('majors', 'read'), getMajorsByDepartment);

module.exports = router;
