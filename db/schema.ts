import * as SQLite from 'expo-sqlite';

let _db: SQLite.SQLiteDatabase | null = null;

export async function getDb(): Promise<SQLite.SQLiteDatabase> {
  if (!_db) {
    _db = await SQLite.openDatabaseAsync('smarttask.db');
  }
  return _db;
}

export async function initDb(): Promise<void> {
  const db = await getDb();
  await db.execAsync(`
    PRAGMA journal_mode = WAL;

    CREATE TABLE IF NOT EXISTS user (
      id INTEGER PRIMARY KEY,
      username TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS tabs (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      type TEXT NOT NULL,
      position INTEGER NOT NULL
    );

    CREATE TABLE IF NOT EXISTS item_cache (
      barcode TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      price REAL,
      location TEXT,
      lat REAL,
      lng REAL
    );

    CREATE TABLE IF NOT EXISTS grocery_items (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      barcode TEXT,
      price REAL,
      location TEXT,
      lat REAL,
      lng REAL,
      is_done INTEGER DEFAULT 0,
      created_at TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS bills (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      amount REAL,
      due_date TEXT NOT NULL,
      is_recurring INTEGER DEFAULT 0,
      recurrence_months INTEGER DEFAULT 1,
      is_paid INTEGER DEFAULT 0
    );

    CREATE TABLE IF NOT EXISTS todo_items (
      id TEXT PRIMARY KEY,
      tab_id TEXT NOT NULL,
      name TEXT NOT NULL,
      is_done INTEGER DEFAULT 0,
      created_at TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS settings (
      key TEXT PRIMARY KEY,
      value TEXT NOT NULL
    );

    INSERT OR IGNORE INTO settings (key, value) VALUES ('currency', 'RSD');
  `);
}
