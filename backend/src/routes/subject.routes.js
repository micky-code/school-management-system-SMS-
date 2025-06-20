const express = require('express');
const {
  getSubjects,
  getSubject,
  createSubject,
  updateSubject,
  deleteSubject
} = require('../controllers/subject.controller');
const { protect, authorize, checkPermission } = require('../middleware/auth.middleware');

const router = express.Router();

// Protect all routes
router.use(protect);

// Routes with different permissions
router.get('/', checkPermission('subjects', 'read'), getSubjects);
router.get('/:id', checkPermission('subjects', 'read'), getSubject);
router.post('/', checkPermission('subjects', 'create'), createSubject);
router.put('/:id', checkPermission('subjects', 'update'), updateSubject);
router.delete('/:id', checkPermission('subjects', 'delete'), deleteSubject);

module.exports = router;
