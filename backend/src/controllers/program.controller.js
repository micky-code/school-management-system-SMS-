const mysql = require('mysql2/promise');

/**
 * @desc    Get all programs
 * @route   GET /api/programs
 * @access  Private
 */
exports.getPrograms = async (req, res) => {
  try {
    const connection = await mysql.createConnection({
      host: process.env.DB_HOST || '127.0.0.1',
      user: process.env.DB_USER || 'root',
      password: process.env.DB_PASSWORD || '',
      database: process.env.DB_NAME || 'sms_spi'
    });

    const [rows] = await connection.execute(
      'SELECT * FROM tbl_program ORDER BY name ASC'
    );

    await connection.end();

    res.status(200).json({
      success: true,
      count: rows.length,
      data: rows
    });
  } catch (error) {
    console.error('Error fetching programs:', error);
    res.status(500).json({
      success: false,
      error: 'Server Error'
    });
  }
};

/**
 * @desc    Get single program
 * @route   GET /api/programs/:id
 * @access  Private
 */
exports.getProgram = async (req, res) => {
  try {
    const connection = await mysql.createConnection({
      host: process.env.DB_HOST || '127.0.0.1',
      user: process.env.DB_USER || 'root',
      password: process.env.DB_PASSWORD || '',
      database: process.env.DB_NAME || 'sms_spi'
    });

    const [rows] = await connection.execute(
      'SELECT * FROM tbl_program WHERE id = ?',
      [req.params.id]
    );

    await connection.end();

    if (rows.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'Program not found'
      });
    }

    res.status(200).json({
      success: true,
      data: rows[0]
    });
  } catch (error) {
    console.error('Error fetching program:', error);
    res.status(500).json({
      success: false,
      error: 'Server Error'
    });
  }
};

/**
 * @desc    Create new program
 * @route   POST /api/programs
 * @access  Private (Admin only)
 */
exports.createProgram = async (req, res) => {
  try {
    const { name, description, duration, degree_level_id } = req.body;

    const connection = await mysql.createConnection({
      host: process.env.DB_HOST || '127.0.0.1',
      user: process.env.DB_USER || 'root',
      password: process.env.DB_PASSWORD || '',
      database: process.env.DB_NAME || 'sms_spi'
    });

    const [result] = await connection.execute(
      'INSERT INTO tbl_program (name, description, duration, degree_level_id) VALUES (?, ?, ?, ?)',
      [name, description, duration, degree_level_id]
    );

    const [rows] = await connection.execute(
      'SELECT * FROM tbl_program WHERE id = ?',
      [result.insertId]
    );

    await connection.end();

    res.status(201).json({
      success: true,
      data: rows[0]
    });
  } catch (error) {
    console.error('Error creating program:', error);
    res.status(500).json({
      success: false,
      error: 'Server Error'
    });
  }
};

/**
 * @desc    Update program
 * @route   PUT /api/programs/:id
 * @access  Private (Admin only)
 */
exports.updateProgram = async (req, res) => {
  try {
    const { name, description, duration, degree_level_id } = req.body;

    const connection = await mysql.createConnection({
      host: process.env.DB_HOST || '127.0.0.1',
      user: process.env.DB_USER || 'root',
      password: process.env.DB_PASSWORD || '',
      database: process.env.DB_NAME || 'sms_spi'
    });

    const [result] = await connection.execute(
      'UPDATE tbl_program SET name = ?, description = ?, duration = ?, degree_level_id = ? WHERE id = ?',
      [name, description, duration, degree_level_id, req.params.id]
    );

    if (result.affectedRows === 0) {
      await connection.end();
      return res.status(404).json({
        success: false,
        error: 'Program not found'
      });
    }

    const [rows] = await connection.execute(
      'SELECT * FROM tbl_program WHERE id = ?',
      [req.params.id]
    );

    await connection.end();

    res.status(200).json({
      success: true,
      data: rows[0]
    });
  } catch (error) {
    console.error('Error updating program:', error);
    res.status(500).json({
      success: false,
      error: 'Server Error'
    });
  }
};

/**
 * @desc    Delete program
 * @route   DELETE /api/programs/:id
 * @access  Private (Admin only)
 */
exports.deleteProgram = async (req, res) => {
  try {
    const connection = await mysql.createConnection({
      host: process.env.DB_HOST || '127.0.0.1',
      user: process.env.DB_USER || 'root',
      password: process.env.DB_PASSWORD || '',
      database: process.env.DB_NAME || 'sms_spi'
    });

    const [result] = await connection.execute(
      'DELETE FROM tbl_program WHERE id = ?',
      [req.params.id]
    );

    await connection.end();

    if (result.affectedRows === 0) {
      return res.status(404).json({
        success: false,
        error: 'Program not found'
      });
    }

    res.status(200).json({
      success: true,
      data: {}
    });
  } catch (error) {
    console.error('Error deleting program:', error);
    res.status(500).json({
      success: false,
      error: 'Server Error'
    });
  }
};
