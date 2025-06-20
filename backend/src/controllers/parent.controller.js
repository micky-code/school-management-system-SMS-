const { 
  Parent, 
  User, 
  Student 
} = require('../models');
const { generateDefaultPassword } = require('../utils/generators');
const { Op } = require('sequelize');

/**
 * @desc    Get all parents
 * @route   GET /api/parents
 * @access  Private
 */
exports.getParents = async (req, res, next) => {
  try {
    const { page = 1, limit = 10, search, status } = req.query;
    const offset = (page - 1) * limit;
    
    // Build filter conditions
    const whereConditions = {};
    
    if (search) {
      whereConditions[Op.or] = [
        { first_name: { [Op.like]: `%${search}%` } },
        { last_name: { [Op.like]: `%${search}%` } },
        { email: { [Op.like]: `%${search}%` } },
        { phone: { [Op.like]: `%${search}%` } }
      ];
    }
    
    if (status) {
      whereConditions.status = status;
    }
    
    // Get parents with pagination
    const { count, rows: parents } = await Parent.findAndCountAll({
      where: whereConditions,
      include: [
        {
          model: Student,
          attributes: ['id', 'first_name', 'last_name', 'student_id_card']
        }
      ],
      limit: parseInt(limit),
      offset: offset,
      order: [['createdAt', 'DESC']]
    });
    
    res.status(200).json({
      success: true,
      count,
      data: parents,
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
 * @desc    Get single parent
 * @route   GET /api/parents/:id
 * @access  Private
 */
exports.getParent = async (req, res, next) => {
  try {
    const parent = await Parent.findByPk(req.params.id, {
      include: [
        {
          model: Student,
          attributes: ['id', 'first_name', 'last_name', 'student_id_card', 'email', 'phone']
        }
      ]
    });
    
    if (!parent) {
      return res.status(404).json({
        success: false,
        message: 'Parent not found'
      });
    }
    
    res.status(200).json({
      success: true,
      data: parent
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Create new parent
 * @route   POST /api/parents
 * @access  Private
 */
exports.createParent = async (req, res, next) => {
  try {
    const {
      first_name,
      last_name,
      gender,
      relationship,
      email,
      phone,
      alternate_phone,
      address,
      city,
      state,
      postal_code,
      country,
      occupation
    } = req.body;
    
    // Check if parent email already exists
    const parentExists = await Parent.findOne({ where: { email } });
    
    if (parentExists) {
      return res.status(400).json({
        success: false,
        message: 'Parent with this email already exists'
      });
    }
    
    // Create parent
    const parent = await Parent.create({
      first_name,
      last_name,
      gender,
      relationship,
      email,
      phone,
      alternate_phone,
      address,
      city,
      state,
      postal_code,
      country,
      occupation,
      status: 'active'
    });
    
    // Generate default password for parent user account (spi123)
    const hashedPassword = await generateDefaultPassword();
    
    // Create user account for parent
    const user = await User.create({
      username: email.split('@')[0],
      email: email,
      password: hashedPassword,
      role_id: 4, // Parent role
      profile_id: parent.id,
      profile_type: 'parent'
    });
    
    res.status(201).json({
      success: true,
      data: parent,
      user: {
        username: user.username,
        email: user.email,
        password: 'spi123' // Default password
      }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Update parent
 * @route   PUT /api/parents/:id
 * @access  Private
 */
exports.updateParent = async (req, res, next) => {
  try {
    const {
      first_name,
      last_name,
      gender,
      relationship,
      email,
      phone,
      alternate_phone,
      address,
      city,
      state,
      postal_code,
      country,
      occupation,
      status
    } = req.body;
    
    // Check if parent exists
    let parent = await Parent.findByPk(req.params.id);
    
    if (!parent) {
      return res.status(404).json({
        success: false,
        message: 'Parent not found'
      });
    }
    
    // Check if email is being changed and if it already exists
    if (email && email !== parent.email) {
      const emailExists = await Parent.findOne({
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
          profile_id: parent.id,
          profile_type: 'parent'
        }
      });
      
      if (user) {
        user.email = email;
        await user.save();
      }
    }
    
    // Update parent
    parent = await parent.update({
      first_name: first_name || parent.first_name,
      last_name: last_name || parent.last_name,
      gender: gender || parent.gender,
      relationship: relationship || parent.relationship,
      email: email || parent.email,
      phone: phone || parent.phone,
      alternate_phone: alternate_phone || parent.alternate_phone,
      address: address || parent.address,
      city: city || parent.city,
      state: state || parent.state,
      postal_code: postal_code || parent.postal_code,
      country: country || parent.country,
      occupation: occupation || parent.occupation,
      status: status || parent.status
    });
    
    res.status(200).json({
      success: true,
      data: parent
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Delete parent
 * @route   DELETE /api/parents/:id
 * @access  Private
 */
exports.deleteParent = async (req, res, next) => {
  try {
    const parent = await Parent.findByPk(req.params.id);
    
    if (!parent) {
      return res.status(404).json({
        success: false,
        message: 'Parent not found'
      });
    }
    
    // Check if parent has any students
    const students = await Student.findAll({
      where: {
        parent_id: parent.id
      }
    });
    
    if (students.length > 0) {
      return res.status(400).json({
        success: false,
        message: 'Cannot delete parent with associated students. Please reassign or delete the students first.'
      });
    }
    
    // Find and delete associated user account
    const user = await User.findOne({
      where: {
        profile_id: parent.id,
        profile_type: 'parent'
      }
    });
    
    if (user) {
      await user.destroy();
    }
    
    // Delete parent
    await parent.destroy();
    
    res.status(200).json({
      success: true,
      message: 'Parent deleted successfully'
    });
  } catch (error) {
    next(error);
  }
};
