const { User, Role } = require('./src/models');
const bcrypt = require('bcryptjs');
const { sequelize } = require('./src/config/db.config');

async function debugLogin() {
  try {
    const testUsername = 'srdvp';
    const testPassword = 'password'; // Replace with the password you're using
    
    console.log('Debugging login for username:', testUsername);
    
    // Step 1: Find user by username
    let user = await User.findOne({
      where: { username: testUsername },
      include: [{ model: Role, attributes: ['name'] }]
    });
    
    console.log('User found by username:', user ? 'Yes' : 'No');
    
    // Step 2: If not found, try by name
    if (!user) {
      user = await User.findOne({
        where: { name: testUsername },
        include: [{ model: Role, attributes: ['name'] }]
      });
      console.log('User found by name:', user ? 'Yes' : 'No');
    }
    
    // Step 3: If still not found, try by email
    if (!user) {
      user = await User.findOne({
        where: { email: testUsername },
        include: [{ model: Role, attributes: ['name'] }]
      });
      console.log('User found by email:', user ? 'Yes' : 'No');
    }
    
    // If user not found at all
    if (!user) {
      console.log('User not found with any method');
      return;
    }
    
    // Log user details (excluding password)
    console.log('User details:', {
      id: user.id,
      username: user.username,
      name: user.name,
      email: user.email,
      role: user.tbl_role ? user.tbl_role.name : null,
      status: user.status,
      passwordHash: user.password ? user.password.substring(0, 10) + '...' : null
    });
    
    // Check if account is active
    if (user.status === '0') {
      console.log('User account is inactive');
      return;
    }
    
    // Check password
    console.log('Testing password match...');
    const isMatch = await bcrypt.compare(testPassword, user.password);
    console.log('Password match:', isMatch ? 'Yes' : 'No');
    
    // Generate a test password hash for comparison
    const testHash = await bcrypt.hash(testPassword, 10);
    console.log('Test password hash:', testHash);
    console.log('Stored password hash:', user.password);
    
  } catch (error) {
    console.error('Error debugging login:', error);
  } finally {
    await sequelize.close();
  }
}

debugLogin();
