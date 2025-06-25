const { validateUserRegistration } = require('./validateUserRegistration');

describe('validateUserRegistration', () => {
  // --- Inputs that should throw errors ---
  it('throws if user is null', () => {
    // Arrange
    const user = null;
    // Act & Assert
    expect(() => validateUserRegistration(user)).toThrow();
  });

  it('throws if user is undefined', () => {
    // Arrange
    let user;
    // Act & Assert
    expect(() => validateUserRegistration(user)).toThrow();
  });

  it('throws if user is an empty object', () => {
    // Arrange
    const user = {};
    // Act & Assert
    expect(() => validateUserRegistration(user)).toThrow();
  });

  it('throws if email is missing', () => {
    // Arrange
    const user = { password: 'password123', username: 'user123' };
    // Act & Assert
    expect(() => validateUserRegistration(user)).toThrow();
  });

  it('throws if email does not contain @', () => {
    // Arrange
    const user = { email: 'userexample.com', password: 'password123', username: 'user123' };
    // Act & Assert
    expect(() => validateUserRegistration(user)).toThrow('Invalid email address');
  });

  it('throws if password is missing', () => {
    // Arrange
    const user = { email: 'user@example.com', username: 'user123' };
    // Act & Assert
    expect(() => validateUserRegistration(user)).toThrow();
  });

  it('throws if password is too short', () => {
    // Arrange
    const user = { email: 'user@example.com', password: 'short', username: 'user123' };
    // Act & Assert
    expect(() => validateUserRegistration(user)).toThrow('Password too short');
  });

  it('throws if username is missing', () => {
    // Arrange
    const user = { email: 'user@example.com', password: 'password123' };
    // Act & Assert
    expect(() => validateUserRegistration(user)).toThrow();
  });

  it('throws if username contains special characters', () => {
    // Arrange
    const user = { email: 'user@example.com', password: 'password123', username: 'user!@#' };
    // Act & Assert
    expect(() => validateUserRegistration(user)).toThrow('Username must be alphanumeric');
  });

  it('throws if username contains spaces', () => {
    // Arrange
    const user = { email: 'user@example.com', password: 'password123', username: 'user name' };
    // Act & Assert
    expect(() => validateUserRegistration(user)).toThrow('Username must be alphanumeric');
  });

  it('throws if username contains unicode characters', () => {
    // Arrange
    const user = { email: 'user@example.com', password: 'password123', username: 'usér123' };
    // Act & Assert
    expect(() => validateUserRegistration(user)).toThrow('Username must be alphanumeric');
  });

  it('throws if email is not a string', () => {
    // Arrange
    const user = { email: 12345, password: 'password123', username: 'user123' };
    // Act & Assert
    expect(() => validateUserRegistration(user)).toThrow();
  });

  it('throws if password is not a string', () => {
    // Arrange
    const user = { email: 'user@example.com', password: 12345678, username: 'user123' };
    // Act & Assert
    expect(() => validateUserRegistration(user)).toThrow();
  });

  it('throws if username is not a string', () => {
    // Arrange
    const user = { email: 'user@example.com', password: 'password123', username: 12345 };
    // Act & Assert
    expect(() => validateUserRegistration(user)).toThrow();
  });

  it('throws if email is an empty string', () => {
    // Arrange
    const user = { email: '', password: 'password123', username: 'user123' };
    // Act & Assert
    expect(() => validateUserRegistration(user)).toThrow();
  });

  it('throws if password is an empty string', () => {
    // Arrange
    const user = { email: 'user@example.com', password: '', username: 'user123' };
    // Act & Assert
    expect(() => validateUserRegistration(user)).toThrow();
  });

  it('throws if username is an empty string', () => {
    // Arrange
    const user = { email: 'user@example.com', password: 'password123', username: '' };
    // Act & Assert
    expect(() => validateUserRegistration(user)).toThrow();
  });

  // --- Inputs that should succeed ---
  it('returns true for valid user input', () => {
    // Arrange
    const user = { email: 'user@example.com', password: 'password123', username: 'user123' };
    // Act
    const result = validateUserRegistration(user);
    // Assert
    expect(result).toBe(true);
  });

  it('returns true for valid user with numbers in username', () => {
    // Arrange
    const user = { email: 'user@example.com', password: 'password123', username: 'user12345' };
    // Act
    const result = validateUserRegistration(user);
    // Assert
    expect(result).toBe(true);
  });

  it('returns true for valid user with uppercase and lowercase username', () => {
    // Arrange
    const user = { email: 'user@example.com', password: 'password123', username: 'UserName123' };
    // Act
    const result = validateUserRegistration(user);
    // Assert
    expect(result).toBe(true);
  });

  // --- Edge cases ---
  it('throws for extremely long email', () => {
    // Arrange
    const user = { email: 'a'.repeat(10000) + '@example.com', password: 'password123', username: 'user123' };
    // Act & Assert
    expect(() => validateUserRegistration(user)).not.toThrow(); // Should not throw for long but valid email
  });

  it('throws for extremely long password', () => {
    // Arrange
    const user = { email: 'user@example.com', password: 'a'.repeat(10000), username: 'user123' };
    // Act
    const result = validateUserRegistration(user);
    // Assert
    expect(result).toBe(true);
  });

  it('returns true for minimum valid password length', () => {
    // Arrange
    const user = { email: 'user@example.com', password: '12345678', username: 'user123' };
    // Act
    const result = validateUserRegistration(user);
    // Assert
    expect(result).toBe(true);
  });
}); 