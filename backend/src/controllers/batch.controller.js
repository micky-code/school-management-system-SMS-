const mysql = require('mysql2/promise');

/**
 * @desc    Get all batches
 * @route   GET /api/batches
 * @access  Private
 */
exports.getBatches = async (req, res) => {
  try {
    const connection = await mysql.createConnection({
      host: process.env.DB_HOST || '127.0.0.1',
      user: process.env.DB_USER || 'root',
      password: process.env.DB_PASSWORD || '',
      database: process.env.DB_NAME || 'sms_db'
    });

    const [rows] = await connection.execute(
      'SELECT * FROM tbl_batch ORDER BY name ASC'
    );

    await connection.end();

    res.status(200).json({
      success: true,
      count: rows.length,
      data: rows
    });
  } catch (error) {
    console.error('Error fetching batches:', error);
    res.status(500).json({
      success: false,
      error: 'Server Error'
    });
  }
};

/**
 * @desc    Get single batch
 * @route   GET /api/batches/:id
 * @access  Private
 */
exports.getBatch = async (req, res) => {
  try {
    const connection = await mysql.createConnection({
      host: process.env.DB_HOST || '127.0.0.1',
      user: process.env.DB_USER || 'root',
      password: process.env.DB_PASSWORD || '',
      database: process.env.DB_NAME || 'sms_db'
    });

    const [rows] = await connection.execute(
      'SELECT * FROM tbl_batch WHERE id = ?',
      [req.params.id]
    );

    await connection.end();

    if (rows.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'Batch not found'
      });
    }

    res.status(200).json({
      success: true,
      data: rows[0]
    });
  } catch (error) {
    console.error('Error fetching batch:', error);
    res.status(500).json({
      success: false,
      error: 'Server Error'
    });
  }
};

/**
 * @desc    Create new batch
 * @route   POST /api/batches
 * @access  Private (Admin only)
 */
exports.createBatch = async (req, res) => {
  try {
    const { name, start_date, end_date, program_id } = req.body;

    const connection = await mysql.createConnection({
      host: process.env.DB_HOST || '127.0.0.1',
      user: process.env.DB_USER || 'root',
      password: process.env.DB_PASSWORD || '',
      database: process.env.DB_NAME || 'sms_db'
    });

    const [result] = await connection.execute(
      'INSERT INTO tbl_batch (name, start_date, end_date, program_id) VALUES (?, ?, ?, ?)',
      [name, start_date, end_date, program_id]
    );

    const [rows] = await connection.execute(
      'SELECT * FROM tbl_batch WHERE id = ?',
      [result.insertId]
    );

    await connection.end();

    res.status(201).json({
      success: true,
      data: rows[0]
    });
  } catch (error) {
    console.error('Error creating batch:', error);
    res.status(500).json({
      success: false,
      error: 'Server Error'
    });
  }
};

/**
 * @desc    Update batch
 * @route   PUT /api/batches/:id
 * @access  Private (Admin only)
 */
exports.updateBatch = async (req, res) => {
  try {
    const { name, start_date, end_date, program_id } = req.body;

    const connection = await mysql.createConnection({
      host: process.env.DB_HOST || '127.0.0.1',
      user: process.env.DB_USER || 'root',
      password: process.env.DB_PASSWORD || '',
      database: process.env.DB_NAME || 'sms_db'
    });

    const [result] = await connection.execute(
      'UPDATE tbl_batch SET name = ?, start_date = ?, end_date = ?, program_id = ? WHERE id = ?',
      [name, start_date, end_date, program_id, req.params.id]
    );

    if (result.affectedRows === 0) {
      await connection.end();
      return res.status(404).json({
        success: false,
        error: 'Batch not found'
      });
    }

    const [rows] = await connection.execute(
      'SELECT * FROM tbl_batch WHERE id = ?',
      [req.params.id]
    );

    await connection.end();

    res.status(200).json({
      success: true,
      data: rows[0]
    });
  } catch (error) {
    console.error('Error updating batch:', error);
    res.status(500).json({
      success: false,
      error: 'Server Error'
    });
  }
};

/**
 * @desc    Delete batch
 * @route   DELETE /api/batches/:id
 * @access  Private (Admin only)
 */
exports.deleteBatch = async (req, res) => {
  try {
    const connection = await mysql.createConnection({
      host: process.env.DB_HOST || '127.0.0.1',
      user: process.env.DB_USER || 'root',
      password: process.env.DB_PASSWORD || '',
      database: process.env.DB_NAME || 'sms_db'
    });

    const [result] = await connection.execute(
      'DELETE FROM tbl_batch WHERE id = ?',
      [req.params.id]
    );

    await connection.end();

    if (result.affectedRows === 0) {
      return res.status(404).json({
        success: false,
        error: 'Batch not found'
      });
    }

    res.status(200).json({
      success: true,
      data: {}
    });
  } catch (error) {
    console.error('Error deleting batch:', error);
    res.status(500).json({
      success: false,
      error: 'Server Error'
    });
  }
};
