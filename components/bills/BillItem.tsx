import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import { Bill } from '../../db/bills';
import { Colors } from '../../constants/Colors';
import { useCurrency } from '../../context/CurrencyContext';

interface Props {
  bill: Bill;
  onMarkPaid: (id: string) => void;
  onEdit: (bill: Bill) => void;
  onDelete: (id: string) => void;
}

export function BillItem({ bill, onMarkPaid, onEdit, onDelete }: Props) {
  const { formatPrice } = useCurrency();
  const dueDate = new Date(bill.due_date);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const diffDays = Math.round((dueDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));

  let urgencyColor = Colors.text;
  let urgencyLabel = '';
  if (bill.is_paid) {
    urgencyLabel = '✓ Paid';
    urgencyColor = Colors.success;
  } else if (diffDays < 0) {
    urgencyLabel = `Overdue ${Math.abs(diffDays)}d`;
    urgencyColor = Colors.danger;
  } else if (diffDays <= 5) {
    urgencyLabel = diffDays === 0 ? 'Due today' : `Due in ${diffDays}d`;
    urgencyColor = Colors.warning;
  } else {
    urgencyLabel = `Due ${dueDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}`;
  }

  function handleDelete() {
    Alert.alert('Delete Bill', `Remove "${bill.name}"?`, [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Delete', style: 'destructive', onPress: () => onDelete(bill.id) },
    ]);
  }

  return (
    <TouchableOpacity style={styles.row} onLongPress={() => onEdit(bill)} activeOpacity={0.8}>
      <View style={[styles.urgencyBar, { backgroundColor: urgencyColor }]} />
      <View style={styles.info}>
        <View style={styles.topRow}>
          <Text style={styles.name}>{bill.name}</Text>
          {bill.is_recurring ? <Text style={styles.recurringBadge}>↻ Monthly</Text> : null}
        </View>
        <Text style={[styles.urgency, { color: urgencyColor }]}>{urgencyLabel}</Text>
      </View>
      <View style={styles.right}>
        {bill.amount != null && (
          <Text style={styles.amount}>{formatPrice(bill.amount)}</Text>
        )}
        <View style={styles.actions}>
          {!bill.is_paid && (
            <TouchableOpacity style={styles.paidBtn} onPress={() => onMarkPaid(bill.id)}>
              <Text style={styles.paidBtnText}>Mark Paid</Text>
            </TouchableOpacity>
          )}
          <TouchableOpacity onPress={handleDelete} style={styles.deleteBtn}>
            <Text style={styles.deleteIcon}>🗑</Text>
          </TouchableOpacity>
        </View>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.card,
    marginHorizontal: 12,
    marginVertical: 4,
    borderRadius: 12,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 2 },
  },
  urgencyBar: { width: 5, alignSelf: 'stretch' },
  info: { flex: 1, padding: 14 },
  topRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  name: { fontSize: 16, fontWeight: '600', color: Colors.text },
  recurringBadge: { fontSize: 11, color: Colors.textSecondary, backgroundColor: Colors.background, paddingHorizontal: 6, paddingVertical: 2, borderRadius: 6 },
  urgency: { fontSize: 13, marginTop: 4 },
  right: { padding: 14, alignItems: 'flex-end', gap: 8 },
  amount: { fontSize: 17, fontWeight: '700', color: Colors.bills },
  actions: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  paidBtn: { backgroundColor: Colors.success, borderRadius: 8, paddingHorizontal: 10, paddingVertical: 6 },
  paidBtnText: { color: '#fff', fontSize: 12, fontWeight: '600' },
  deleteBtn: { padding: 4 },
  deleteIcon: { fontSize: 16 },
});
