const mysql = require('mysql2/promise');
const path = require('path');
const dotenv = require('dotenv');

// Load environment variables
dotenv.config({ path: path.join(__dirname, '../../.env') });

/**
 * Script to update or create admin user with proper username
 */
async function updateAdminUser() {
  console.log('Starting admin user update...');
  
  // Create connection to MySQL server with database specified
  const connection = await mysql.createConnection({
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    port: process.env.DB_PORT || 3306,
    database: process.env.DB_NAME || 'sms_db'
  });

  try {
    // Check if admin user exists
    console.log('Checking if admin user exists...');
    const [adminUsers] = await connection.query('SELECT * FROM tbl_user WHERE email = ?', ['admin@sms.com']);
    
    if (adminUsers.length > 0) {
      // Update existing admin user
      console.log('Admin user exists. Updating username...');
      await connection.query(
        'UPDATE tbl_user SET username = ? WHERE email = ?',
        ['admin', 'admin@sms.com']
      );
      console.log('Admin user updated with username: admin');
    } else {
      // Check if roles table exists and has admin role
      console.log('Admin user not found. Checking roles table...');
      const [roles] = await connection.query('SELECT id FROM tbl_role WHERE role = ?', ['admin']);
      
      let adminRoleId = 1;
      if (roles.length > 0) {
        adminRoleId = roles[0].id;
      } else {
        // Create admin role if it doesn't exist
        console.log('Admin role not found. Creating admin role...');
        const [result] = await connection.query(
          'INSERT INTO tbl_role (role, description) VALUES (?, ?)',
          ['admin', 'Administrator with full access to the system']
        );
        adminRoleId = result.insertId;
      }
      
      // Create admin user
      console.log('Creating admin user...');
      await connection.query(
        'INSERT INTO tbl_user (username, name, email, password, role_id, status) VALUES (?, ?, ?, ?, ?, ?)',
        ['admin', 'Admin User', 'admin@sms.com', 'admin123', adminRoleId, '1']
      );
      console.log('Admin user created with username: admin, password: admin123');
    }
    
    // Display all users for verification
    const [users] = await connection.query('SELECT id, username, name, email, role_id FROM tbl_user');
    console.log('Current users in the database:');
    console.table(users);
    
    console.log('Admin user update completed successfully!');
  } catch (error) {
    console.error('Error during admin user update:', error);
  } finally {
    // Close the connection
    await connection.end();
  }
}

// Run the update
updateAdminUser();
