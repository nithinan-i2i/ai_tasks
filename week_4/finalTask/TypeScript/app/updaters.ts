import { Item } from './gilded-rose';

/**
 * A centralized object to hold the names of special items.
 * This prevents "magic strings" from being scattered throughout the business logic.
 */
export const ITEM_NAMES = {
  AGED_BRIE: 'Aged Brie',
  BACKSTAGE_PASS: 'Backstage passes to a TAFKAL80ETC concert',
  SULFURAS: 'Sulfuras, Hand of Ragnaros',
};

/**
 * Defines the contract for an item update strategy.
 * Each concrete class implementing this interface will provide
 * the specific update logic for a single type of item.
 */
export interface ItemUpdater {
  update(item: Item): void;
}

/** Handles the update logic for "Normal" items. */
class NormalItemUpdater implements ItemUpdater {
  update(item: Item): void {
    item.sellIn--;
    item.quality--;
    if (item.sellIn < 0) {
      item.quality--;
    }
    this._clampQuality(item);
  }

  private _clampQuality(item: Item): void {
    if (item.quality < 0) item.quality = 0;
  }
}

/** Handles the update logic for "Aged Brie". */
class AgedBrieUpdater implements ItemUpdater {
  update(item: Item): void {
    item.sellIn--;
    item.quality++;
    if (item.sellIn < 0) {
      item.quality++;
    }
    this._clampQuality(item);
  }

  private _clampQuality(item: Item): void {
    if (item.quality > 50) item.quality = 50;
  }
}

/** Handles the update logic for "Sulfuras". */
class SulfurasUpdater implements ItemUpdater {
  update(item: Item): void {
    // "Sulfuras" never has its quality or sellIn changed.
  }
}

/** Handles the update logic for "Backstage passes". */
class BackstagePassUpdater implements ItemUpdater {
  update(item: Item): void {
    item.sellIn--;
    item.quality++;

    if (item.sellIn < 10) {
      item.quality++;
    }

    if (item.sellIn < 5) {
      item.quality++;
    }

    if (item.sellIn < 0) {
      item.quality = 0;
    }

    this._clampQuality(item);
  }

  private _clampQuality(item: Item): void {
    if (item.quality > 50) item.quality = 50;
  }
}

/**
 * A factory that creates and returns a map of all available updaters.
 * This is the central point for managing which strategy applies to which item.
 */
export const UPDATER_FACTORY = new Map<string, ItemUpdater>([
  [ITEM_NAMES.AGED_BRIE, new AgedBrieUpdater()],
  [ITEM_NAMES.SULFURAS, new SulfurasUpdater()],
  [ITEM_NAMES.BACKSTAGE_PASS, new BackstagePassUpdater()],
]);

/**
 * The default updater to use for any item that doesn't have a special strategy.
 */
export const DEFAULT_UPDATER = new NormalItemUpdater(); 