const { 
  Subject, 
  ManageSubject 
} = require('../models');
const { Op } = require('sequelize');

/**
 * @desc    Get all subjects
 * @route   GET /api/subjects
 * @access  Private
 */
exports.getSubjects = async (req, res, next) => {
  try {
    const { page = 1, limit = 10, search, status } = req.query;
    const offset = (page - 1) * limit;
    
    // Build filter conditions
    const whereConditions = {};
    
    if (search) {
      whereConditions[Op.or] = [
        { subject_name: { [Op.like]: `%${search}%` } },
        { subject_code: { [Op.like]: `%${search}%` } },
        { description: { [Op.like]: `%${search}%` } }
      ];
    }
    
    if (status) {
      whereConditions.status = status;
    }
    
    // Get subjects with pagination
    const { count, rows: subjects } = await Subject.findAndCountAll({
      where: whereConditions,
      limit: parseInt(limit),
      offset: offset,
      order: [['subject_name', 'ASC']]
    });
    
    res.status(200).json({
      success: true,
      count,
      data: subjects,
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
 * @desc    Get single subject
 * @route   GET /api/subjects/:id
 * @access  Private
 */
exports.getSubject = async (req, res, next) => {
  try {
    const subject = await Subject.findByPk(req.params.id);
    
    if (!subject) {
      return res.status(404).json({
        success: false,
        message: 'Subject not found'
      });
    }
    
    res.status(200).json({
      success: true,
      data: subject
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Create new subject
 * @route   POST /api/subjects
 * @access  Private
 */
exports.createSubject = async (req, res, next) => {
  try {
    const {
      subject_name,
      subject_code,
      description,
      credit_hours
    } = req.body;
    
    // Check if subject code already exists
    const subjectCodeExists = await Subject.findOne({ 
      where: { 
        subject_code 
      } 
    });
    
    if (subjectCodeExists) {
      return res.status(400).json({
        success: false,
        message: 'Subject with this code already exists'
      });
    }
    
    // Check if subject name already exists
    const subjectNameExists = await Subject.findOne({ 
      where: { 
        subject_name 
      } 
    });
    
    if (subjectNameExists) {
      return res.status(400).json({
        success: false,
        message: 'Subject with this name already exists'
      });
    }
    
    // Create subject
    const subject = await Subject.create({
      subject_name,
      subject_code,
      description,
      credit_hours,
      status: 'active'
    });
    
    res.status(201).json({
      success: true,
      data: subject
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Update subject
 * @route   PUT /api/subjects/:id
 * @access  Private
 */
exports.updateSubject = async (req, res, next) => {
  try {
    const {
      subject_name,
      subject_code,
      description,
      credit_hours,
      status
    } = req.body;
    
    // Check if subject exists
    let subject = await Subject.findByPk(req.params.id);
    
    if (!subject) {
      return res.status(404).json({
        success: false,
        message: 'Subject not found'
      });
    }
    
    // Check if subject code is being changed and if it already exists
    if (subject_code && subject_code !== subject.subject_code) {
      const codeExists = await Subject.findOne({
        where: {
          subject_code,
          id: { [Op.ne]: req.params.id }
        }
      });
      
      if (codeExists) {
        return res.status(400).json({
          success: false,
          message: 'Subject code already in use'
        });
      }
    }
    
    // Check if subject name is being changed and if it already exists
    if (subject_name && subject_name !== subject.subject_name) {
      const nameExists = await Subject.findOne({
        where: {
          subject_name,
          id: { [Op.ne]: req.params.id }
        }
      });
      
      if (nameExists) {
        return res.status(400).json({
          success: false,
          message: 'Subject name already in use'
        });
      }
    }
    
    // Update subject
    subject = await subject.update({
      subject_name: subject_name || subject.subject_name,
      subject_code: subject_code || subject.subject_code,
      description: description || subject.description,
      credit_hours: credit_hours || subject.credit_hours,
      status: status || subject.status
    });
    
    res.status(200).json({
      success: true,
      data: subject
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Delete subject
 * @route   DELETE /api/subjects/:id
 * @access  Private
 */
exports.deleteSubject = async (req, res, next) => {
  try {
    const subject = await Subject.findByPk(req.params.id);
    
    if (!subject) {
      return res.status(404).json({
        success: false,
        message: 'Subject not found'
      });
    }
    
    // Check if subject is assigned to any major
    const managedSubjects = await ManageSubject.findAll({
      where: {
        subject_id: subject.id
      }
    });
    
    if (managedSubjects.length > 0) {
      return res.status(400).json({
        success: false,
        message: 'Cannot delete subject that is assigned to majors. Please remove the subject from all majors first.'
      });
    }
    
    // Delete subject
    await subject.destroy();
    
    res.status(200).json({
      success: true,
      message: 'Subject deleted successfully'
    });
  } catch (error) {
    next(error);
  }
};
