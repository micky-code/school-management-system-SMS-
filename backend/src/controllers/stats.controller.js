const mysql = require('mysql2/promise');

/**
 * @desc    Get dashboard stats
 * @route   GET /api/stats
 * @access  Private
 */
exports.getStats = async (req, res) => {
  try {
    const connection = await mysql.createConnection({
      host: process.env.DB_HOST || '127.0.0.1',
      user: process.env.DB_USER || 'root',
      password: process.env.DB_PASSWORD || '',
      database: process.env.DB_NAME || 'sms_spi'
    });

    // Get total students
    const [totalStudents] = await connection.execute(
      'SELECT COUNT(*) as count FROM tbl_student'
    );

    // Get active students
    const [activeStudents] = await connection.execute(
      'SELECT COUNT(*) as count FROM tbl_student WHERE status = 1'
    );

    // Get total teachers
    const [totalTeachers] = await connection.execute(
      'SELECT COUNT(*) as count FROM tbl_teacher_staff'
    );

    // Get total programs
    const [totalPrograms] = await connection.execute(
      'SELECT COUNT(*) as count FROM tbl_main_program'
    );

    // Get students by program
    const [studentsByProgram] = await connection.execute(`
      SELECT mp.name as program_name, COUNT(s.id) as student_count
      FROM tbl_main_program mp
      LEFT JOIN tbl_student s ON mp.id = s.program_id
      GROUP BY mp.id, mp.name
      ORDER BY student_count DESC
    `);

    // Get recent enrollments (last 30 days)
    const [recentEnrollments] = await connection.execute(`
      SELECT COUNT(*) as count 
      FROM tbl_student 
      WHERE created_at >= DATE_SUB(NOW(), INTERVAL 30 DAY) OR 1=1
    `);

    await connection.end();

    res.status(200).json({
      success: true,
      data: {
        totalStudents: totalStudents[0].count,
        activeStudents: activeStudents[0].count,
        totalTeachers: totalTeachers[0].count,
        totalPrograms: totalPrograms[0].count,
        recentEnrollments: recentEnrollments[0].count,
        studentsByProgram: studentsByProgram
      }
    });
  } catch (error) {
    console.error('Error fetching stats:', error);
    res.status(500).json({
      success: false,
      error: 'Server Error'
    });
  }
};

/**
 * @desc    Get student stats
 * @route   GET /api/stats/students
 * @access  Private
 */
exports.getStudentStats = async (req, res) => {
  try {
    const connection = await mysql.createConnection({
      host: process.env.DB_HOST || '127.0.0.1',
      user: process.env.DB_USER || 'root',
      password: process.env.DB_PASSWORD || '',
      database: process.env.DB_NAME || 'sms_spi'
    });

    // Get total students
    const [totalStudents] = await connection.execute(
      'SELECT COUNT(*) as count FROM tbl_student'
    );

    // Get active students
    const [activeStudents] = await connection.execute(
      'SELECT COUNT(*) as count FROM tbl_student WHERE status = 1'
    );

    // Get graduated students
    const [graduatedStudents] = await connection.execute(
      'SELECT COUNT(*) as count FROM tbl_student WHERE status = 2'
    );

    // Get new students this month
    const [newStudents] = await connection.execute(`
      SELECT COUNT(*) as count 
      FROM tbl_student 
      WHERE MONTH(created_at) = MONTH(CURRENT_DATE()) 
      AND YEAR(created_at) = YEAR(CURRENT_DATE())
    `);

    await connection.end();

    res.status(200).json({
      success: true,
      data: {
        total: totalStudents[0].count,
        active: activeStudents[0].count,
        graduated: graduatedStudents[0].count,
        newThisMonth: newStudents[0].count
      }
    });
  } catch (error) {
    console.error('Error fetching student stats:', error);
    res.status(500).json({
      success: false,
      error: 'Server Error'
    });
  }
};
