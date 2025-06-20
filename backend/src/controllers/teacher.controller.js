const { 
  Teacher, 
  User, 
  Department 
} = require('../models');
const { generatePassword } = require('../utils/generators');
const { Op } = require('sequelize');

/**
 * @desc    Get all teachers
 * @route   GET /api/teachers
 * @access  Private
 */
exports.getTeachers = async (req, res, next) => {
  try {
    const { page = 1, limit = 10, search, status, department_id, teacher_type } = req.query;
    const offset = (page - 1) * limit;
    
    // Build filter conditions
    const whereConditions = {};
    
    if (search) {
      whereConditions[Op.or] = [
        { first_name: { [Op.like]: `%${search}%` } },
        { last_name: { [Op.like]: `%${search}%` } },
        { email: { [Op.like]: `%${search}%` } },
        { position: { [Op.like]: `%${search}%` } }
      ];
    }
    
    if (status) {
      whereConditions.status = status;
    }
    
    if (department_id) {
      whereConditions.department_id = department_id;
    }
    
    if (teacher_type) {
      whereConditions.teacher_type = teacher_type;
    }
    
    // Get teachers with pagination
    const { count, rows: teachers } = await Teacher.findAndCountAll({
      where: whereConditions,
      include: [
        {
          model: Department,
          attributes: ['department_name']
        }
      ],
      limit: parseInt(limit),
      offset: offset,
      order: [['createdAt', 'DESC']]
    });
    
    res.status(200).json({
      success: true,
      count,
      data: teachers,
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
 * @desc    Get single teacher
 * @route   GET /api/teachers/:id
 * @access  Private
 */
exports.getTeacher = async (req, res, next) => {
  try {
    const teacher = await Teacher.findByPk(req.params.id, {
      include: [
        {
          model: Department,
          attributes: ['id', 'department_name']
        }
      ]
    });
    
    if (!teacher) {
      return res.status(404).json({
        success: false,
        message: 'Teacher not found'
      });
    }
    
    res.status(200).json({
      success: true,
      data: teacher
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Create new teacher
 * @route   POST /api/teachers
 * @access  Private
 */
exports.createTeacher = async (req, res, next) => {
  try {
    const {
      first_name,
      last_name,
      gender,
      date_of_birth,
      email,
      phone,
      address,
      city,
      state,
      postal_code,
      country,
      image,
      teacher_type,
      position,
      department_id,
      hire_date
    } = req.body;
    
    // Check if teacher email already exists
    const teacherExists = await Teacher.findOne({ where: { email } });
    
    if (teacherExists) {
      return res.status(400).json({
        success: false,
        message: 'Teacher with this email already exists'
      });
    }
    
    // Create teacher
    const teacher = await Teacher.create({
      first_name,
      last_name,
      gender,
      date_of_birth,
      email,
      phone,
      address,
      city,
      state,
      postal_code,
      country,
      image,
      teacher_type,
      position,
      department_id,
      hire_date,
      status: 'active'
    });
    
    // Generate password for teacher user account
    const password = generatePassword();
    
    // Create user account for teacher
    const user = await User.create({
      username: email.split('@')[0],
      email: email,
      password: password,
      role_id: 2, // Teacher role
      profile_id: teacher.id,
      profile_type: 'teacher'
    });
    
    res.status(201).json({
      success: true,
      data: teacher,
      user: {
        username: user.username,
        email: user.email,
        password: password // Only return plain password on creation
      }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Update teacher
 * @route   PUT /api/teachers/:id
 * @access  Private
 */
exports.updateTeacher = async (req, res, next) => {
  try {
    const {
      first_name,
      last_name,
      gender,
      date_of_birth,
      email,
      phone,
      address,
      city,
      state,
      postal_code,
      country,
      image,
      teacher_type,
      position,
      department_id,
      hire_date,
      status
    } = req.body;
    
    // Check if teacher exists
    let teacher = await Teacher.findByPk(req.params.id);
    
    if (!teacher) {
      return res.status(404).json({
        success: false,
        message: 'Teacher not found'
      });
    }
    
    // Check if email is being changed and if it already exists
    if (email && email !== teacher.email) {
      const emailExists = await Teacher.findOne({
        where: {
          email,
          id: { [Op.ne]: req.params.id }
        }
      });
      
      if (emailExists) {
        return res.status(400).json({
          success: false,
          message: 'Email already in use'
        });
      }
      
      // Update user email if it exists
      const user = await User.findOne({
        where: {
          profile_id: teacher.id,
          profile_type: 'teacher'
        }
      });
      
      if (user) {
        user.email = email;
        await user.save();
      }
    }
    
    // Update teacher
    teacher = await teacher.update({
      first_name: first_name || teacher.first_name,
      last_name: last_name || teacher.last_name,
      gender: gender || teacher.gender,
      date_of_birth: date_of_birth || teacher.date_of_birth,
      email: email || teacher.email,
      phone: phone || teacher.phone,
      address: address || teacher.address,
      city: city || teacher.city,
      state: state || teacher.state,
      postal_code: postal_code || teacher.postal_code,
      country: country || teacher.country,
      image: image || teacher.image,
      teacher_type: teacher_type || teacher.teacher_type,
      position: position || teacher.position,
      department_id: department_id || teacher.department_id,
      hire_date: hire_date || teacher.hire_date,
      status: status || teacher.status
    });
    
    res.status(200).json({
      success: true,
      data: teacher
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Delete teacher
 * @route   DELETE /api/teachers/:id
 * @access  Private
 */
exports.deleteTeacher = async (req, res, next) => {
  try {
    const teacher = await Teacher.findByPk(req.params.id);
    
    if (!teacher) {
      return res.status(404).json({
        success: false,
        message: 'Teacher not found'
      });
    }
    
    // Find and delete associated user account
    const user = await User.findOne({
      where: {
        profile_id: teacher.id,
        profile_type: 'teacher'
      }
    });
    
    if (user) {
      await user.destroy();
    }
    
    // Delete teacher
    await teacher.destroy();
    
    res.status(200).json({
      success: true,
      message: 'Teacher deleted successfully'
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get teachers by department
 * @route   GET /api/teachers/department/:departmentId
 * @access  Private
 */
exports.getTeachersByDepartment = async (req, res, next) => {
  try {
    const { status, teacher_type } = req.query;
    
    const whereConditions = {
      department_id: req.params.departmentId
    };
    
    if (status) {
      whereConditions.status = status;
    }
    
    if (teacher_type) {
      whereConditions.teacher_type = teacher_type;
    }
    
    const teachers = await Teacher.findAll({
      where: whereConditions,
      include: [
        {
          model: Department,
          attributes: ['department_name']
        }
      ],
      order: [['createdAt', 'DESC']]
    });
    
    res.status(200).json({
      success: true,
      count: teachers.length,
      data: teachers
    });
  } catch (error) {
    next(error);
  }
};
