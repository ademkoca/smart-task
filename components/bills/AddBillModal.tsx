import React, { useState, useEffect } from 'react';
import {
  Modal, View, Text, TextInput, TouchableOpacity, StyleSheet,
  Switch, KeyboardAvoidingView, Platform, ScrollView
} from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import { Bill } from '../../db/bills';
import { Colors } from '../../constants/Colors';

interface Props {
  visible: boolean;
  editingBill?: Bill | null;
  onSave: (bill: Omit<Bill, 'id'>) => void;
  onClose: () => void;
}

export function AddBillModal({ visible, editingBill, onSave, onClose }: Props) {
  const [name, setName] = useState('');
  const [amount, setAmount] = useState('');
  const [dueDate, setDueDate] = useState(new Date());
  const [isRecurring, setIsRecurring] = useState(false);
  const [recurrenceMonths, setRecurrenceMonths] = useState('1');
  const [showDatePicker, setShowDatePicker] = useState(false);

  useEffect(() => {
    if (visible && editingBill) {
      setName(editingBill.name);
      setAmount(editingBill.amount != null ? String(editingBill.amount) : '');
      setDueDate(new Date(editingBill.due_date));
      setIsRecurring(!!editingBill.is_recurring);
      setRecurrenceMonths(String(editingBill.recurrence_months));
    } else if (visible) {
      setName(''); setAmount(''); setDueDate(new Date()); setIsRecurring(false); setRecurrenceMonths('1');
    }
  }, [visible, editingBill]);

  function handleSave() {
    if (!name.trim()) return;
    onSave({
      name: name.trim(),
      amount: amount.trim() ? parseFloat(amount.trim()) : null,
      due_date: dueDate.toISOString().split('T')[0],
      is_recurring: isRecurring ? 1 : 0,
      recurrence_months: parseInt(recurrenceMonths, 10) || 1,
      is_paid: 0,
    });
  }

  return (
    <Modal visible={visible} animationType="slide" presentationStyle="pageSheet">
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={{ flex: 1 }}>
        <View style={styles.header}>
          <TouchableOpacity onPress={onClose}><Text style={styles.cancel}>Cancel</Text></TouchableOpacity>
          <Text style={styles.title}>{editingBill ? 'Edit Bill' : 'Add Bill'}</Text>
          <TouchableOpacity onPress={handleSave} disabled={!name.trim()}>
            <Text style={[styles.save, !name.trim() && styles.saveDisabled]}>Save</Text>
          </TouchableOpacity>
        </View>
        <ScrollView contentContainerStyle={styles.body} keyboardShouldPersistTaps="handled">
          <Text style={styles.label}>Bill Name *</Text>
          <TextInput style={styles.input} placeholder="e.g. Netflix" value={name} onChangeText={setName} autoFocus />

          <Text style={styles.label}>Amount (optional)</Text>
          <TextInput
            style={styles.input}
            placeholder="0.00"
            value={amount}
            onChangeText={setAmount}
            keyboardType="decimal-pad"
          />

          <Text style={styles.label}>Due Date</Text>
          <TouchableOpacity style={styles.dateBtn} onPress={() => setShowDatePicker(true)}>
            <Text style={styles.dateBtnText}>{dueDate.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</Text>
          </TouchableOpacity>
          {showDatePicker && (
            <DateTimePicker
              value={dueDate}
              mode="date"
              display="spinner"
              onChange={(_, date) => { if (date) setDueDate(date); setShowDatePicker(false); }}
            />
          )}

          <View style={styles.toggleRow}>
            <Text style={styles.toggleLabel}>Recurring</Text>
            <Switch value={isRecurring} onValueChange={setIsRecurring} trackColor={{ true: Colors.primary }} />
          </View>

          {isRecurring && (
            <>
              <Text style={styles.label}>Every (months)</Text>
              <TextInput
                style={styles.input}
                placeholder="1"
                value={recurrenceMonths}
                onChangeText={setRecurrenceMonths}
                keyboardType="number-pad"
              />
            </>
          )}
        </ScrollView>
      </KeyboardAvoidingView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingTop: 20,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: Colors.separator,
    backgroundColor: Colors.card,
  },
  cancel: { color: Colors.danger, fontSize: 16 },
  title: { fontSize: 17, fontWeight: '600' },
  save: { color: Colors.primary, fontSize: 16, fontWeight: '600' },
  saveDisabled: { opacity: 0.3 },
  body: { padding: 20, backgroundColor: Colors.background, flexGrow: 1 },
  label: { fontSize: 13, color: Colors.textSecondary, marginBottom: 6, marginTop: 16 },
  input: { backgroundColor: Colors.card, borderRadius: 10, padding: 14, fontSize: 16, color: Colors.text },
  dateBtn: { backgroundColor: Colors.card, borderRadius: 10, padding: 14 },
  dateBtnText: { fontSize: 16, color: Colors.text },
  toggleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: Colors.card,
    borderRadius: 10,
    padding: 14,
    marginTop: 16,
  },
  toggleLabel: { fontSize: 16, color: Colors.text },
});
