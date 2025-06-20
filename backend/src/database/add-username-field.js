const mysql = require('mysql2/promise');
const path = require('path');
const dotenv = require('dotenv');

// Load environment variables
dotenv.config({ path: path.join(__dirname, '../../.env') });

/**
 * Migration script to add username field to existing users
 * This adds the username column to tbl_user and populates it with values based on email
 */
async function addUsernameField() {
  console.log('Starting migration to add username field to tbl_user table...');
  
  // Create connection to MySQL server with database specified
  const connection = await mysql.createConnection({
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    port: process.env.DB_PORT || 3306,
    database: process.env.DB_NAME || 'sms_spi'
  });

  try {
    // Check if username column exists
    console.log('Checking if username column exists...');
    const [columns] = await connection.query('SHOW COLUMNS FROM tbl_user LIKE "username"');
    
    if (columns.length === 0) {
      // Add username column if it doesn't exist
      console.log('Adding username column to tbl_user table...');
      await connection.query('ALTER TABLE tbl_user ADD COLUMN username VARCHAR(50) AFTER id');
      
      // Add unique constraint after populating usernames to avoid conflicts
      console.log('Column added. Generating usernames for existing users...');
      
      // Get all users
      const [users] = await connection.query('SELECT id, email FROM tbl_user');
      
      console.log(`Found ${users.length} users that need usernames.`);
      
      // Update each user with a generated username from their email
      for (const user of users) {
        const baseUsername = user.email.split('@')[0].replace(/[^a-zA-Z0-9]/g, ''); // Remove non-alphanumeric characters
        
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
      
      // Now add the unique constraint
      console.log('Adding unique constraint to username column...');
      await connection.query('ALTER TABLE tbl_user ADD UNIQUE INDEX (username)');
    } else {
      console.log('Username column already exists in tbl_user table.');
    }
    
    console.log('Migration completed successfully!');
  } catch (error) {
    console.error('Error during migration:', error);
  } finally {
    // Close the connection
    await connection.end();
  }
}

// Run the migration
addUsernameField();
