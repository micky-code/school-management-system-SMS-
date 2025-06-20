const mysql = require('mysql2/promise');
const fs = require('fs');
const path = require('path');

async function runSqlFile() {
  try {
    console.log('Running main_program_setup.sql...');
    
    // Read SQL file
    const sqlFilePath = path.join(__dirname, 'main_program_setup.sql');
    const sqlContent = fs.readFileSync(sqlFilePath, 'utf8');
    
    // Create connection
    const connection = await mysql.createConnection({
      host: process.env.DB_HOST || '127.0.0.1',
      user: process.env.DB_USER || 'root',
      password: process.env.DB_PASSWORD || '',
      database: process.env.DB_NAME || 'sms_db',
      multipleStatements: true // Important for running multiple SQL statements
    });
    
    console.log('Connected to database. Running SQL script...');
    
    // Execute SQL
    await connection.query(sqlContent);
    
    console.log('SQL script executed successfully!');
    
    // Close connection
    await connection.end();
    
    console.log('Database connection closed.');
  } catch (error) {
    console.error('Error running SQL file:', error);
  }
}

runSqlFile();
