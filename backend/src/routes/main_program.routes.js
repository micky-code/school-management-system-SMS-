const express = require('express');
const {
  getMainPrograms,
  getMainProgram,
  createMainProgram,
  updateMainProgram,
  deleteMainProgram
} = require('../controllers/main_program.controller');
const { protect, authorize, checkPermission } = require('../middleware/auth.middleware');

const router = express.Router();

// Protect all routes
router.use(protect);

// Routes with different permissions
router.get('/', checkPermission('programs', 'read'), getMainPrograms);
router.get('/:id', checkPermission('programs', 'read'), getMainProgram);
router.post('/', checkPermission('programs', 'create'), createMainProgram);
router.put('/:id', checkPermission('programs', 'update'), updateMainProgram);
router.delete('/:id', checkPermission('programs', 'delete'), deleteMainProgram);

module.exports = router;
