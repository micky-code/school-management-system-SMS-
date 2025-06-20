const mysql = require('mysql2/promise');
const bcrypt = require('bcryptjs');
require('dotenv').config();

async function checkPassword() {
  try {
    // Create connection
    const connection = await mysql.createConnection({
      host: process.env.DB_HOST || 'localhost',
      user: process.env.DB_USER || 'root',
      password: process.env.DB_PASSWORD || '',
      database: process.env.DB_NAME || 'sms_db'
    });
    
    console.log('Connected to database successfully');
    
    // Get user with password
    const [users] = await connection.execute('SELECT id, username, name, email, password, role_id, status FROM tbl_user WHERE name = ?', ['srdvp']);
    
    if (users.length === 0) {
      console.log('User not found');
      return;
    }
    
    const user = users[0];
    console.log('User found:', {
      id: user.id,
      username: user.username,
      name: user.name,
      email: user.email,
      passwordHash: user.password ? user.password.substring(0, 20) + '...' : null,
      role_id: user.role_id,
      status: user.status
    });
    
    // Test password match
    const testPassword = 'password'; // Replace with the password you're using
    console.log('Testing password:', testPassword);
    
    try {
      const isMatch = await bcrypt.compare(testPassword, user.password);
      console.log('Password match:', isMatch ? 'Yes' : 'No');
    } catch (error) {
      console.error('Error comparing passwords:', error);
      console.log('This might indicate that the stored password is not a valid bcrypt hash');
    }
    
    // Generate a test hash for comparison
    const testHash = await bcrypt.hash(testPassword, 10);
    console.log('Test bcrypt hash:', testHash);
    console.log('Stored password:', user.password);
    
    // Close connection
    await connection.end();
    
  } catch (error) {
    console.error('Error checking password:', error);
  }
}

checkPassword();
