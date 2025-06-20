const { User, Role } = require('./src/models');
const { sequelize } = require('./src/config/db.config');

async function checkUser() {
  try {
    // Find user by name
    const userByName = await User.findOne({
      where: { name: 'srdvp' },
      include: [{ model: Role, attributes: ['name'] }]
    });
    
    console.log('User found by name:', userByName ? 'Yes' : 'No');
    if (userByName) {
      console.log('User details:', {
        id: userByName.id,
        name: userByName.name,
        email: userByName.email,
        role: userByName.tbl_role ? userByName.tbl_role.name : null
      });
    }
    
    // List all users
    const allUsers = await User.findAll({
      attributes: ['id', 'name', 'email'],
      include: [{ model: Role, attributes: ['name'] }]
    });
    
    console.log('\nAll users in database:');
    allUsers.forEach(user => {
      console.log({
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.tbl_role ? user.tbl_role.name : null
      });
    });
    
  } catch (error) {
    console.error('Error checking user:', error);
  } finally {
    await sequelize.close();
  }
}

checkUser();
