const db = require('../db/database');

const createUser = (user, callback) => {
  const { name, email, password } = user;
  db.run(
    'INSERT INTO users (name, email, password) VALUES (?, ?, ?)',
    [name, email, password],
    function (err) {
      if (err) return callback(err);
      callback(null, { id: this.lastID, name, email });
    }
  );
};

const getUserById = (id, callback) => {
  db.get('SELECT id, name, email, password FROM users WHERE id = ?', [id], callback);
};

const getUserByEmail = (email, callback) => {
  db.get('SELECT * FROM users WHERE email = ?', [email], callback);
};

const updateUser = (id, user, callback) => {
  const { name, email, password } = user;
  db.run(
    'UPDATE users SET name = ?, email = ?, password = ? WHERE id = ?',
    [name, email, password, id],
    function (err) {
      if (err) return callback(err);
      callback(null, this.changes);
    }
  );
};

const deleteUser = (id, callback) => {
  db.run('DELETE FROM users WHERE id = ?', [id], function (err) {
    if (err) return callback(err);
    callback(null, this.changes);
  });
};

module.exports = {
  createUser,
  getUserById,
  getUserByEmail,
  updateUser,
  deleteUser,
}; 