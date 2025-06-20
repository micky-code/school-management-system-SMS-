const mysql = require('mysql2/promise');

async function checkTableStructure() {
  try {
    console.log('Connecting to database...');
    const connection = await mysql.createConnection({
      host: 'localhost',
      user: 'root',
      password: '',
      database: 'sms_db'
    });
    
    console.log('Connected to database successfully');
    
    // Check tbl_role structure
    try {
      const [roleColumns] = await connection.execute('DESCRIBE tbl_role');
      console.log('tbl_role columns:', roleColumns.map(col => col.Field));
    } catch (error) {
      console.error('Error checking tbl_role:', error.message);
    }
    
    // Check tbl_user structure
    try {
      const [userColumns] = await connection.execute('DESCRIBE tbl_user');
      console.log('tbl_user columns:', userColumns.map(col => col.Field));
    } catch (error) {
      console.error('Error checking tbl_user:', error.message);
    }
    
    // List all tables
    const [tables] = await connection.execute('SHOW TABLES');
    console.log('All tables in database:', tables.map(t => Object.values(t)[0]));
    
    await connection.end();
    console.log('Database connection closed');
    
  } catch (error) {
    console.error('Error checking table structure:', error);
  }
}

checkTableStructure();
