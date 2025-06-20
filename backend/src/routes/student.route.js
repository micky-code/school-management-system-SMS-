const express = require('express');
const router = express.Router();
const { 
  getStudents, 
  getStudent, 
  createStudent, 
  updateStudent, 
  deleteStudent,
  getStudentsByProgram,
  getStudentsByParent
} = require('../controllers/student.controller');
const { protect, authorize } = require('../middleware/auth');

// All routes are protected and only accessible by admin and teacher roles
router.use(protect);

// Routes accessible by admin and teacher
router.route('/')
  .get(authorize('admin', 'teacher'), getStudents)
  .post(authorize('admin'), createStudent);

router.route('/:id')
  .get(authorize('admin', 'teacher', 'student', 'parent'), getStudent)
  .put(authorize('admin'), updateStudent)
  .delete(authorize('admin'), deleteStudent);

router.route('/program/:programId')
  .get(authorize('admin', 'teacher'), getStudentsByProgram);

router.route('/parent/:parentId')
  .get(authorize('admin', 'teacher', 'parent'), getStudentsByParent);

module.exports = router;
