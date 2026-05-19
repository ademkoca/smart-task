import { getDb } from './schema';

export interface Bill {
  id: string;
  name: string;
  amount: number | null;
  due_date: string;
  is_recurring: number;
  recurrence_months: number;
  is_paid: number;
}

export async function getBills(): Promise<Bill[]> {
  const db = await getDb();
  return db.getAllAsync<Bill>('SELECT * FROM bills ORDER BY due_date ASC');
}

export async function insertBill(bill: Bill): Promise<void> {
  const db = await getDb();
  await db.runAsync(
    'INSERT INTO bills (id, name, amount, due_date, is_recurring, recurrence_months, is_paid) VALUES (?, ?, ?, ?, ?, ?, ?)',
    bill.id, bill.name, bill.amount, bill.due_date, bill.is_recurring, bill.recurrence_months, bill.is_paid
  );
}

export async function updateBill(bill: Partial<Bill> & { id: string }): Promise<void> {
  const db = await getDb();
  await db.runAsync(
    'UPDATE bills SET name=?, amount=?, due_date=?, is_recurring=?, recurrence_months=?, is_paid=? WHERE id=?',
    bill.name ?? '', bill.amount ?? null, bill.due_date ?? '', bill.is_recurring ?? 0, bill.recurrence_months ?? 1, bill.is_paid ?? 0, bill.id
  );
}

export async function markBillPaid(id: string): Promise<void> {
  const db = await getDb();
  const bill = await db.getFirstAsync<Bill>('SELECT * FROM bills WHERE id = ?', id);
  if (!bill) return;

  if (bill.is_recurring) {
    const next = new Date(bill.due_date);
    next.setMonth(next.getMonth() + bill.recurrence_months);
    await db.runAsync(
      'UPDATE bills SET is_paid = 0, due_date = ? WHERE id = ?',
      next.toISOString().split('T')[0], id
    );
  } else {
    await db.runAsync('UPDATE bills SET is_paid = 1 WHERE id = ?', id);
  }
}

export async function deleteBill(id: string): Promise<void> {
  const db = await getDb();
  await db.runAsync('DELETE FROM bills WHERE id = ?', id);
}

export async function getBillsStats(): Promise<{ month: string; total: number }[]> {
  const db = await getDb();
  return db.getAllAsync<{ month: string; total: number }>(
    `SELECT strftime('%Y-%m', due_date) as month, SUM(amount) as total
     FROM bills
     WHERE amount IS NOT NULL
     GROUP BY month
     ORDER BY month DESC
     LIMIT 12`
  );
}
