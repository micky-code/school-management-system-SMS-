const mysql = require('mysql2/promise');
const fs = require('fs');
const path = require('path');
const dotenv = require('dotenv');

// Load environment variables
dotenv.config({ path: path.join(__dirname, '../../.env') });

async function setupLoginTables() {
  console.log('Setting up login tables...');
  
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
    const sqlPath = path.join(__dirname, 'login-tables.sql');
    const sql = fs.readFileSync(sqlPath, 'utf8');
    
    // Execute SQL
    console.log('Executing login tables SQL...');
    await connection.query(sql);
    
    // Verify table creation
    console.log('Verifying table creation...');
    const [roleRows] = await connection.query('SELECT COUNT(*) as count FROM tbl_role');
    const [userRows] = await connection.query('SELECT COUNT(*) as count FROM tbl_user');
    
    console.log(`Successfully created tables. Roles: ${roleRows[0].count}, Users: ${userRows[0].count}`);
    console.log('Login tables setup completed successfully!');
  } catch (error) {
    console.error('Error setting up login tables:', error);
  } finally {
    // Close the connection
    await connection.end();
  }
}

// Run the setup
setupLoginTables();
