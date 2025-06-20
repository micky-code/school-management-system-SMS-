const mysql = require('mysql2/promise');
const fs = require('fs');
const path = require('path');
const dotenv = require('dotenv');

// Load environment variables
dotenv.config({ path: path.join(__dirname, '../../.env') });

async function setupDatabase() {
  console.log('Setting up database...');
  
  // Create connection to MySQL server (without specifying a database)
  const connection = await mysql.createConnection({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    port: process.env.DB_PORT,
    multipleStatements: true // Allow multiple SQL statements in one query
  });

  try {
    // Create database if it doesn't exist
    console.log(`Creating database ${process.env.DB_NAME} if it doesn't exist...`);
    await connection.query(`CREATE DATABASE IF NOT EXISTS ${process.env.DB_NAME}`);
    
    // Use the database
    console.log(`Using database ${process.env.DB_NAME}...`);
    await connection.query(`USE ${process.env.DB_NAME}`);
    
    // Read SQL schema file
    const schemaPath = path.join(__dirname, 'schema.sql');
    const schema = fs.readFileSync(schemaPath, 'utf8');
    
    // Execute SQL schema
    console.log('Executing database schema...');
    await connection.query(schema);
    
    console.log('Database setup completed successfully!');
  } catch (error) {
    console.error('Error setting up database:', error);
  } finally {
    // Close the connection
    await connection.end();
  }
}

// Run the setup
setupDatabase();
