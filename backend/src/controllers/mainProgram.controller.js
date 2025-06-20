const mysql = require('mysql2/promise');

/**
 * @desc    Get all main programs
 * @route   GET /api/main-programs
 * @access  Private
 */
exports.getMainPrograms = async (req, res, next) => {
  try {
    // Get pagination parameters
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 10;
    const offset = (page - 1) * limit;
    const search = req.query.search || '';

    const connection = await mysql.createConnection({
      host: process.env.DB_HOST || '127.0.0.1',
      user: process.env.DB_USER || 'root',
      password: process.env.DB_PASSWORD || '',
      database: process.env.DB_NAME || 'sms_db'
    });

    // Get total count with search
    let countQuery = 'SELECT COUNT(*) as total FROM tbl_main_program';
    let countParams = [];
    
    if (search) {
      countQuery += ' WHERE name LIKE ? OR description LIKE ?';
      countParams = [`%${search}%`, `%${search}%`];
    }
    
    const [countResult] = await connection.execute(countQuery, countParams);
    const totalCount = countResult[0].total;

    // Get paginated main programs with search
    let mainProgramsQuery = `
      SELECT * FROM tbl_main_program
    `;
    
    let queryParams = [];
    
    if (search) {
      mainProgramsQuery += ' WHERE name LIKE ? OR description LIKE ?';
      queryParams = [`%${search}%`, `%${search}%`];
    }
    
    mainProgramsQuery += ' ORDER BY id ASC LIMIT ? OFFSET ?';
    queryParams.push(limit, offset);
    
    const [mainPrograms] = await connection.execute(mainProgramsQuery, queryParams);

    await connection.end();

    res.status(200).json({
      success: true,
      count: totalCount,
      rows: mainPrograms
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
    const connection = await mysql.createConnection({
      host: process.env.DB_HOST || '127.0.0.1',
      user: process.env.DB_USER || 'root',
      password: process.env.DB_PASSWORD || '',
      database: process.env.DB_NAME || 'sms_db'
    });

    const mainProgramQuery = `
      SELECT * FROM tbl_main_program
      WHERE id = ?
    `;
    
    const [mainProgram] = await connection.execute(mainProgramQuery, [req.params.id]);

    await connection.end();

    if (mainProgram.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Main program not found'
      });
    }

    res.status(200).json({
      success: true,
      data: mainProgram[0]
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
    const { name, description } = req.body;

    const connection = await mysql.createConnection({
      host: process.env.DB_HOST || '127.0.0.1',
      user: process.env.DB_USER || 'root',
      password: process.env.DB_PASSWORD || '',
      database: process.env.DB_NAME || 'sms_db'
    });

    // Create main program
    const mainProgramQuery = `
      INSERT INTO tbl_main_program (name, description)
      VALUES (?, ?)
    `;
    
    const [mainProgram] = await connection.execute(mainProgramQuery, [name, description]);

    await connection.end();

    res.status(201).json({
      success: true,
      data: {
        id: mainProgram.insertId,
        name,
        description
      }
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
    const { name, description } = req.body;

    const connection = await mysql.createConnection({
      host: process.env.DB_HOST || '127.0.0.1',
      user: process.env.DB_USER || 'root',
      password: process.env.DB_PASSWORD || '',
      database: process.env.DB_NAME || 'sms_db'
    });

    // Check if main program exists
    const checkQuery = `
      SELECT * FROM tbl_main_program
      WHERE id = ?
    `;
    
    const [mainProgram] = await connection.execute(checkQuery, [req.params.id]);

    if (mainProgram.length === 0) {
      await connection.end();
      return res.status(404).json({
        success: false,
        message: 'Main program not found'
      });
    }

    // Update main program
    const updateQuery = `
      UPDATE tbl_main_program
      SET 
        name = ?,
        description = ?
      WHERE id = ?
    `;
    
    await connection.execute(updateQuery, [
      name || mainProgram[0].name,
      description || mainProgram[0].description,
      req.params.id
    ]);

    await connection.end();

    res.status(200).json({
      success: true,
      data: {
        id: req.params.id,
        name: name || mainProgram[0].name,
        description: description || mainProgram[0].description
      }
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
    const connection = await mysql.createConnection({
      host: process.env.DB_HOST || '127.0.0.1',
      user: process.env.DB_USER || 'root',
      password: process.env.DB_PASSWORD || '',
      database: process.env.DB_NAME || 'sms_db'
    });

    // Check if main program exists
    const checkQuery = `
      SELECT * FROM tbl_main_program
      WHERE id = ?
    `;
    
    const [mainProgram] = await connection.execute(checkQuery, [req.params.id]);

    if (mainProgram.length === 0) {
      await connection.end();
      return res.status(404).json({
        success: false,
        message: 'Main program not found'
      });
    }

    // Delete main program
    const deleteQuery = `
      DELETE FROM tbl_main_program
      WHERE id = ?
    `;
    
    await connection.execute(deleteQuery, [req.params.id]);

    await connection.end();

    res.status(200).json({
      success: true,
      data: {}
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get programs by main program
 * @route   GET /api/main-programs/:id/programs
 * @access  Private
 */
exports.getProgramsByMainProgram = async (req, res, next) => {
  try {
    const connection = await mysql.createConnection({
      host: process.env.DB_HOST || '127.0.0.1',
      user: process.env.DB_USER || 'root',
      password: process.env.DB_PASSWORD || '',
      database: process.env.DB_NAME || 'sms_db'
    });

    // Get programs by main program
    const programsQuery = `
      SELECT * FROM tbl_program
      WHERE main_program_id = ?
      ORDER BY name ASC
    `;
    
    const [programs] = await connection.execute(programsQuery, [req.params.id]);

    await connection.end();

    res.status(200).json({
      success: true,
      count: programs.length,
      data: programs
    });
  } catch (error) {
    next(error);
  }
};
