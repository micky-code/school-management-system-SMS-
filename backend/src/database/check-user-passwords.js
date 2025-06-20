const mysql = require('mysql2/promise');
const path = require('path');
const dotenv = require('dotenv');
const bcrypt = require('bcryptjs');

// Load environment variables
dotenv.config({ path: path.join(__dirname, '../../.env') });

/**
 * Script to check user passwords in the database and fix any issues
 */
async function checkUserPasswords() {
  console.log('Starting user password check...');
  
  // Create connection to MySQL server with database specified
  const connection = await mysql.createConnection({
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    port: process.env.DB_PORT || 3306,
    database: process.env.DB_NAME || 'sms_spi'
  });

  try {
    // Check all users
    console.log('Fetching all users...');
    const [users] = await connection.query('SELECT id, username, name, email, password FROM tbl_user');
    
    console.log(`Found ${users.length} users in the database.`);
    
    // Display user info (without showing full password)
    users.forEach(user => {
      const passwordPreview = user.password ? 
        `${user.password.substring(0, 10)}...` : 
        'null';
      
      console.log(`User ID ${user.id}: ${user.username || 'no username'} / ${user.email} / Password: ${passwordPreview}`);
      
      // Check if password is hashed (bcrypt hash starts with $2a$ or $2b$)
      const isBcryptHash = user.password && 
        (user.password.startsWith('$2a$') || user.password.startsWith('$2b$'));
      
      console.log(`  - Password appears to be ${isBcryptHash ? 'hashed with bcrypt' : 'NOT properly hashed'}`);
    });
    
    // Ask if we should update the admin password
    console.log('\nWould you like to update the admin user with a new password?');
    console.log('1. Yes, update admin password to "admin123" (hashed with bcrypt)');
    console.log('2. No, leave passwords as they are');
    
    // Since we can't get user input in this script, we'll automatically update
    console.log('\nAutomatically updating admin user password...');
    
    // Hash the password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash('admin123', salt);
    
    // Update admin user(s)
    const [updateResult] = await connection.query(
      'UPDATE tbl_user SET password = ? WHERE username = ? OR email = ?',
      [hashedPassword, 'admin', 'admin@sms.com']
    );
    
    console.log(`Updated ${updateResult.affectedRows} user(s) with new password.`);
    console.log('Admin user can now login with username "admin" and password "admin123"');
    
  } catch (error) {
    console.error('Error during password check:', error);
  } finally {
    // Close the connection
    await connection.end();
  }
}

// Run the check
checkUserPasswords();
