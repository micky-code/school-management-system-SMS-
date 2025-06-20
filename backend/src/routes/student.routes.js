const express = require('express');
const {
  getStudents,
  getStudent,
  createStudent,
  updateStudent,
  deleteStudent,
  getStudentsByParent
} = require('../controllers/student.controller');
const { protect, authorize, checkPermission } = require('../middleware/auth.middleware');

const router = express.Router();

// Protect all routes
router.use(protect);

// Special routes - these must come BEFORE the /:id route to avoid conflicts
router.get('/parent/:parentId', checkPermission('students', 'read'), getStudentsByParent);

// Routes with different permissions
router.get('/', checkPermission('students', 'read'), getStudents);
router.post('/', checkPermission('students', 'create'), createStudent);

// ID-specific routes
router.get('/:id', checkPermission('students', 'read'), getStudent);
router.put('/:id', checkPermission('students', 'update'), updateStudent);
router.delete('/:id', checkPermission('students', 'delete'), deleteStudent);

module.exports = router;
