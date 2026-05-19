import { getDb } from './schema';

export interface GroceryItem {
  id: string;
  name: string;
  barcode: string | null;
  price: number | null;
  location: string | null;
  lat: number | null;
  lng: number | null;
  is_done: number;
  created_at: string;
}

export interface ItemCache {
  barcode: string;
  name: string;
  price: number | null;
  location: string | null;
  lat: number | null;
  lng: number | null;
}

export async function getGroceryItems(): Promise<GroceryItem[]> {
  const db = await getDb();
  return db.getAllAsync<GroceryItem>('SELECT * FROM grocery_items ORDER BY created_at DESC');
}

export async function insertGroceryItem(item: GroceryItem): Promise<void> {
  const db = await getDb();
  await db.runAsync(
    'INSERT INTO grocery_items (id, name, barcode, price, location, lat, lng, is_done, created_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)',
    item.id, item.name, item.barcode, item.price, item.location, item.lat, item.lng, item.is_done, item.created_at
  );
}

export async function toggleGroceryDone(id: string, isDone: boolean): Promise<void> {
  const db = await getDb();
  await db.runAsync('UPDATE grocery_items SET is_done = ? WHERE id = ?', isDone ? 1 : 0, id);
}

export async function updateGroceryItem(id: string, price: number | null, location: string | null, lat: number | null, lng: number | null): Promise<void> {
  const db = await getDb();
  await db.runAsync(
    'UPDATE grocery_items SET price = ?, location = ?, lat = ?, lng = ? WHERE id = ?',
    price, location, lat, lng, id
  );
}

export async function deleteGroceryItem(id: string): Promise<void> {
  const db = await getDb();
  await db.runAsync('DELETE FROM grocery_items WHERE id = ?', id);
}

export async function clearGroceryList(): Promise<void> {
  const db = await getDb();
  await db.runAsync('DELETE FROM grocery_items');
}

export async function getCachedItem(barcode: string): Promise<ItemCache | null> {
  const db = await getDb();
  const row = await db.getFirstAsync<ItemCache>('SELECT * FROM item_cache WHERE barcode = ?', barcode);
  return row ?? null;
}

export async function upsertItemCache(item: ItemCache): Promise<void> {
  const db = await getDb();
  await db.runAsync(
    'INSERT INTO item_cache (barcode, name, price, location, lat, lng) VALUES (?, ?, ?, ?, ?, ?) ON CONFLICT(barcode) DO UPDATE SET name=excluded.name, price=excluded.price, location=excluded.location, lat=excluded.lat, lng=excluded.lng',
    item.barcode, item.name, item.price, item.location, item.lat, item.lng
  );
}

export async function getGroceryStats(): Promise<{ location: string; total: number; count: number }[]> {
  const db = await getDb();
  return db.getAllAsync<{ location: string; total: number; count: number }>(
    `SELECT location, SUM(price) as total, COUNT(*) as count
     FROM grocery_items
     WHERE is_done = 1 AND price IS NOT NULL AND location IS NOT NULL AND location != ''
     GROUP BY location
     ORDER BY total DESC`
  );
}

export async function getTopItems(): Promise<{ name: string; count: number }[]> {
  const db = await getDb();
  return db.getAllAsync<{ name: string; count: number }>(
    `SELECT name, COUNT(*) as count FROM grocery_items GROUP BY name ORDER BY count DESC LIMIT 10`
  );
}
