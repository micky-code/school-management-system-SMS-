const { 
  MainProgram, 
  Student 
} = require('../models');
const { Op } = require('sequelize');

/**
 * @desc    Get all main programs
 * @route   GET /api/main-programs
 * @access  Private
 */
exports.getMainPrograms = async (req, res, next) => {
  try {
    const { page = 1, limit = 10, search, status } = req.query;
    const offset = (page - 1) * limit;
    
    // Build filter conditions
    const whereConditions = {};
    
    if (search) {
      whereConditions[Op.or] = [
        { program_name: { [Op.like]: `%${search}%` } },
        { description: { [Op.like]: `%${search}%` } }
      ];
    }
    
    if (status) {
      whereConditions.status = status;
    }
    
    // Get main programs with pagination
    const { count, rows: programs } = await MainProgram.findAndCountAll({
      where: whereConditions,
      limit: parseInt(limit),
      offset: offset,
      order: [['program_name', 'ASC']]
    });
    
    res.status(200).json({
      success: true,
      count,
      data: programs,
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
 * @desc    Get single main program
 * @route   GET /api/main-programs/:id
 * @access  Private
 */
exports.getMainProgram = async (req, res, next) => {
  try {
    const program = await MainProgram.findByPk(req.params.id);
    
    if (!program) {
      return res.status(404).json({
        success: false,
        message: 'Program not found'
      });
    }
    
    res.status(200).json({
      success: true,
      data: program
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Create new main program
 * @route   POST /api/main-programs
 * @access  Private
 */
exports.createMainProgram = async (req, res, next) => {
  try {
    const {
      program_name,
      description,
      duration
    } = req.body;
    
    // Check if program name already exists
    const programExists = await MainProgram.findOne({ 
      where: { 
        program_name 
      } 
    });
    
    if (programExists) {
      return res.status(400).json({
        success: false,
        message: 'Program with this name already exists'
      });
    }
    
    // Create main program
    const program = await MainProgram.create({
      program_name,
      description,
      duration,
      status: 'active'
    });
    
    res.status(201).json({
      success: true,
      data: program
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Update main program
 * @route   PUT /api/main-programs/:id
 * @access  Private
 */
exports.updateMainProgram = async (req, res, next) => {
  try {
    const {
      program_name,
      description,
      duration,
      status
    } = req.body;
    
    // Check if program exists
    let program = await MainProgram.findByPk(req.params.id);
    
    if (!program) {
      return res.status(404).json({
        success: false,
        message: 'Program not found'
      });
    }
    
    // Check if program name is being changed and if it already exists
    if (program_name && program_name !== program.program_name) {
      const nameExists = await MainProgram.findOne({
        where: {
          program_name,
          id: { [Op.ne]: req.params.id }
        }
      });
      
      if (nameExists) {
        return res.status(400).json({
          success: false,
          message: 'Program name already in use'
        });
      }
    }
    
    // Update main program
    program = await program.update({
      program_name: program_name || program.program_name,
      description: description || program.description,
      duration: duration || program.duration,
      status: status || program.status
    });
    
    res.status(200).json({
      success: true,
      data: program
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Delete main program
 * @route   DELETE /api/main-programs/:id
 * @access  Private
 */
exports.deleteMainProgram = async (req, res, next) => {
  try {
    const program = await MainProgram.findByPk(req.params.id);
    
    if (!program) {
      return res.status(404).json({
        success: false,
        message: 'Program not found'
      });
    }
    
    // Check if program has any students
    const students = await Student.findAll({
      where: {
        program_id: program.id
      }
    });
    
    if (students.length > 0) {
      return res.status(400).json({
        success: false,
        message: 'Cannot delete program with associated students. Please reassign or delete the students first.'
      });
    }
    
    // Delete main program
    await program.destroy();
    
    res.status(200).json({
      success: true,
      message: 'Program deleted successfully'
    });
  } catch (error) {
    next(error);
  }
};
