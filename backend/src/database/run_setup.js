const mysql = require('mysql2/promise');
const fs = require('fs').promises;
const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../../.env') });

async function runSqlScript() {
  try {
    // Create connection
    const connection = await mysql.createConnection({
      host: process.env.DB_HOST || '127.0.0.1',
      user: process.env.DB_USER || 'root',
      password: process.env.DB_PASSWORD || '',
      database: process.env.DB_NAME || 'sms_db',
      multipleStatements: true // Important for running multiple SQL statements
    });

    console.log('Connected to database successfully');

    // Read SQL file
    const sqlFilePath = path.join(__dirname, 'main_program_setup.sql');
    const sqlScript = await fs.readFile(sqlFilePath, 'utf8');

    // Execute SQL script
    console.log('Executing SQL script...');
    await connection.query(sqlScript);
    console.log('SQL script executed successfully');

    // Close connection
    await connection.end();
    console.log('Database connection closed');
  } catch (error) {
    console.error('Error running SQL script:', error);
    process.exit(1);
  }
}

runSqlScript();
