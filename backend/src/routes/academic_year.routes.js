const express = require('express');
const {
  getAcademicYears,
  getAcademicYear,
  createAcademicYear,
  updateAcademicYear,
  deleteAcademicYear,
  getCurrentAcademicYear
} = require('../controllers/academic_year.controller');
const { protect, authorize, checkPermission } = require('../middleware/auth.middleware');

const router = express.Router();

// Protect all routes
router.use(protect);

// Routes with different permissions
router.get('/', checkPermission('academic_years', 'read'), getAcademicYears);
router.get('/current', checkPermission('academic_years', 'read'), getCurrentAcademicYear);
router.get('/:id', checkPermission('academic_years', 'read'), getAcademicYear);
router.post('/', checkPermission('academic_years', 'create'), createAcademicYear);
router.put('/:id', checkPermission('academic_years', 'update'), updateAcademicYear);
router.delete('/:id', checkPermission('academic_years', 'delete'), deleteAcademicYear);

module.exports = router;
