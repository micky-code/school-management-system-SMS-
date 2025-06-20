const mysql = require('mysql2/promise');
const fs = require('fs');
const path = require('path');
const dotenv = require('dotenv');

// Load environment variables
dotenv.config({ path: path.join(__dirname, '../../.env') });

async function insertProvincesData() {
  console.log('Inserting provinces data...');
  
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
    // Read SQL insert file
    const insertPath = path.join(__dirname, 'insert-provinces.sql');
    
    // Execute SQL insert file
    console.log('Executing insert-provinces.sql...');
    const insertSQL = fs.readFileSync(insertPath, 'utf8');
    await connection.query(insertSQL);
    
    // Verify data insertion
    console.log('Verifying data insertion...');
    const [rows] = await connection.query('SELECT COUNT(*) as count FROM provinces');
    console.log(`Successfully inserted provinces data. Total records: ${rows[0].count}`);
    
    console.log('Provinces data insertion completed successfully!');
  } catch (error) {
    console.error('Error inserting provinces data:', error);
  } finally {
    // Close the connection
    await connection.end();
  }
}

// Run the insertion
insertProvincesData();
