import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Alert, TextInput, Modal, KeyboardAvoidingView, Platform, ScrollView } from 'react-native';
import { GroceryItem as GroceryItemType } from '../../db/groceries';
import { Colors } from '../../constants/Colors';
import { useCurrency } from '../../context/CurrencyContext';

interface Props {
  item: GroceryItemType;
  onToggle: (id: string, isDone: boolean) => void;
  onUpdate: (id: string, price: number | null, location: string | null, lat: number | null, lng: number | null) => void;
  onDelete: (id: string) => void;
}

export function GroceryItemRow({ item, onToggle, onUpdate, onDelete }: Props) {
  const { formatPrice } = useCurrency();
  const [editing, setEditing] = useState(false);
  const [editPrice, setEditPrice] = useState(item.price != null ? String(item.price) : '');
  const [editLocation, setEditLocation] = useState(item.location ?? '');

  function handleSave() {
    const parsedPrice = editPrice.trim() ? parseFloat(editPrice.trim()) : null;
    onUpdate(item.id, parsedPrice, editLocation.trim() || null, null, null);
    setEditing(false);
  }

  function handleDelete() {
    Alert.alert('Delete Item', `Remove "${item.name}"?`, [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Delete', style: 'destructive', onPress: () => onDelete(item.id) },
    ]);
  }

  return (
    <>
      <TouchableOpacity style={[styles.row, !!item.is_done && styles.rowDone]} onLongPress={() => setEditing(true)} activeOpacity={0.7}>
        <TouchableOpacity style={styles.checkbox} onPress={() => onToggle(item.id, !item.is_done)}>
          <Text style={styles.checkboxIcon}>{item.is_done ? '✅' : '⬜'}</Text>
        </TouchableOpacity>
        <View style={styles.info}>
          <Text style={[styles.name, !!item.is_done && styles.nameDone]}>{item.name}</Text>
          {item.location ? <Text style={styles.sub}>{item.location}</Text> : null}
        </View>
        <View style={styles.right}>
          {item.price != null && <Text style={[styles.price, !!item.is_done && styles.priceDone]}>{formatPrice(item.price)}</Text>}
          <TouchableOpacity onPress={handleDelete} style={styles.deleteBtn}>
            <Text style={styles.deleteIcon}>🗑</Text>
          </TouchableOpacity>
        </View>
      </TouchableOpacity>

      <Modal visible={editing} animationType="slide" presentationStyle="pageSheet">
        <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={{ flex: 1 }}>
          <View style={styles.editHeader}>
            <TouchableOpacity onPress={() => setEditing(false)}><Text style={styles.editCancel}>Cancel</Text></TouchableOpacity>
            <Text style={styles.editTitle}>Edit: {item.name}</Text>
            <TouchableOpacity onPress={handleSave}><Text style={styles.editSave}>Save</Text></TouchableOpacity>
          </View>
          <ScrollView contentContainerStyle={styles.editBody}>
            <Text style={styles.editLabel}>Price</Text>
            <TextInput
              style={styles.editInput}
              placeholder="0.00"
              value={editPrice}
              onChangeText={setEditPrice}
              keyboardType="decimal-pad"
            />
            <Text style={styles.editLabel}>Location</Text>
            <TextInput
              style={styles.editInput}
              placeholder="Store / aisle"
              value={editLocation}
              onChangeText={setEditLocation}
            />
          </ScrollView>
        </KeyboardAvoidingView>
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.card,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: Colors.separator,
  },
  rowDone: { opacity: 0.5 },
  checkbox: { marginRight: 12 },
  checkboxIcon: { fontSize: 20 },
  info: { flex: 1 },
  name: { fontSize: 16, color: Colors.text },
  nameDone: { textDecorationLine: 'line-through', color: Colors.textSecondary },
  sub: { fontSize: 12, color: Colors.textSecondary, marginTop: 2 },
  right: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  price: { fontSize: 15, fontWeight: '600', color: Colors.success },
  priceDone: { color: Colors.textSecondary },
  deleteBtn: { padding: 4 },
  deleteIcon: { fontSize: 16 },
  editHeader: {
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
  editCancel: { color: Colors.danger, fontSize: 16 },
  editTitle: { fontSize: 16, fontWeight: '600' },
  editSave: { color: Colors.primary, fontSize: 16, fontWeight: '600' },
  editBody: { padding: 20, backgroundColor: Colors.background, flexGrow: 1 },
  editLabel: { fontSize: 13, color: Colors.textSecondary, marginBottom: 6, marginTop: 12 },
  editInput: { backgroundColor: Colors.card, borderRadius: 10, padding: 14, fontSize: 16, color: Colors.text },
});
