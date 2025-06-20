const express = require('express');
const {
  getTeachers,
  getTeacher,
  createTeacher,
  updateTeacher,
  deleteTeacher,
  getTeachersByDepartment
} = require('../controllers/teacher.controller');
const { protect, authorize, checkPermission } = require('../middleware/auth.middleware');

const router = express.Router();

// Protect all routes
router.use(protect);

// Routes with different permissions
router.get('/', checkPermission('teachers', 'read'), getTeachers);
router.get('/:id', checkPermission('teachers', 'read'), getTeacher);
router.post('/', checkPermission('teachers', 'create'), createTeacher);
router.put('/:id', checkPermission('teachers', 'update'), updateTeacher);
router.delete('/:id', checkPermission('teachers', 'delete'), deleteTeacher);

// Special routes
router.get('/department/:departmentId', checkPermission('teachers', 'read'), getTeachersByDepartment);

module.exports = router;
