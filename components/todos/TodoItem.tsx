import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import { TodoItem as TodoItemType } from '../../db/todos';
import { Colors } from '../../constants/Colors';

interface Props {
  item: TodoItemType;
  onToggle: (id: string, isDone: boolean) => void;
  onDelete: (id: string) => void;
}

export function TodoItemRow({ item, onToggle, onDelete }: Props) {
  function handleDelete() {
    Alert.alert('Delete', `Remove "${item.name}"?`, [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Delete', style: 'destructive', onPress: () => onDelete(item.id) },
    ]);
  }

  return (
    <TouchableOpacity style={styles.row} onPress={() => onToggle(item.id, !item.is_done)} activeOpacity={0.7}>
      <Text style={styles.checkbox}>{item.is_done ? '✅' : '⬜'}</Text>
      <Text style={[styles.name, !!item.is_done && styles.nameDone]}>{item.name}</Text>
      <TouchableOpacity onPress={handleDelete} style={styles.deleteBtn}>
        <Text style={styles.deleteIcon}>🗑</Text>
      </TouchableOpacity>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.card,
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: Colors.separator,
  },
  checkbox: { fontSize: 20, marginRight: 12 },
  name: { flex: 1, fontSize: 16, color: Colors.text },
  nameDone: { textDecorationLine: 'line-through', color: Colors.textSecondary },
  deleteBtn: { padding: 4 },
  deleteIcon: { fontSize: 16 },
});
