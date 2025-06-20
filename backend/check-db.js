const mysql = require('mysql2/promise');
require('dotenv').config();

async function checkDatabase() {
  try {
    // Create connection
    const connection = await mysql.createConnection({
      host: process.env.DB_HOST || 'localhost',
      user: process.env.DB_USER || 'root',
      password: process.env.DB_PASSWORD || '',
      database: process.env.DB_NAME || 'sms_db'
    });
    
    console.log('Connected to database successfully');
    
    // Check tbl_user structure
    const [tableStructure] = await connection.execute('DESCRIBE tbl_user');
    console.log('\nTable structure for tbl_user:');
    console.log(tableStructure);
    
    // Check users in the database
    const [users] = await connection.execute('SELECT id, name, email, role_id FROM tbl_user');
    console.log('\nUsers in the database:');
    console.log(users);
    
    // Close connection
    await connection.end();
    
  } catch (error) {
    console.error('Error checking database:', error);
  }
}

checkDatabase();
