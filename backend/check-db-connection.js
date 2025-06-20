const mysql = require('mysql2/promise');

async function checkConnection() {
  try {
    console.log('Attempting to connect to database...');
    
    // Try different database names
    const dbNames = ['sms_db', 'sms', 'student_management_system'];
    
    for (const dbName of dbNames) {
      try {
        console.log(`Trying to connect to database: ${dbName}`);
        const connection = await mysql.createConnection({
          host: 'localhost',
          user: 'root',
          password: '',
          database: dbName
        });
        
        console.log(`Successfully connected to database: ${dbName}`);
        
        // Check if tbl_user exists
        const [tables] = await connection.execute('SHOW TABLES LIKE "tbl_user"');
        if (tables.length > 0) {
          console.log('tbl_user table exists');
          
          // Check user table structure
          const [columns] = await connection.execute('DESCRIBE tbl_user');
          console.log('tbl_user columns:', columns.map(col => col.Field));
          
          // Check users in the database
          const [users] = await connection.execute('SELECT id, name, email, password FROM tbl_user LIMIT 5');
          console.log(`Found ${users.length} users in the database`);
          if (users.length > 0) {
            console.log('Sample user (password masked):', {
              id: users[0].id,
              name: users[0].name,
              email: users[0].email,
              password: users[0].password ? '******' : null
            });
          }
        } else {
          console.log('tbl_user table does not exist in this database');
        }
        
        await connection.end();
        return;
      } catch (err) {
        console.log(`Failed to connect to ${dbName}:`, err.message);
      }
    }
    
    console.log('Could not connect to any database');
    
  } catch (error) {
    console.error('Error checking database connection:', error);
  }
}

checkConnection();
