import { getDb } from './schema';

export type Currency = 'RSD' | 'EUR';

export async function getCurrency(): Promise<Currency> {
  const db = await getDb();
  const row = await db.getFirstAsync<{ value: string }>('SELECT value FROM settings WHERE key = ?', 'currency');
  return (row?.value as Currency) ?? 'RSD';
}

export async function setCurrency(currency: Currency): Promise<void> {
  const db = await getDb();
  await db.runAsync('INSERT OR REPLACE INTO settings (key, value) VALUES (?, ?)', 'currency', currency);
}
