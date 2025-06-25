// cart.test.js
// Jest tests for Shopping Cart module (failing, AAA pattern)

const { createCart } = require('./cart');

describe('Shopping Cart Module', () => {
  test('should add an item to the cart', () => {
    // Arrange
    const cart = createCart();
    const item = { id: 1, name: 'Apple', price: 2 };
    // Act
    cart.addItem(item);
    // Assert
    expect(cart.getItems()).toContainEqual(item);
  });

  test('should remove an item from the cart', () => {
    // Arrange
    const cart = createCart();
    const item = { id: 2, name: 'Banana', price: 1 };
    cart.addItem(item);
    // Act
    cart.removeItem(item.id);
    // Assert
    expect(cart.getItems()).not.toContainEqual(item);
  });

  test('should return the total price of all items in the cart', () => {
    // Arrange
    const cart = createCart();
    cart.addItem({ id: 1, name: 'Apple', price: 2 });
    cart.addItem({ id: 2, name: 'Banana', price: 1 });
    // Act
    const total = cart.getTotalPrice();
    // Assert
    expect(total).toBe(3);
  });

  test('should return all items currently in the cart', () => {
    // Arrange
    const cart = createCart();
    const items = [
      { id: 1, name: 'Apple', price: 2 },
      { id: 2, name: 'Banana', price: 1 },
    ];
    items.forEach(item => cart.addItem(item));
    // Act
    const cartItems = cart.getItems();
    // Assert
    expect(cartItems).toEqual(items);
  });
});

describe('Shopping Cart Integration', () => {
  test('should handle a full user journey: add, remove, view, total', () => {
    // Arrange
    const cart = createCart();
    const apple = { id: 1, name: 'Apple', price: 2 };
    const banana = { id: 2, name: 'Banana', price: 1 };
    const orange = { id: 3, name: 'Orange', price: 3 };

    // Act & Assert
    // Add items
    cart.addItem(apple);
    cart.addItem(banana);
    cart.addItem(orange);
    expect(cart.getItems()).toEqual([apple, banana, orange]);
    expect(cart.getTotal()).toBe(6);

    // Remove one item
    cart.removeItem(banana.id);
    expect(cart.getItems()).toEqual([apple, orange]);
    expect(cart.getTotal()).toBe(5);

    // View items
    const items = cart.getItems();
    expect(items.length).toBe(2);
    expect(items).toContainEqual(apple);
    expect(items).toContainEqual(orange);
  });

  test('should throw an error when removing a non-existent item', () => {
    // Arrange
    const cart = createCart();
    cart.addItem({ id: 1, name: 'Apple', price: 2 });
    // Act & Assert
    expect(() => cart.removeItem(999)).toThrow('Item with id 999 not found in cart');
  });

  test('should throw an error when adding an invalid item', () => {
    // Arrange
    const cart = createCart();
    // Act & Assert
    expect(() => cart.addItem({})).toThrow();
    expect(() => cart.addItem(null)).toThrow();
    expect(() => cart.addItem({ id: 'a', name: 123, price: -1 })).toThrow();
  });

  test('should throw an error when removing with invalid id type', () => {
    // Arrange
    const cart = createCart();
    // Act & Assert
    expect(() => cart.removeItem('not-a-number')).toThrow('itemId must be a number');
  });
}); 