const mysql = require('mysql2/promise');
const bcrypt = require('bcryptjs');

/**
 * @desc    Get all students
 * @route   GET /api/students
 * @access  Private
 */
exports.getStudents = async (req, res, next) => {
  try {
    const { page = 1, limit = 10, search, program_id, batch_id } = req.query;
    const offset = (page - 1) * limit;
    
    const connection = await mysql.createConnection({
      host: process.env.DB_HOST || '127.0.0.1',
      user: process.env.DB_USER || 'root',
      password: process.env.DB_PASSWORD || '',
      database: process.env.DB_NAME || 'sms_spi'
    });

    // Build WHERE conditions
    let whereConditions = [];
    let queryParams = [];

    if (search) {
      whereConditions.push('(s.student_name_en LIKE ? OR s.student_name_kh LIKE ? OR s.phone LIKE ?)');
      queryParams.push(`%${search}%`, `%${search}%`, `%${search}%`);
    }

    if (program_id) {
      whereConditions.push('s.program_id = ?');
      queryParams.push(program_id);
    }

    if (batch_id) {
      whereConditions.push('s.batch_id = ?');
      queryParams.push(batch_id);
    }

    const whereClause = whereConditions.length > 0 ? 'WHERE ' + whereConditions.join(' AND ') : '';

    // Get total count
    const countQuery = `
      SELECT COUNT(*) as total 
      FROM tbl_student s 
      ${whereClause}
    `;
    const [countResult] = await connection.execute(countQuery, queryParams);
    const total = countResult[0].total;

    // Get students with pagination
    const studentsQuery = `
      SELECT s.*, 
             p.name as program_name,
             b.name as batch_name
      FROM tbl_student s
      LEFT JOIN tbl_program p ON s.program_id = p.id
      LEFT JOIN tbl_batch b ON s.batch_id = b.id
      ${whereClause}
      ORDER BY s.id DESC
      LIMIT ? OFFSET ?
    `;
    
    const [students] = await connection.execute(studentsQuery, [...queryParams, parseInt(limit), offset]);

    await connection.end();

    res.status(200).json({
      success: true,
      count: students.length,
      totalPages: Math.ceil(total / limit),
      currentPage: parseInt(page),
      data: students
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get single student
 * @route   GET /api/students/:id
 * @access  Private
 */
exports.getStudent = async (req, res, next) => {
  try {
    const connection = await mysql.createConnection({
      host: process.env.DB_HOST || '127.0.0.1',
      user: process.env.DB_USER || 'root',
      password: process.env.DB_PASSWORD || '',
      database: process.env.DB_NAME || 'sms_spi'
    });

    const studentQuery = `
      SELECT s.*, 
             p.name as program_name,
             b.name as batch_name,
             pa.first_name as parent_first_name,
             pa.last_name as parent_last_name,
             pa.email as parent_email,
             pa.phone as parent_phone
      FROM tbl_student s
      LEFT JOIN tbl_program p ON s.program_id = p.id
      LEFT JOIN tbl_batch b ON s.batch_id = b.id
      LEFT JOIN tbl_parent pa ON s.parent_id = pa.id
      WHERE s.id = ?
    `;
    
    const [student] = await connection.execute(studentQuery, [req.params.id]);

    await connection.end();

    if (!student[0]) {
      return res.status(404).json({
        success: false,
        message: 'Student not found'
      });
    }
    
    res.status(200).json({
      success: true,
      data: student[0]
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Create new student
 * @route   POST /api/students
 * @access  Private
 */
exports.createStudent = async (req, res, next) => {
  try {
    const {
      student_name_en,
      student_name_kh,
      gender,
      dob,
      email,
      phone,
      province,
      district,
      commune,
      village,
      nationality,
      race,
      image,
      main_program_id,
      program_id,
      batch_id,
      enrollment_date,
      parent_id
    } = req.body;
    
    const connection = await mysql.createConnection({
      host: process.env.DB_HOST || '127.0.0.1',
      user: process.env.DB_USER || 'root',
      password: process.env.DB_PASSWORD || '',
      database: process.env.DB_NAME || 'sms_spi'
    });

    // Check if student email already exists
    const emailExistsQuery = `
      SELECT * 
      FROM tbl_student 
      WHERE email = ?
    `;
    const [emailExists] = await connection.execute(emailExistsQuery, [email]);

    if (emailExists[0]) {
      return res.status(400).json({
        success: false,
        message: 'Student with this email already exists'
      });
    }
    
    // Generate student ID card
    const year = new Date(enrollment_date).getFullYear();
    const latestStudentQuery = `
      SELECT * 
      FROM tbl_student 
      WHERE student_id_card LIKE ?
      ORDER BY created_at DESC
      LIMIT 1
    `;
    const [latestStudent] = await connection.execute(latestStudentQuery, [`${year}-%`]);
    
    let sequence = 1;
    if (latestStudent[0]) {
      const parts = latestStudent[0].student_id_card.split('-');
      sequence = parseInt(parts[3]) + 1;
    }
    
    const student_id_card = `${year}-${program_id}-${batch_id}-${sequence.toString().padStart(4, '0')}`;
    
    // Create student
    const studentQuery = `
      INSERT INTO tbl_student 
      (student_name_en, student_name_kh, gender, dob, email, phone, province, district, commune, village, nationality, race, image, main_program_id, program_id, batch_id, enrollment_date, parent_id, student_id_card)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;
    const [student] = await connection.execute(studentQuery, [
      student_name_en,
      student_name_kh,
      gender,
      dob,
      email,
      phone,
      province,
      district,
      commune,
      village,
      nationality,
      race,
      image,
      main_program_id,
      program_id,
      batch_id,
      enrollment_date,
      parent_id,
      student_id_card
    ]);
    
    // Generate password for student user account
    const password = bcrypt.hashSync('password', 10);
    
    // Create user account for student
    const userQuery = `
      INSERT INTO users 
      (username, email, password, role_id, profile_id, profile_type)
      VALUES (?, ?, ?, ?, ?, ?)
    `;
    await connection.execute(userQuery, [
      student_id_card,
      email,
      password,
      3, // Student role
      student[0].insertId,
      'student'
    ]);
    
    await connection.end();

    res.status(201).json({
      success: true,
      data: {
        id: student[0].insertId,
        student_name_en,
        student_name_kh,
        gender,
        dob,
        email,
        phone,
        province,
        district,
        commune,
        village,
        nationality,
        race,
        image,
        main_program_id,
        program_id,
        batch_id,
        enrollment_date,
        parent_id,
        student_id_card
      },
      user: {
        username: student_id_card,
        email: email,
        password: 'password' // Only return plain password on creation
      }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Update student
 * @route   PUT /api/students/:id
 * @access  Private
 */
exports.updateStudent = async (req, res, next) => {
  try {
    const {
      student_name_en,
      student_name_kh,
      gender,
      dob,
      email,
      phone,
      province,
      district,
      commune,
      village,
      nationality,
      race,
      image,
      main_program_id,
      program_id,
      batch_id,
      enrollment_date,
      graduation_date,
      status,
      parent_id
    } = req.body;
    
    const connection = await mysql.createConnection({
      host: process.env.DB_HOST || '127.0.0.1',
      user: process.env.DB_USER || 'root',
      password: process.env.DB_PASSWORD || '',
      database: process.env.DB_NAME || 'sms_spi'
    });

    // Check if student exists
    const studentQuery = `
      SELECT * 
      FROM tbl_student 
      WHERE id = ?
    `;
    const [student] = await connection.execute(studentQuery, [req.params.id]);
    
    if (!student[0]) {
      return res.status(404).json({
        success: false,
        message: 'Student not found'
      });
    }
    
    // Check if email is being changed and if it already exists
    if (email && email !== student[0].email) {
      const emailExistsQuery = `
        SELECT * 
        FROM tbl_student 
        WHERE email = ? AND id != ?
      `;
      const [emailExists] = await connection.execute(emailExistsQuery, [email, req.params.id]);
      
      if (emailExists[0]) {
        return res.status(400).json({
          success: false,
          message: 'Email already in use'
        });
      }
      
      // Update user email if it exists
      const userQuery = `
        UPDATE users 
        SET email = ?
        WHERE profile_id = ? AND profile_type = 'student'
      `;
      await connection.execute(userQuery, [email, req.params.id]);
    }
    
    // Update student
    const updateStudentQuery = `
      UPDATE tbl_student 
      SET 
        student_name_en = ?,
        student_name_kh = ?,
        gender = ?,
        dob = ?,
        email = ?,
        phone = ?,
        province = ?,
        district = ?,
        commune = ?,
        village = ?,
        nationality = ?,
        race = ?,
        image = ?,
        main_program_id = ?,
        program_id = ?,
        batch_id = ?,
        enrollment_date = ?,
        graduation_date = ?,
        status = ?,
        parent_id = ?
      WHERE id = ?
    `;
    await connection.execute(updateStudentQuery, [
      student_name_en || student[0].student_name_en,
      student_name_kh || student[0].student_name_kh,
      gender || student[0].gender,
      dob || student[0].dob,
      email || student[0].email,
      phone || student[0].phone,
      province || student[0].province,
      district || student[0].district,
      commune || student[0].commune,
      village || student[0].village,
      nationality || student[0].nationality,
      race || student[0].race,
      image || student[0].image,
      main_program_id || student[0].main_program_id,
      program_id || student[0].program_id,
      batch_id || student[0].batch_id,
      enrollment_date || student[0].enrollment_date,
      graduation_date || student[0].graduation_date,
      status || student[0].status,
      parent_id || student[0].parent_id,
      req.params.id
    ]);
    
    await connection.end();

    res.status(200).json({
      success: true,
      data: {
        id: req.params.id,
        student_name_en: student_name_en || student[0].student_name_en,
        student_name_kh: student_name_kh || student[0].student_name_kh,
        gender: gender || student[0].gender,
        dob: dob || student[0].dob,
        email: email || student[0].email,
        phone: phone || student[0].phone,
        province: province || student[0].province,
        district: district || student[0].district,
        commune: commune || student[0].commune,
        village: village || student[0].village,
        nationality: nationality || student[0].nationality,
        race: race || student[0].race,
        image: image || student[0].image,
        main_program_id: main_program_id || student[0].main_program_id,
        program_id: program_id || student[0].program_id,
        batch_id: batch_id || student[0].batch_id,
        enrollment_date: enrollment_date || student[0].enrollment_date,
        graduation_date: graduation_date || student[0].graduation_date,
        status: status || student[0].status,
        parent_id: parent_id || student[0].parent_id
      }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Delete student
 * @route   DELETE /api/students/:id
 * @access  Private
 */
exports.deleteStudent = async (req, res, next) => {
  try {
    const connection = await mysql.createConnection({
      host: process.env.DB_HOST || '127.0.0.1',
      user: process.env.DB_USER || 'root',
      password: process.env.DB_PASSWORD || '',
      database: process.env.DB_NAME || 'sms_spi'
    });

    // Find and delete associated user account
    const userQuery = `
      DELETE FROM users 
      WHERE profile_id = ? AND profile_type = 'student'
    `;
    await connection.execute(userQuery, [req.params.id]);
    
    // Delete student
    const deleteStudentQuery = `
      DELETE FROM tbl_student 
      WHERE id = ?
    `;
    await connection.execute(deleteStudentQuery, [req.params.id]);
    
    await connection.end();

    res.status(200).json({
      success: true,
      message: 'Student deleted successfully'
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get students by program
 * @route   GET /api/students/program/:programId
 * @access  Private
 */
exports.getStudentsByProgram = async (req, res, next) => {
  try {
    const { page = 1, limit = 10, status } = req.query;
    const offset = (page - 1) * limit;
    
    const connection = await mysql.createConnection({
      host: process.env.DB_HOST || '127.0.0.1',
      user: process.env.DB_USER || 'root',
      password: process.env.DB_PASSWORD || '',
      database: process.env.DB_NAME || 'sms_spi'
    });

    // Build WHERE conditions
    let whereConditions = [];
    let queryParams = [];

    whereConditions.push('s.program_id = ?');
    queryParams.push(req.params.programId);

    if (status) {
      whereConditions.push('s.status = ?');
      queryParams.push(status);
    }

    const whereClause = whereConditions.length > 0 ? 'WHERE ' + whereConditions.join(' AND ') : '';

    // Get total count
    const countQuery = `
      SELECT COUNT(*) as total 
      FROM tbl_student s 
      ${whereClause}
    `;
    const [countResult] = await connection.execute(countQuery, queryParams);
    const total = countResult[0].total;

    // Get students with pagination
    const studentsQuery = `
      SELECT s.*, 
             p.name as program_name,
             b.name as batch_name
      FROM tbl_student s
      LEFT JOIN tbl_program p ON s.program_id = p.id
      LEFT JOIN tbl_batch b ON s.batch_id = b.id
      ${whereClause}
      ORDER BY s.id DESC
      LIMIT ? OFFSET ?
    `;
    
    const [students] = await connection.execute(studentsQuery, [...queryParams, parseInt(limit), offset]);

    await connection.end();

    res.status(200).json({
      success: true,
      count: total,
      data: students,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        totalPages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get students by parent
 * @route   GET /api/students/parent/:parentId
 * @access  Private
 */
exports.getStudentsByParent = async (req, res, next) => {
  try {
    const connection = await mysql.createConnection({
      host: process.env.DB_HOST || '127.0.0.1',
      user: process.env.DB_USER || 'root',
      password: process.env.DB_PASSWORD || '',
      database: process.env.DB_NAME || 'sms_spi'
    });

    const studentsQuery = `
      SELECT s.*, 
             p.name as program_name,
             b.name as batch_name
      FROM tbl_student s
      LEFT JOIN tbl_program p ON s.program_id = p.id
      LEFT JOIN tbl_batch b ON s.batch_id = b.id
      WHERE s.parent_id = ?
      ORDER BY s.id DESC
    `;
    
    const [students] = await connection.execute(studentsQuery, [req.params.parentId]);

    await connection.end();

    res.status(200).json({
      success: true,
      count: students.length,
      data: students
    });
  } catch (error) {
    next(error);
  }
};
