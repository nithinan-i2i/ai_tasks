// cart.js
// Shopping Cart module with input validation, error handling, and JSDoc documentation

/**
 * Creates a new shopping cart instance.
 * @returns {Object} The shopping cart API: addItem, removeItem, getItems, getTotal
 */
function createCart() {
  let items = [];

  /**
   * Adds an item to the cart.
   * @param {Object} item - The item to add. Must have id (number), name (string), and price (number >= 0).
   * @throws {TypeError} If item is invalid.
   */
  function addItem(item) {
    if (
      typeof item !== 'object' ||
      item === null ||
      typeof item.id !== 'number' ||
      typeof item.name !== 'string' ||
      typeof item.price !== 'number' ||
      item.price < 0
    ) {
      throw new TypeError('Invalid item: must have id (number), name (string), and price (number >= 0)');
    }
    items.push(item);
  }

  /**
   * Removes an item from the cart by its id.
   * @param {number} itemId - The id of the item to remove.
   * @throws {TypeError} If itemId is not a number.
   * @throws {Error} If item with the given id is not found.
   */
  function removeItem(itemId) {
    if (typeof itemId !== 'number') {
      throw new TypeError('itemId must be a number');
    }
    const index = items.findIndex(item => item.id === itemId);
    if (index === -1) {
      throw new Error(`Item with id ${itemId} not found in cart`);
    }
    items.splice(index, 1);
  }

  /**
   * Returns a copy of all items in the cart.
   * @returns {Array<Object>} The items in the cart.
   */
  function getItems() {
    return [...items];
  }

  /**
   * Returns the total price of all items in the cart.
   * @returns {number} The total price.
   */
  function getTotal() {
    return items.reduce((sum, item) => sum + item.price, 0);
  }

  return { addItem, removeItem, getItems, getTotal };
}

module.exports = { createCart }; 