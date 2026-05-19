import React, { useState, useCallback } from 'react';
import { View, FlatList, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { getBills, insertBill, updateBill, markBillPaid, deleteBill, Bill } from '../../db/bills';
import { BillItem } from '../../components/bills/BillItem';
import { AddBillModal } from '../../components/bills/AddBillModal';
import { scheduleBillReminders } from '../../services/notifications';
import { Colors } from '../../constants/Colors';
import { useCurrency } from '../../context/CurrencyContext';

let idCounter = 0;
function genId() { return `bill_${Date.now()}_${idCounter++}`; }

export default function BillsScreen() {
  const { formatPrice } = useCurrency();
  const [bills, setBills] = useState<Bill[]>([]);
  const [showAdd, setShowAdd] = useState(false);
  const [editingBill, setEditingBill] = useState<Bill | null>(null);

  useFocusEffect(useCallback(() => { load(); }, []));

  async function load() {
    const data = await getBills();
    setBills(data);
  }

  async function handleSave(billData: Omit<Bill, 'id'>) {
    if (editingBill) {
      await updateBill({ ...billData, id: editingBill.id });
    } else {
      await insertBill({ ...billData, id: genId() });
    }
    setShowAdd(false);
    setEditingBill(null);
    await load();
    await scheduleBillReminders();
  }

  async function handleMarkPaid(id: string) {
    await markBillPaid(id);
    await load();
    await scheduleBillReminders();
  }

  async function handleDelete(id: string) {
    await deleteBill(id);
    await load();
  }

  function handleEdit(bill: Bill) {
    setEditingBill(bill);
    setShowAdd(true);
  }

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const unpaidTotal = bills.filter(b => !b.is_paid && b.amount != null).reduce((s, b) => s + b.amount!, 0);
  const overdue = bills.filter(b => !b.is_paid && new Date(b.due_date) < today).length;

  return (
    <View style={styles.container}>
      <View style={styles.summaryBar}>
        <View style={styles.summaryItem}>
          <Text style={styles.summaryLabel}>Upcoming</Text>
          <Text style={styles.summaryValue}>{formatPrice(unpaidTotal)}</Text>
        </View>
        {overdue > 0 && (
          <View style={[styles.summaryItem, styles.overdueItem]}>
            <Text style={styles.summaryLabel}>Overdue</Text>
            <Text style={[styles.summaryValue, { color: Colors.danger }]}>{overdue} bill{overdue !== 1 ? 's' : ''}</Text>
          </View>
        )}
      </View>

      <FlatList
        data={bills}
        keyExtractor={b => b.id}
        renderItem={({ item }) => (
          <BillItem
            bill={item}
            onMarkPaid={handleMarkPaid}
            onEdit={handleEdit}
            onDelete={handleDelete}
          />
        )}
        contentContainerStyle={{ paddingVertical: 8 }}
        ListEmptyComponent={<Text style={styles.empty}>No bills yet. Tap + to add.</Text>}
      />

      <TouchableOpacity style={styles.fab} onPress={() => { setEditingBill(null); setShowAdd(true); }}>
        <Text style={styles.fabText}>＋</Text>
      </TouchableOpacity>

      <AddBillModal
        visible={showAdd}
        editingBill={editingBill}
        onSave={handleSave}
        onClose={() => { setShowAdd(false); setEditingBill(null); }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  summaryBar: {
    flexDirection: 'row',
    backgroundColor: Colors.bills,
    paddingHorizontal: 20,
    paddingVertical: 12,
    gap: 24,
  },
  summaryItem: {},
  overdueItem: {},
  summaryLabel: { color: 'rgba(255,255,255,0.8)', fontSize: 12, fontWeight: '500' },
  summaryValue: { color: '#fff', fontSize: 20, fontWeight: '700' },
  empty: { textAlign: 'center', color: Colors.textSecondary, marginTop: 60, fontSize: 15 },
  fab: {
    position: 'absolute',
    bottom: 32,
    right: 24,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: Colors.bills,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.3,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 4 },
  },
  fabText: { color: '#fff', fontSize: 28, lineHeight: 32 },
});
