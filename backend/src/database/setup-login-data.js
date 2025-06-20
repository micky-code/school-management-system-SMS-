const mysql = require('mysql2/promise');
const fs = require('fs');
const path = require('path');
const dotenv = require('dotenv');

// Load environment variables
dotenv.config({ path: path.join(__dirname, '../../.env') });

async function setupLoginData() {
  console.log('Setting up login data...');
  
  // Create connection to MySQL server with database specified
  const connection = await mysql.createConnection({
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    port: process.env.DB_PORT || 3306,
    database: process.env.DB_NAME || 'sms_spi',
    multipleStatements: true // Allow multiple SQL statements in one query
  });

  try {
    // Read SQL file
    const sqlPath = path.join(__dirname, 'insert-login-data.sql');
    const sql = fs.readFileSync(sqlPath, 'utf8');
    
    // Execute SQL
    console.log('Executing login data SQL...');
    await connection.query(sql);
    
    // Verify data insertion
    console.log('Verifying data insertion...');
    const [roleRows] = await connection.query('SELECT COUNT(*) as count FROM tbl_role');
    const [userRows] = await connection.query('SELECT COUNT(*) as count FROM tbl_user');
    
    console.log(`Roles in database: ${roleRows[0].count}, Users in database: ${userRows[0].count}`);
    console.log('Login data setup completed successfully!');
  } catch (error) {
    console.error('Error setting up login data:', error);
  } finally {
    // Close the connection
    await connection.end();
  }
}

// Run the setup
setupLoginData();
