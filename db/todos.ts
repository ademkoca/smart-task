import { getDb } from './schema';

export interface TodoItem {
  id: string;
  tab_id: string;
  name: string;
  is_done: number;
  created_at: string;
}

export async function getTodoItems(tabId: string): Promise<TodoItem[]> {
  const db = await getDb();
  return db.getAllAsync<TodoItem>('SELECT * FROM todo_items WHERE tab_id = ? ORDER BY created_at DESC', tabId);
}

export async function insertTodoItem(item: TodoItem): Promise<void> {
  const db = await getDb();
  await db.runAsync(
    'INSERT INTO todo_items (id, tab_id, name, is_done, created_at) VALUES (?, ?, ?, ?, ?)',
    item.id, item.tab_id, item.name, item.is_done, item.created_at
  );
}

export async function toggleTodoDone(id: string, isDone: boolean): Promise<void> {
  const db = await getDb();
  await db.runAsync('UPDATE todo_items SET is_done = ? WHERE id = ?', isDone ? 1 : 0, id);
}

export async function deleteTodoItem(id: string): Promise<void> {
  const db = await getDb();
  await db.runAsync('DELETE FROM todo_items WHERE id = ?', id);
}
