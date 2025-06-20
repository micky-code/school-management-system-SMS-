const { 
  AcademicYear, 
  ManageSubject, 
  StudentSchedule 
} = require('../models');
const { Op } = require('sequelize');

/**
 * @desc    Get all academic years
 * @route   GET /api/academic-years
 * @access  Private
 */
exports.getAcademicYears = async (req, res, next) => {
  try {
    const { page = 1, limit = 10, search, status } = req.query;
    const offset = (page - 1) * limit;
    
    // Build filter conditions
    const whereConditions = {};
    
    if (search) {
      whereConditions[Op.or] = [
        { school_year: { [Op.like]: `%${search}%` } }
      ];
    }
    
    if (status) {
      whereConditions.status = status;
    }
    
    // Get academic years with pagination
    const { count, rows: academicYears } = await AcademicYear.findAndCountAll({
      where: whereConditions,
      limit: parseInt(limit),
      offset: offset,
      order: [['start_date', 'DESC']]
    });
    
    res.status(200).json({
      success: true,
      count,
      data: academicYears,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        totalPages: Math.ceil(count / limit)
      }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get single academic year
 * @route   GET /api/academic-years/:id
 * @access  Private
 */
exports.getAcademicYear = async (req, res, next) => {
  try {
    const academicYear = await AcademicYear.findByPk(req.params.id);
    
    if (!academicYear) {
      return res.status(404).json({
        success: false,
        message: 'Academic year not found'
      });
    }
    
    res.status(200).json({
      success: true,
      data: academicYear
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Create new academic year
 * @route   POST /api/academic-years
 * @access  Private
 */
exports.createAcademicYear = async (req, res, next) => {
  try {
    const {
      school_year,
      start_date,
      end_date,
      is_current
    } = req.body;
    
    // Check if school year already exists
    const yearExists = await AcademicYear.findOne({ 
      where: { 
        school_year 
      } 
    });
    
    if (yearExists) {
      return res.status(400).json({
        success: false,
        message: 'Academic year already exists'
      });
    }
    
    // If this is set as current, update all other years to not current
    if (is_current) {
      await AcademicYear.update(
        { is_current: false },
        { where: {} }
      );
    }
    
    // Create academic year
    const academicYear = await AcademicYear.create({
      school_year,
      start_date,
      end_date,
      is_current: is_current || false,
      status: 'active'
    });
    
    res.status(201).json({
      success: true,
      data: academicYear
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Update academic year
 * @route   PUT /api/academic-years/:id
 * @access  Private
 */
exports.updateAcademicYear = async (req, res, next) => {
  try {
    const {
      school_year,
      start_date,
      end_date,
      is_current,
      status
    } = req.body;
    
    // Check if academic year exists
    let academicYear = await AcademicYear.findByPk(req.params.id);
    
    if (!academicYear) {
      return res.status(404).json({
        success: false,
        message: 'Academic year not found'
      });
    }
    
    // Check if school year is being changed and if it already exists
    if (school_year && school_year !== academicYear.school_year) {
      const yearExists = await AcademicYear.findOne({
        where: {
          school_year,
          id: { [Op.ne]: req.params.id }
        }
      });
      
      if (yearExists) {
        return res.status(400).json({
          success: false,
          message: 'School year already exists'
        });
      }
    }
    
    // If this is set as current, update all other years to not current
    if (is_current && !academicYear.is_current) {
      await AcademicYear.update(
        { is_current: false },
        { where: { id: { [Op.ne]: req.params.id } } }
      );
    }
    
    // Update academic year
    academicYear = await academicYear.update({
      school_year: school_year || academicYear.school_year,
      start_date: start_date || academicYear.start_date,
      end_date: end_date || academicYear.end_date,
      is_current: is_current !== undefined ? is_current : academicYear.is_current,
      status: status || academicYear.status
    });
    
    res.status(200).json({
      success: true,
      data: academicYear
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Delete academic year
 * @route   DELETE /api/academic-years/:id
 * @access  Private
 */
exports.deleteAcademicYear = async (req, res, next) => {
  try {
    const academicYear = await AcademicYear.findByPk(req.params.id);
    
    if (!academicYear) {
      return res.status(404).json({
        success: false,
        message: 'Academic year not found'
      });
    }
    
    // Check if academic year is used in manage subjects
    const managedSubjects = await ManageSubject.findAll({
      where: {
        academic_year_id: academicYear.id
      }
    });
    
    if (managedSubjects.length > 0) {
      return res.status(400).json({
        success: false,
        message: 'Cannot delete academic year that is used in subject assignments. Please remove all subject assignments for this year first.'
      });
    }
    
    // Check if academic year is used in student schedules
    const schedules = await StudentSchedule.findAll({
      where: {
        academic_year_id: academicYear.id
      }
    });
    
    if (schedules.length > 0) {
      return res.status(400).json({
        success: false,
        message: 'Cannot delete academic year that is used in student schedules. Please remove all schedules for this year first.'
      });
    }
    
    // If this is the current year, don't allow deletion
    if (academicYear.is_current) {
      return res.status(400).json({
        success: false,
        message: 'Cannot delete the current academic year. Please set another year as current first.'
      });
    }
    
    // Delete academic year
    await academicYear.destroy();
    
    res.status(200).json({
      success: true,
      message: 'Academic year deleted successfully'
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get current academic year
 * @route   GET /api/academic-years/current
 * @access  Private
 */
exports.getCurrentAcademicYear = async (req, res, next) => {
  try {
    const currentYear = await AcademicYear.findOne({
      where: {
        is_current: true
      }
    });
    
    if (!currentYear) {
      return res.status(404).json({
        success: false,
        message: 'No current academic year set'
      });
    }
    
    res.status(200).json({
      success: true,
      data: currentYear
    });
  } catch (error) {
    next(error);
  }
};
