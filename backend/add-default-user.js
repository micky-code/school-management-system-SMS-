const mysql = require('mysql2/promise');

async function addDefaultUser() {
  try {
    console.log('Connecting to database...');
    const connection = await mysql.createConnection({
      host: 'localhost',
      user: 'root',
      password: '',
      database: 'sms_db'
    });
    
    console.log('Connected to database successfully');
    
    // First check if tbl_role exists and has admin role
    const [roles] = await connection.execute('SELECT * FROM tbl_role WHERE name = ?', ['admin']);
    
    let adminRoleId = 1; // Default admin role ID
    
    if (roles.length === 0) {
      console.log('Admin role not found, creating roles...');
      // Create roles if they don't exist
      await connection.execute(`
        INSERT INTO tbl_role (name) VALUES 
        ('admin'),
        ('teacher'),
        ('student'),
        ('parent')
      `);
      console.log('Roles created successfully');
    } else {
      adminRoleId = roles[0].id;
      console.log('Admin role found with ID:', adminRoleId);
    }
    
    // Check if the admin user already exists
    const [existingUsers] = await connection.execute('SELECT * FROM tbl_user WHERE email = ?', ['admin@sms.com']);
    
    if (existingUsers.length > 0) {
      console.log('Admin user already exists');
    } else {
      // Add default admin user
      console.log('Creating default admin user...');
      await connection.execute(`
        INSERT INTO tbl_user (name, email, password, role_id, status) 
        VALUES (?, ?, ?, ?, ?)
      `, ['Admin User', 'admin@sms.com', 'admin123', adminRoleId, '1']);
      console.log('Default admin user created successfully');
    }
    
    // Add srdvp user if it doesn't exist
    const [existingSrdvp] = await connection.execute('SELECT * FROM tbl_user WHERE name = ?', ['srdvp']);
    
    if (existingSrdvp.length > 0) {
      console.log('srdvp user already exists');
    } else {
      console.log('Creating srdvp user...');
      await connection.execute(`
        INSERT INTO tbl_user (name, email, password, role_id, status) 
        VALUES (?, ?, ?, ?, ?)
      `, ['srdvp', 'srdvp@gmail.com', '4747', adminRoleId, '1']);
      console.log('srdvp user created successfully');
    }
    
    // Verify users in the database
    const [users] = await connection.execute('SELECT id, name, email, password, role_id FROM tbl_user');
    console.log('Users in the database:');
    users.forEach(user => {
      console.log({
        id: user.id,
        name: user.name,
        email: user.email,
        password: user.password ? '******' : null,
        role_id: user.role_id
      });
    });
    
    await connection.end();
    console.log('Database connection closed');
    
  } catch (error) {
    console.error('Error adding default user:', error);
  }
}

addDefaultUser();
