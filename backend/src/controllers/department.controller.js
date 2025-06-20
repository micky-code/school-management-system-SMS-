const { 
  Department, 
  Teacher, 
  Major 
} = require('../models');
const { Op } = require('sequelize');

/**
 * @desc    Get all departments
 * @route   GET /api/departments
 * @access  Private
 */
exports.getDepartments = async (req, res, next) => {
  try {
    const { page = 1, limit = 10, search, status } = req.query;
    const offset = (page - 1) * limit;
    
    // Build filter conditions
    const whereConditions = {};
    
    if (search) {
      whereConditions[Op.or] = [
        { department_name: { [Op.like]: `%${search}%` } },
        { description: { [Op.like]: `%${search}%` } }
      ];
    }
    
    if (status) {
      whereConditions.status = status;
    }
    
    // Get departments with pagination
    const { count, rows: departments } = await Department.findAndCountAll({
      where: whereConditions,
      include: [
        {
          model: Teacher,
          as: 'Dean',
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
      data: departments,
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
 * @desc    Get single department
 * @route   GET /api/departments/:id
 * @access  Private
 */
exports.getDepartment = async (req, res, next) => {
  try {
    const department = await Department.findByPk(req.params.id, {
      include: [
        {
          model: Teacher,
          as: 'Dean',
          attributes: ['id', 'first_name', 'last_name', 'email']
        },
        {
          model: Major,
          attributes: ['id', 'major_name']
        }
      ]
    });
    
    if (!department) {
      return res.status(404).json({
        success: false,
        message: 'Department not found'
      });
    }
    
    res.status(200).json({
      success: true,
      data: department
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Create new department
 * @route   POST /api/departments
 * @access  Private
 */
exports.createDepartment = async (req, res, next) => {
  try {
    const {
      department_name,
      description,
      dean_id,
      established_date
    } = req.body;
    
    // Check if department name already exists
    const departmentExists = await Department.findOne({ 
      where: { 
        department_name 
      } 
    });
    
    if (departmentExists) {
      return res.status(400).json({
        success: false,
        message: 'Department with this name already exists'
      });
    }
    
    // Check if dean exists if provided
    if (dean_id) {
      const deanExists = await Teacher.findByPk(dean_id);
      
      if (!deanExists) {
        return res.status(400).json({
          success: false,
          message: 'Specified dean does not exist'
        });
      }
    }
    
    // Create department
    const department = await Department.create({
      department_name,
      description,
      dean_id,
      established_date,
      status: 'active'
    });
    
    res.status(201).json({
      success: true,
      data: department
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Update department
 * @route   PUT /api/departments/:id
 * @access  Private
 */
exports.updateDepartment = async (req, res, next) => {
  try {
    const {
      department_name,
      description,
      dean_id,
      established_date,
      status
    } = req.body;
    
    // Check if department exists
    let department = await Department.findByPk(req.params.id);
    
    if (!department) {
      return res.status(404).json({
        success: false,
        message: 'Department not found'
      });
    }
    
    // Check if department name is being changed and if it already exists
    if (department_name && department_name !== department.department_name) {
      const nameExists = await Department.findOne({
        where: {
          department_name,
          id: { [Op.ne]: req.params.id }
        }
      });
      
      if (nameExists) {
        return res.status(400).json({
          success: false,
          message: 'Department name already in use'
        });
      }
    }
    
    // Check if dean exists if provided
    if (dean_id && dean_id !== department.dean_id) {
      const deanExists = await Teacher.findByPk(dean_id);
      
      if (!deanExists) {
        return res.status(400).json({
          success: false,
          message: 'Specified dean does not exist'
        });
      }
    }
    
    // Update department
    department = await department.update({
      department_name: department_name || department.department_name,
      description: description || department.description,
      dean_id: dean_id || department.dean_id,
      established_date: established_date || department.established_date,
      status: status || department.status
    });
    
    res.status(200).json({
      success: true,
      data: department
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Delete department
 * @route   DELETE /api/departments/:id
 * @access  Private
 */
exports.deleteDepartment = async (req, res, next) => {
  try {
    const department = await Department.findByPk(req.params.id);
    
    if (!department) {
      return res.status(404).json({
        success: false,
        message: 'Department not found'
      });
    }
    
    // Check if department has any majors
    const majors = await Major.findAll({
      where: {
        department_id: department.id
      }
    });
    
    if (majors.length > 0) {
      return res.status(400).json({
        success: false,
        message: 'Cannot delete department with associated majors. Please delete the majors first.'
      });
    }
    
    // Check if department has any teachers
    const teachers = await Teacher.findAll({
      where: {
        department_id: department.id
      }
    });
    
    if (teachers.length > 0) {
      return res.status(400).json({
        success: false,
        message: 'Cannot delete department with associated teachers. Please reassign or delete the teachers first.'
      });
    }
    
    // Delete department
    await department.destroy();
    
    res.status(200).json({
      success: true,
      message: 'Department deleted successfully'
    });
  } catch (error) {
    next(error);
  }
};
