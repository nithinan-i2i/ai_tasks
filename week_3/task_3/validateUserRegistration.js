function validateUserRegistration(user) {
  // Check for null, undefined, or non-object
  if (!user || typeof user !== 'object') {
    throw new Error('User object is required');
  }

  // Validate email
  if (typeof user.email !== 'string' || user.email.trim() === '') {
    throw new Error('Email is required');
  }
  const email = user.email.trim();
  if (!email.includes('@')) {
    throw new Error('Invalid email address');
  }

  // Validate password
  if (typeof user.password !== 'string' || user.password.trim() === '') {
    throw new Error('Password is required');
  }
  const password = user.password;
  if (password.length < 8) {
    throw new Error('Password too short');
  }

  // Validate username
  if (typeof user.username !== 'string' || user.username.trim() === '') {
    throw new Error('Username is required');
  }
  const username = user.username.trim();
  if (!/^[a-zA-Z0-9]+$/.test(username)) {
    throw new Error('Username must be alphanumeric');
  }

  return true;
}

module.exports = { validateUserRegistration }; 