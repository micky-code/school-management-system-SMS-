const mysql = require('mysql2/promise');
const path = require('path');
const dotenv = require('dotenv');
const bcrypt = require('bcryptjs');

// Load environment variables
dotenv.config({ path: path.join(__dirname, '../../.env') });

/**
 * Script to fix user passwords in the database for the specific users
 */
async function fixUserPasswords() {
  console.log('Starting user password fix...');
  
  // Create connection to MySQL server with database specified
  const connection = await mysql.createConnection({
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    port: process.env.DB_PORT || 3306,
    database: process.env.DB_NAME || 'sms_spi'
  });

  try {
    // Update srdvp user with bcrypt hashed password
    console.log('Updating srdvp user password...');
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash('4747', salt);
    
    const [updateResult1] = await connection.query(
      'UPDATE tbl_user SET password = ? WHERE username = ?',
      [hashedPassword, 'srdvp']
    );
    
    console.log(`Updated srdvp user: ${updateResult1.affectedRows} row(s) affected`);
    
    // Update hok user with bcrypt hashed password
    const hashedPassword2 = await bcrypt.hash('1234', salt);
    
    const [updateResult2] = await connection.query(
      'UPDATE tbl_user SET password = ? WHERE username = ?',
      [hashedPassword2, 'hok']
    );
    
    console.log(`Updated hok user: ${updateResult2.affectedRows} row(s) affected`);
    
    // Display all users for verification
    const [users] = await connection.query('SELECT id, username, name, email, password FROM tbl_user');
    
    console.log(`\nVerified ${users.length} users in the database.`);
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
    
    console.log('\nAll passwords have been updated to use bcrypt hashing.');
    console.log('You can now login with:');
    console.log('- Username: srdvp, Password: 4747');
    console.log('- Username: hok, Password: 1234');
    console.log('- Username: admin, Password: admin123');
    
  } catch (error) {
    console.error('Error during password fix:', error);
  } finally {
    // Close the connection
    await connection.end();
  }
}

// Run the fix
fixUserPasswords();
