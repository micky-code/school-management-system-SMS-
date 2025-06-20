const mysql = require('mysql2/promise');
const path = require('path');
const dotenv = require('dotenv');

// Load environment variables
dotenv.config({ path: path.join(__dirname, '../../.env') });

/**
 * Migrates existing users to add username field
 * This script generates usernames from emails for existing users (if they don't have a username)
 */
async function migrateToUsername() {
  console.log('Starting migration to add usernames for existing users...');
  
  // Create connection to MySQL server with database specified
  const connection = await mysql.createConnection({
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    port: process.env.DB_PORT || 3306,
    database: process.env.DB_NAME || 'sms_spi',
    multipleStatements: true
  });

  try {
    // Check if username column exists
    const [columns] = await connection.query('SHOW COLUMNS FROM tbl_user LIKE "username"');
    
    if (columns.length === 0) {
      // Add username column if it doesn't exist
      console.log('Adding username column to tbl_user table...');
      await connection.query('ALTER TABLE tbl_user ADD COLUMN username VARCHAR(50) UNIQUE AFTER id');
    }

    // Get all users who don't have a username
    const [users] = await connection.query('SELECT id, email FROM tbl_user WHERE username IS NULL OR username = ""');
    
    console.log(`Found ${users.length} users without a username. Generating usernames...`);
    
    // Update each user with a generated username from their email
    for (const user of users) {
      const username = user.email.split('@')[0]; // Get part before @
      const baseUsername = username.replace(/[^a-zA-Z0-9]/g, ''); // Remove non-alphanumeric characters
      
      // Check if username is already taken
      let finalUsername = baseUsername;
      let counter = 1;
      let isUnique = false;
      
      while (!isUnique) {
        const [existingUser] = await connection.query('SELECT id FROM tbl_user WHERE username = ?', [finalUsername]);
        
        if (existingUser.length === 0) {
          isUnique = true;
        } else {
          finalUsername = `${baseUsername}${counter}`;
          counter++;
        }
      }
      
      // Update the user with the generated username
      await connection.query('UPDATE tbl_user SET username = ? WHERE id = ?', [finalUsername, user.id]);
      console.log(`User ID ${user.id}: Generated username "${finalUsername}" from email ${user.email}`);
    }
    
    console.log('Migration completed successfully!');
  } catch (error) {
    console.error('Error during migration:', error);
  } finally {
    await connection.end();
  }
}

// Run the migration
migrateToUsername();
