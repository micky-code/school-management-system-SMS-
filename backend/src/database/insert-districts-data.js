const mysql = require('mysql2/promise');
const fs = require('fs');
const path = require('path');
const dotenv = require('dotenv');

// Load environment variables
dotenv.config({ path: path.join(__dirname, '../../.env') });

async function insertDistrictsData() {
  console.log('Inserting districts data...');
  
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
    // Read SQL insert files
    const insertPath1 = path.join(__dirname, 'insert-districts.sql');
    const insertPath2 = path.join(__dirname, 'insert-districts-part2.sql');
    
    // Execute first SQL insert file
    console.log('Executing insert-districts.sql...');
    const insertSQL1 = fs.readFileSync(insertPath1, 'utf8');
    await connection.query(insertSQL1);
    
    // Execute second SQL insert file
    console.log('Executing insert-districts-part2.sql...');
    const insertSQL2 = fs.readFileSync(insertPath2, 'utf8');
    await connection.query(insertSQL2);
    
    // Verify data insertion
    console.log('Verifying data insertion...');
    const [rows] = await connection.query('SELECT COUNT(*) as count FROM districts');
    console.log(`Successfully inserted districts data. Total records: ${rows[0].count}`);
    
    console.log('Districts data insertion completed successfully!');
  } catch (error) {
    console.error('Error inserting districts data:', error);
  } finally {
    // Close the connection
    await connection.end();
  }
}

// Run the insertion
insertDistrictsData();
