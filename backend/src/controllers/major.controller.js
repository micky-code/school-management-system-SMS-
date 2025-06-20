const { 
  Major, 
  Department, 
  Teacher, 
  Student 
} = require('../models');
const { Op } = require('sequelize');

/**
 * @desc    Get all majors
 * @route   GET /api/majors
 * @access  Private
 */
exports.getMajors = async (req, res, next) => {
  try {
    const { page = 1, limit = 10, search, status, department_id } = req.query;
    const offset = (page - 1) * limit;
    
    // Build filter conditions
    const whereConditions = {};
    
    if (search) {
      whereConditions[Op.or] = [
        { major_name: { [Op.like]: `%${search}%` } },
        { description: { [Op.like]: `%${search}%` } }
      ];
    }
    
    if (status) {
      whereConditions.status = status;
    }
    
    if (department_id) {
      whereConditions.department_id = department_id;
    }
    
    // Get majors with pagination
    const { count, rows: majors } = await Major.findAndCountAll({
      where: whereConditions,
      include: [
        {
          model: Department,
          attributes: ['id', 'department_name']
        },
        {
          model: Teacher,
          as: 'Coordinator',
          attributes: ['id', 'first_name', 'last_name']
        }
      ],
      limit: parseInt(limit),
      offset: offset,
      order: [['createdAt', 'DESC']]
    });
    
    res.status(200).json({
      success: true,
      count,
      data: majors,
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
 * @desc    Get single major
 * @route   GET /api/majors/:id
 * @access  Private
 */
exports.getMajor = async (req, res, next) => {
  try {
    const major = await Major.findByPk(req.params.id, {
      include: [
        {
          model: Department,
          attributes: ['id', 'department_name']
        },
        {
          model: Teacher,
          as: 'Coordinator',
          attributes: ['id', 'first_name', 'last_name', 'email']
        }
      ]
    });
    
    if (!major) {
      return res.status(404).json({
        success: false,
        message: 'Major not found'
      });
    }
    
    res.status(200).json({
      success: true,
      data: major
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Create new major
 * @route   POST /api/majors
 * @access  Private
 */
exports.createMajor = async (req, res, next) => {
  try {
    const {
      major_name,
      department_id,
      coordinator_id,
      description,
      duration
    } = req.body;
    
    // Check if major name already exists
    const majorExists = await Major.findOne({ 
      where: { 
        major_name 
      } 
    });
    
    if (majorExists) {
      return res.status(400).json({
        success: false,
        message: 'Major with this name already exists'
      });
    }
    
    // Check if department exists
    const departmentExists = await Department.findByPk(department_id);
    
    if (!departmentExists) {
      return res.status(400).json({
        success: false,
        message: 'Department does not exist'
      });
    }
    
    // Check if coordinator exists if provided
    if (coordinator_id) {
      const coordinatorExists = await Teacher.findByPk(coordinator_id);
      
      if (!coordinatorExists) {
        return res.status(400).json({
          success: false,
          message: 'Specified coordinator does not exist'
        });
      }
    }
    
    // Create major
    const major = await Major.create({
      major_name,
      department_id,
      coordinator_id,
      description,
      duration,
      status: 'active'
    });
    
    res.status(201).json({
      success: true,
      data: major
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Update major
 * @route   PUT /api/majors/:id
 * @access  Private
 */
exports.updateMajor = async (req, res, next) => {
  try {
    const {
      major_name,
      department_id,
      coordinator_id,
      description,
      duration,
      status
    } = req.body;
    
    // Check if major exists
    let major = await Major.findByPk(req.params.id);
    
    if (!major) {
      return res.status(404).json({
        success: false,
        message: 'Major not found'
      });
    }
    
    // Check if major name is being changed and if it already exists
    if (major_name && major_name !== major.major_name) {
      const nameExists = await Major.findOne({
        where: {
          major_name,
          id: { [Op.ne]: req.params.id }
        }
      });
      
      if (nameExists) {
        return res.status(400).json({
          success: false,
          message: 'Major name already in use'
        });
      }
    }
    
    // Check if department exists if changing
    if (department_id && department_id !== major.department_id) {
      const departmentExists = await Department.findByPk(department_id);
      
      if (!departmentExists) {
        return res.status(400).json({
          success: false,
          message: 'Department does not exist'
        });
      }
    }
    
    // Check if coordinator exists if changing
    if (coordinator_id && coordinator_id !== major.coordinator_id) {
      const coordinatorExists = await Teacher.findByPk(coordinator_id);
      
      if (!coordinatorExists) {
        return res.status(400).json({
          success: false,
          message: 'Specified coordinator does not exist'
        });
      }
    }
    
    // Update major
    major = await major.update({
      major_name: major_name || major.major_name,
      department_id: department_id || major.department_id,
      coordinator_id: coordinator_id || major.coordinator_id,
      description: description || major.description,
      duration: duration || major.duration,
      status: status || major.status
    });
    
    res.status(200).json({
      success: true,
      data: major
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Delete major
 * @route   DELETE /api/majors/:id
 * @access  Private
 */
exports.deleteMajor = async (req, res, next) => {
  try {
    const major = await Major.findByPk(req.params.id);
    
    if (!major) {
      return res.status(404).json({
        success: false,
        message: 'Major not found'
      });
    }
    
    // Check if major has any students
    const students = await Student.findAll({
      where: {
        major_id: major.id
      }
    });
    
    if (students.length > 0) {
      return res.status(400).json({
        success: false,
        message: 'Cannot delete major with associated students. Please reassign or delete the students first.'
      });
    }
    
    // Delete major
    await major.destroy();
    
    res.status(200).json({
      success: true,
      message: 'Major deleted successfully'
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get majors by department
 * @route   GET /api/majors/department/:departmentId
 * @access  Private
 */
exports.getMajorsByDepartment = async (req, res, next) => {
  try {
    const { status } = req.query;
    
    const whereConditions = {
      department_id: req.params.departmentId
    };
    
    if (status) {
      whereConditions.status = status;
    }
    
    const majors = await Major.findAll({
      where: whereConditions,
      include: [
        {
          model: Teacher,
          as: 'Coordinator',
          attributes: ['id', 'first_name', 'last_name']
        }
      ],
      order: [['major_name', 'ASC']]
    });
    
    res.status(200).json({
      success: true,
      count: majors.length,
      data: majors
    });
  } catch (error) {
    next(error);
  }
};
