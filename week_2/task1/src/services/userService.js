const userModel = require('../models/userModel');
const bcrypt = require('bcryptjs');

const registerUser = async (user) => {
  return new Promise((resolve, reject) => {
    userModel.getUserByEmail(user.email, async (err, existingUser) => {
      if (err) return reject(err);
      if (existingUser) return reject({ status: 409, message: 'Email already in use' });
      const hashedPassword = await bcrypt.hash(user.password, 10);
      userModel.createUser({ ...user, password: hashedPassword }, (err, newUser) => {
        if (err) return reject(err);
        resolve(newUser);
      });
    });
  });
};

const getUserById = (id) => {
  return new Promise((resolve, reject) => {
    userModel.getUserById(id, (err, user) => {
      if (err) return reject(err);
      if (!user) return reject({ status: 404, message: 'User not found' });
      resolve(user);
    });
  });
};

const updateUser = async (id, user) => {
  return new Promise((resolve, reject) => {
    userModel.getUserById(id, async (err, existingUser) => {
      if (err) return reject(err);
      if (!existingUser) return reject({ status: 404, message: 'User not found' });

      // Merge fields: use new value if provided, else keep existing
      const name = user.name !== undefined ? user.name : existingUser.name;
      const email = user.email !== undefined ? user.email : existingUser.email;
      const password = user.password
        ? await bcrypt.hash(user.password, 10)
        : existingUser.password;

      userModel.updateUser(id, { name, email, password }, (err, changes) => {
        if (err) return reject(err);
        if (!changes) return reject({ status: 404, message: 'User not found' });
        resolve();
      });
    });
  });
};

const deleteUser = (id) => {
  return new Promise((resolve, reject) => {
    userModel.deleteUser(id, (err, changes) => {
      if (err) return reject(err);
      if (!changes) return reject({ status: 404, message: 'User not found' });
      resolve();
    });
  });
};

const authenticateUser = (email, password) => {
  return new Promise((resolve, reject) => {
    userModel.getUserByEmail(email, async (err, user) => {
      if (err) return reject(err);
      if (!user) return reject({ status: 401, message: 'Invalid credentials' });
      const valid = await bcrypt.compare(password, user.password);
      if (!valid) return reject({ status: 401, message: 'Invalid credentials' });
      resolve({ id: user.id, name: user.name, email: user.email });
    });
  });
};

module.exports = {
  registerUser,
  getUserById,
  updateUser,
  deleteUser,
  authenticateUser,
}; 