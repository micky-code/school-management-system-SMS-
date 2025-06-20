const { 
  ManageSubject,
  Subject,
  Major,
  Teacher,
  AcademicYear,
  StudentSchedule
} = require('../models');
const { Op } = require('sequelize');

/**
 * @desc    Get all managed subjects
 * @route   GET /api/manage-subjects
 * @access  Private
 */
exports.getManagedSubjects = async (req, res, next) => {
  try {
    const { 
      page = 1, 
      limit = 10, 
      major_id, 
      teacher_id, 
      subject_id, 
      academic_year_id,
      semester,
      status 
    } = req.query;
    
    const offset = (page - 1) * limit;
    
    // Build filter conditions
    const whereConditions = {};
    
    if (major_id) {
      whereConditions.major_id = major_id;
    }
    
    if (teacher_id) {
      whereConditions.teacher_id = teacher_id;
    }
    
    if (subject_id) {
      whereConditions.subject_id = subject_id;
    }
    
    if (academic_year_id) {
      whereConditions.academic_year_id = academic_year_id;
    }
    
    if (semester) {
      whereConditions.semester = semester;
    }
    
    if (status) {
      whereConditions.status = status;
    }
    
    // Get managed subjects with pagination
    const { count, rows: managedSubjects } = await ManageSubject.findAndCountAll({
      where: whereConditions,
      include: [
        {
          model: Subject,
          attributes: ['id', 'subject_name', 'subject_code', 'credit_hours']
        },
        {
          model: Major,
          attributes: ['id', 'major_name']
        },
        {
          model: Teacher,
          attributes: ['id', 'first_name', 'last_name']
        },
        {
          model: AcademicYear,
          attributes: ['id', 'school_year']
        }
      ],
      limit: parseInt(limit),
      offset: offset,
      order: [['createdAt', 'DESC']]
    });
    
    res.status(200).json({
      success: true,
      count,
      data: managedSubjects,
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
 * @desc    Get single managed subject
 * @route   GET /api/manage-subjects/:id
 * @access  Private
 */
exports.getManagedSubject = async (req, res, next) => {
  try {
    const managedSubject = await ManageSubject.findByPk(req.params.id, {
      include: [
        {
          model: Subject,
          attributes: ['id', 'subject_name', 'subject_code', 'credit_hours']
        },
        {
          model: Major,
          attributes: ['id', 'major_name']
        },
        {
          model: Teacher,
          attributes: ['id', 'first_name', 'last_name', 'email']
        },
        {
          model: AcademicYear,
          attributes: ['id', 'school_year', 'start_date', 'end_date']
        }
      ]
    });
    
    if (!managedSubject) {
      return res.status(404).json({
        success: false,
        message: 'Managed subject not found'
      });
    }
    
    res.status(200).json({
      success: true,
      data: managedSubject
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Create new managed subject
 * @route   POST /api/manage-subjects
 * @access  Private
 */
exports.createManagedSubject = async (req, res, next) => {
  try {
    const {
      subject_id,
      major_id,
      teacher_id,
      academic_year_id,
      semester,
      notes
    } = req.body;
    
    // Check if all required entities exist
    const subject = await Subject.findByPk(subject_id);
    if (!subject) {
      return res.status(400).json({
        success: false,
        message: 'Subject does not exist'
      });
    }
    
    const major = await Major.findByPk(major_id);
    if (!major) {
      return res.status(400).json({
        success: false,
        message: 'Major does not exist'
      });
    }
    
    const teacher = await Teacher.findByPk(teacher_id);
    if (!teacher) {
      return res.status(400).json({
        success: false,
        message: 'Teacher does not exist'
      });
    }
    
    const academicYear = await AcademicYear.findByPk(academic_year_id);
    if (!academicYear) {
      return res.status(400).json({
        success: false,
        message: 'Academic year does not exist'
      });
    }
    
    // Check if this subject is already assigned to this major in this semester and academic year
    const existingAssignment = await ManageSubject.findOne({
      where: {
        subject_id,
        major_id,
        academic_year_id,
        semester
      }
    });
    
    if (existingAssignment) {
      return res.status(400).json({
        success: false,
        message: 'This subject is already assigned to this major for the specified semester and academic year'
      });
    }
    
    // Create managed subject
    const managedSubject = await ManageSubject.create({
      subject_id,
      major_id,
      teacher_id,
      academic_year_id,
      semester,
      notes,
      status: 'active'
    });
    
    // Get the created record with associations
    const result = await ManageSubject.findByPk(managedSubject.id, {
      include: [
        {
          model: Subject,
          attributes: ['id', 'subject_name', 'subject_code']
        },
        {
          model: Major,
          attributes: ['id', 'major_name']
        },
        {
          model: Teacher,
          attributes: ['id', 'first_name', 'last_name']
        },
        {
          model: AcademicYear,
          attributes: ['id', 'school_year']
        }
      ]
    });
    
    res.status(201).json({
      success: true,
      data: result
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Update managed subject
 * @route   PUT /api/manage-subjects/:id
 * @access  Private
 */
exports.updateManagedSubject = async (req, res, next) => {
  try {
    const {
      subject_id,
      major_id,
      teacher_id,
      academic_year_id,
      semester,
      notes,
      status
    } = req.body;
    
    // Check if managed subject exists
    let managedSubject = await ManageSubject.findByPk(req.params.id);
    
    if (!managedSubject) {
      return res.status(404).json({
        success: false,
        message: 'Managed subject not found'
      });
    }
    
    // If changing key fields, check if the new combination already exists
    if ((subject_id && subject_id !== managedSubject.subject_id) || 
        (major_id && major_id !== managedSubject.major_id) || 
        (academic_year_id && academic_year_id !== managedSubject.academic_year_id) || 
        (semester && semester !== managedSubject.semester)) {
      
      const existingAssignment = await ManageSubject.findOne({
        where: {
          subject_id: subject_id || managedSubject.subject_id,
          major_id: major_id || managedSubject.major_id,
          academic_year_id: academic_year_id || managedSubject.academic_year_id,
          semester: semester || managedSubject.semester,
          id: { [Op.ne]: req.params.id }
        }
      });
      
      if (existingAssignment) {
        return res.status(400).json({
          success: false,
          message: 'This subject is already assigned to this major for the specified semester and academic year'
        });
      }
    }
    
    // Check if referenced entities exist if changing
    if (subject_id && subject_id !== managedSubject.subject_id) {
      const subject = await Subject.findByPk(subject_id);
      if (!subject) {
        return res.status(400).json({
          success: false,
          message: 'Subject does not exist'
        });
      }
    }
    
    if (major_id && major_id !== managedSubject.major_id) {
      const major = await Major.findByPk(major_id);
      if (!major) {
        return res.status(400).json({
          success: false,
          message: 'Major does not exist'
        });
      }
    }
    
    if (teacher_id && teacher_id !== managedSubject.teacher_id) {
      const teacher = await Teacher.findByPk(teacher_id);
      if (!teacher) {
        return res.status(400).json({
          success: false,
          message: 'Teacher does not exist'
        });
      }
    }
    
    if (academic_year_id && academic_year_id !== managedSubject.academic_year_id) {
      const academicYear = await AcademicYear.findByPk(academic_year_id);
      if (!academicYear) {
        return res.status(400).json({
          success: false,
          message: 'Academic year does not exist'
        });
      }
    }
    
    // Update managed subject
    managedSubject = await managedSubject.update({
      subject_id: subject_id || managedSubject.subject_id,
      major_id: major_id || managedSubject.major_id,
      teacher_id: teacher_id || managedSubject.teacher_id,
      academic_year_id: academic_year_id || managedSubject.academic_year_id,
      semester: semester || managedSubject.semester,
      notes: notes || managedSubject.notes,
      status: status || managedSubject.status
    });
    
    // Get the updated record with associations
    const result = await ManageSubject.findByPk(managedSubject.id, {
      include: [
        {
          model: Subject,
          attributes: ['id', 'subject_name', 'subject_code']
        },
        {
          model: Major,
          attributes: ['id', 'major_name']
        },
        {
          model: Teacher,
          attributes: ['id', 'first_name', 'last_name']
        },
        {
          model: AcademicYear,
          attributes: ['id', 'school_year']
        }
      ]
    });
    
    res.status(200).json({
      success: true,
      data: result
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Delete managed subject
 * @route   DELETE /api/manage-subjects/:id
 * @access  Private
 */
exports.deleteManagedSubject = async (req, res, next) => {
  try {
    const managedSubject = await ManageSubject.findByPk(req.params.id);
    
    if (!managedSubject) {
      return res.status(404).json({
        success: false,
        message: 'Managed subject not found'
      });
    }
    
    // Check if there are any schedules using this managed subject
    const schedules = await StudentSchedule.findAll({
      where: {
        manage_subject_id: managedSubject.id
      }
    });
    
    if (schedules.length > 0) {
      return res.status(400).json({
        success: false,
        message: 'Cannot delete subject assignment that has schedules. Please delete the schedules first.'
      });
    }
    
    // Delete managed subject
    await managedSubject.destroy();
    
    res.status(200).json({
      success: true,
      message: 'Subject assignment deleted successfully'
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get managed subjects by major
 * @route   GET /api/manage-subjects/major/:majorId
 * @access  Private
 */
exports.getManagedSubjectsByMajor = async (req, res, next) => {
  try {
    const { academic_year_id, semester, status } = req.query;
    
    const whereConditions = {
      major_id: req.params.majorId
    };
    
    if (academic_year_id) {
      whereConditions.academic_year_id = academic_year_id;
    }
    
    if (semester) {
      whereConditions.semester = semester;
    }
    
    if (status) {
      whereConditions.status = status;
    }
    
    const managedSubjects = await ManageSubject.findAll({
      where: whereConditions,
      include: [
        {
          model: Subject,
          attributes: ['id', 'subject_name', 'subject_code', 'credit_hours']
        },
        {
          model: Teacher,
          attributes: ['id', 'first_name', 'last_name']
        },
        {
          model: AcademicYear,
          attributes: ['id', 'school_year']
        }
      ],
      order: [['createdAt', 'DESC']]
    });
    
    res.status(200).json({
      success: true,
      count: managedSubjects.length,
      data: managedSubjects
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get managed subjects by teacher
 * @route   GET /api/manage-subjects/teacher/:teacherId
 * @access  Private
 */
exports.getManagedSubjectsByTeacher = async (req, res, next) => {
  try {
    const { academic_year_id, semester, status } = req.query;
    
    const whereConditions = {
      teacher_id: req.params.teacherId
    };
    
    if (academic_year_id) {
      whereConditions.academic_year_id = academic_year_id;
    }
    
    if (semester) {
      whereConditions.semester = semester;
    }
    
    if (status) {
      whereConditions.status = status;
    }
    
    const managedSubjects = await ManageSubject.findAll({
      where: whereConditions,
      include: [
        {
          model: Subject,
          attributes: ['id', 'subject_name', 'subject_code', 'credit_hours']
        },
        {
          model: Major,
          attributes: ['id', 'major_name']
        },
        {
          model: AcademicYear,
          attributes: ['id', 'school_year']
        }
      ],
      order: [['createdAt', 'DESC']]
    });
    
    res.status(200).json({
      success: true,
      count: managedSubjects.length,
      data: managedSubjects
    });
  } catch (error) {
    next(error);
  }
};
