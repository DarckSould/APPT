require('dotenv').config();
const mongoose = require('mongoose');

const User = require('./src/models/User');
const { ROLES } = require('./src/config/roles');
const { USER_STATUS } = require('./src/config/userStatus');

const createFirstAdmin = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);

    const exists = await User.findOne({ role: ROLES.ADMIN });
    if (exists) {
      console.log('Ya existe un administrador. Script cancelado.');
      await mongoose.disconnect();
      process.exit(0);
    }

    const admin = await User.create({
      name: 'Super Admin',
      email: 'admin@system.com'.toLowerCase().trim(),
      password: 'AdminCampus2024!',
      phone: '000000000',
      location: 'Sistema',
      role: ROLES.ADMIN,
      status: USER_STATUS.ACTIVE,
    });

    console.log('Administrador creado correctamente:', admin.email);

    await mongoose.disconnect();
    process.exit(0);
  } catch (error) {
    console.error('Error creando administrador:', error);
    await mongoose.disconnect();
    process.exit(1);
  }
};

createFirstAdmin();
