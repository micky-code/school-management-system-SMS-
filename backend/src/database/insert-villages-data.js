const mysql = require('mysql2/promise');
const fs = require('fs');
const path = require('path');
const dotenv = require('dotenv');

// Load environment variables
dotenv.config({ path: path.join(__dirname, '../../.env') });

async function insertVillagesData() {
  console.log('Inserting villages data...');
  
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
    const insertPath1 = path.join(__dirname, 'insert-villages.sql');
    const insertPath2 = path.join(__dirname, 'insert-villages-part2.sql');
    const insertPath3 = path.join(__dirname, 'insert-villages-part3.sql');
    
    // Execute first SQL insert file
    console.log('Executing insert-villages.sql...');
    const insertSQL1 = fs.readFileSync(insertPath1, 'utf8');
    await connection.query(insertSQL1);
    
    // Execute second SQL insert file
    console.log('Executing insert-villages-part2.sql...');
    const insertSQL2 = fs.readFileSync(insertPath2, 'utf8');
    await connection.query(insertSQL2);
    
    // Execute third SQL insert file
    console.log('Executing insert-villages-part3.sql...');
    const insertSQL3 = fs.readFileSync(insertPath3, 'utf8');
    await connection.query(insertSQL3);
    
    // Verify data insertion
    console.log('Verifying data insertion...');
    const [rows] = await connection.query('SELECT COUNT(*) as count FROM villages');
    console.log(`Successfully inserted villages data. Total records: ${rows[0].count}`);
    
    console.log('Villages data insertion completed successfully!');
  } catch (error) {
    console.error('Error inserting villages data:', error);
  } finally {
    // Close the connection
    await connection.end();
  }
}

// Run the insertion
insertVillagesData();
