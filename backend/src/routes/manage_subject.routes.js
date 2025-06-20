const express = require('express');
const {
  getManagedSubjects,
  getManagedSubject,
  createManagedSubject,
  updateManagedSubject,
  deleteManagedSubject,
  getManagedSubjectsByMajor,
  getManagedSubjectsByTeacher
} = require('../controllers/manage_subject.controller');
const { protect, authorize, checkPermission } = require('../middleware/auth.middleware');

const router = express.Router();

// Protect all routes
router.use(protect);

// Routes with different permissions
router.get('/', checkPermission('manage_subjects', 'read'), getManagedSubjects);
router.get('/:id', checkPermission('manage_subjects', 'read'), getManagedSubject);
router.post('/', checkPermission('manage_subjects', 'create'), createManagedSubject);
router.put('/:id', checkPermission('manage_subjects', 'update'), updateManagedSubject);
router.delete('/:id', checkPermission('manage_subjects', 'delete'), deleteManagedSubject);

// Special routes
router.get('/major/:majorId', checkPermission('manage_subjects', 'read'), getManagedSubjectsByMajor);
router.get('/teacher/:teacherId', checkPermission('manage_subjects', 'read'), getManagedSubjectsByTeacher);

module.exports = router;
