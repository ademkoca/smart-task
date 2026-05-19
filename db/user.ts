import { getDb } from './schema';

export interface User {
  id: number;
  username: string;
}

export async function getUser(): Promise<User | null> {
  const db = await getDb();
  const row = await db.getFirstAsync<User>('SELECT * FROM user LIMIT 1');
  return row ?? null;
}

export async function saveUser(username: string): Promise<void> {
  const db = await getDb();
  await db.runAsync('INSERT OR REPLACE INTO user (id, username) VALUES (1, ?)', username);
}
