/**
 * @module gilded-rose
 * @description Manages an inventory of items for the Gilded Rose establishment.
 *
 * @overview
 * The `GildedRose` class is responsible for updating the `quality` and `sellIn` (sell-by date)
 * of a collection of `Item` objects based on a complex set of rules. This system is designed
 * to be run once per day to update the inventory.
 *
 * @key_features
 * - Updates item quality and sell-in values based on predefined rules.
 * - Handles special item types with unique logic (e.g., 'Aged Brie', 'Sulfuras', 'Backstage passes').
 * - Encapsulates the inventory update logic, providing a simple API.
 *
 * @usage_patterns
 * This class is typically instantiated with an array of items. The `updateQuality` method
 * is then called to process one day's worth of updates.
 *
 * @example
 * ```typescript
 * import { GildedRose, Item } from './gilded-rose';
 *
 * const items = [
 *   new Item("+5 Dexterity Vest", 10, 20),
 *   new Item("Aged Brie", 2, 0),
 *   new Item("Sulfuras, Hand of Ragnaros", 0, 80),
 * ];
 *
 * const gildedRose = new GildedRose(items);
 * gildedRose.updateQuality();
 *
 * // The 'items' array is now updated.
 * console.log(items);
 * ```
 *
 * @dependencies
 * This module has no external dependencies.
 */

import { UPDATER_FACTORY, DEFAULT_UPDATER } from './updaters';
import { ItemUpdater } from './updaters';

/**
 * Represents a single item in the Gilded Rose inventory.
 * The properties of this item are mutated directly by the `GildedRose` class.
 */
export class Item {
  name: string;
  sellIn: number;
  quality: number;

  /**
   * @param {string} name - The name of the item.
   * @param {number} sellIn - The number of days left to sell the item.
   * @param {number} quality - The quality value of the item.
   */
  constructor(name, sellIn, quality) {
    this.name = name;
    this.sellIn = sellIn;
    this.quality = quality;
  }
}

export class GildedRose {
  items: Array<Item>;

  constructor(items = [] as Array<Item>) {
    this.items = items;
  }

  /**
   * The core method that processes the inventory for one day.
   * It iterates through each item and delegates the update logic to the appropriate strategy.
   *
   * @returns {Array<Item>} The same array of items that was passed to the constructor, now with updated values.
   *
   * @performance
   * This method runs in O(n) time, where 'n' is the number of items in the inventory.
   * Memory usage is constant as it modifies items in place.
   */
  updateQuality() {
    for (const item of this.items) {
      const updater = UPDATER_FACTORY.get(item.name) || DEFAULT_UPDATER;
      updater.update(item);
    }
    return this.items;
  }
}
