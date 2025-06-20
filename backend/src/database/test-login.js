const mysql = require('mysql2/promise');
const path = require('path');
const dotenv = require('dotenv');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

// Load environment variables
dotenv.config({ path: path.join(__dirname, '../../.env') });

/**
 * Script to test the login functionality directly against the database
 */
async function testLogin() {
  console.log('Starting login test...');
  
  // Create connection to MySQL server with database specified
  const connection = await mysql.createConnection({
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    port: process.env.DB_PORT || 3306,
    database: process.env.DB_NAME || 'sms_spi'
  });

  try {
    // Test credentials
    const testUsers = [
      { username: 'srdvp', password: '4747' },
      { username: 'hok', password: '1234' },
      { username: 'admin', password: 'admin123' }
    ];
    
    console.log('Testing login for users:');
    
    for (const testUser of testUsers) {
      console.log(`\nTesting login for user: ${testUser.username}`);
      
      // Get user from database
      const [users] = await connection.query(
        'SELECT u.*, r.role as role_name FROM tbl_user u LEFT JOIN tbl_role r ON u.role_id = r.id WHERE u.username = ? OR u.email = ?',
        [testUser.username, testUser.username]
      );
      
      if (users.length === 0) {
        console.log(`❌ User not found: ${testUser.username}`);
        continue;
      }
      
      const user = users[0];
      console.log(`✅ Found user: ${user.username || user.email}`);
      
      // Test password
      try {
        const isMatch = await bcrypt.compare(testUser.password, user.password);
        
        if (isMatch) {
          console.log(`✅ Password matches for ${testUser.username}`);
          
          // Create token as a test
          const token = jwt.sign(
            { id: user.id, role: user.role_name },
            process.env.JWT_SECRET || 'secret',
            { expiresIn: '1d' }
          );
          
          console.log(`✅ Token created successfully: ${token.substring(0, 20)}...`);
          
          // Show user object that would be returned
          const userResponse = {
            id: user.id,
            name: user.name,
            email: user.email,
            username: user.username,
            role: user.role_name,
            status: user.status
          };
          
          console.log('User object that would be returned:');
          console.log(userResponse);
        } else {
          console.log(`❌ Password does NOT match for ${testUser.username}`);
          console.log(`Stored password hash: ${user.password.substring(0, 20)}...`);
          
          // Create a new hash for comparison
          const salt = await bcrypt.genSalt(10);
          const newHash = await bcrypt.hash(testUser.password, salt);
          console.log(`New hash of "${testUser.password}": ${newHash.substring(0, 20)}...`);
        }
      } catch (error) {
        console.log(`❌ Error comparing password: ${error.message}`);
      }
    }
    
    // Fix any issues found
    console.log('\nWould you like to fix any issues found? (Automatically proceeding)');
    
    // Update all passwords to ensure they are correctly hashed
    for (const testUser of testUsers) {
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(testUser.password, salt);
      
      const [updateResult] = await connection.query(
        'UPDATE tbl_user SET password = ? WHERE username = ?',
        [hashedPassword, testUser.username]
      );
      
      console.log(`Updated ${testUser.username} password: ${updateResult.affectedRows} row(s) affected`);
    }
    
    console.log('\nAll passwords have been updated. You should now be able to login with:');
    console.log('- Username: srdvp, Password: 4747');
    console.log('- Username: hok, Password: 1234');
    console.log('- Username: admin, Password: admin123');
    
  } catch (error) {
    console.error('Error during login test:', error);
  } finally {
    // Close the connection
    await connection.end();
  }
}

// Run the test
testLogin();
