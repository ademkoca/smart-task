import { getDb } from './schema';

export interface Tab {
  id: string;
  name: string;
  type: 'groceries' | 'bills' | 'custom';
  position: number;
}

export async function getTabs(): Promise<Tab[]> {
  const db = await getDb();
  return db.getAllAsync<Tab>('SELECT * FROM tabs ORDER BY position ASC');
}

export async function insertTab(tab: Tab): Promise<void> {
  const db = await getDb();
  await db.runAsync(
    'INSERT INTO tabs (id, name, type, position) VALUES (?, ?, ?, ?)',
    tab.id, tab.name, tab.type, tab.position
  );
}

export async function updateTabName(id: string, name: string): Promise<void> {
  const db = await getDb();
  await db.runAsync('UPDATE tabs SET name = ? WHERE id = ?', name, id);
}

export async function deleteTab(id: string): Promise<void> {
  const db = await getDb();
  await db.runAsync('DELETE FROM tabs WHERE id = ?', id);
  await db.runAsync('DELETE FROM todo_items WHERE tab_id = ?', id);
}
