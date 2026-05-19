import React, { useState, useCallback } from 'react';
import {
  View, FlatList, Text, TouchableOpacity, StyleSheet, Modal, TextInput, Alert
} from 'react-native';
import { useRouter } from 'expo-router';
import { useFocusEffect } from '@react-navigation/native';
import { getTabs, insertTab, deleteTab, Tab } from '../../db/tabs';
import { Colors } from '../../constants/Colors';

let idCounter = 0;
function genId() { return `custom_${Date.now()}_${idCounter++}`; }

export default function ListsScreen() {
  const [tabs, setTabs] = useState<Tab[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [tabName, setTabName] = useState('');
  const router = useRouter();

  useFocusEffect(useCallback(() => { load(); }, []));

  async function load() {
    const all = await getTabs();
    setTabs(all.filter(t => t.type === 'custom'));
  }

  async function handleCreate() {
    const name = tabName.trim();
    if (!name) return;
    const id = genId();
    await insertTab({ id, name, type: 'custom', position: 100 });
    setTabName('');
    setShowModal(false);
    await load();
    router.push(`/(tabs)/${id}` as any);
  }

  function handleDeleteTab(tab: Tab) {
    Alert.alert('Delete List', `Delete "${tab.name}" and all its items?`, [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: async () => { await deleteTab(tab.id); await load(); },
      },
    ]);
  }

  return (
    <View style={styles.container}>
      <FlatList
        data={tabs}
        keyExtractor={t => t.id}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={styles.listItem}
            onPress={() => router.push(`/(tabs)/${item.id}` as any)}
            onLongPress={() => handleDeleteTab(item)}
          >
            <Text style={styles.listIcon}>📋</Text>
            <Text style={styles.listName}>{item.name}</Text>
            <Text style={styles.chevron}>›</Text>
          </TouchableOpacity>
        )}
        ListEmptyComponent={
          <View style={styles.empty}>
            <Text style={styles.emptyTitle}>No custom lists yet</Text>
            <Text style={styles.emptyHint}>Tap + to create a new to-do list</Text>
          </View>
        }
        contentContainerStyle={{ flexGrow: 1 }}
      />

      <TouchableOpacity style={styles.fab} onPress={() => { setTabName(''); setShowModal(true); }}>
        <Text style={styles.fabText}>＋</Text>
      </TouchableOpacity>

      <Modal visible={showModal} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <Text style={styles.modalTitle}>New List</Text>
            <TextInput
              style={styles.modalInput}
              placeholder="List name (e.g. Shopping, Work)"
              value={tabName}
              onChangeText={setTabName}
              autoFocus
              returnKeyType="done"
              onSubmitEditing={handleCreate}
            />
            <View style={styles.modalActions}>
              <TouchableOpacity onPress={() => setShowModal(false)} style={styles.modalBtn}>
                <Text style={styles.cancelText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={handleCreate}
                style={[styles.modalBtn, styles.createBtn, !tabName.trim() && styles.createBtnDisabled]}
                disabled={!tabName.trim()}
              >
                <Text style={styles.createText}>Create</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  listItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.card,
    paddingHorizontal: 16,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: Colors.separator,
  },
  listIcon: { fontSize: 22, marginRight: 14 },
  listName: { flex: 1, fontSize: 17, color: Colors.text },
  chevron: { fontSize: 22, color: Colors.textSecondary },
  empty: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  emptyTitle: { fontSize: 18, fontWeight: '600', color: Colors.text, marginBottom: 8 },
  emptyHint: { fontSize: 14, color: Colors.textSecondary },
  fab: {
    position: 'absolute',
    bottom: 32,
    right: 24,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: Colors.custom,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.3,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 4 },
  },
  fabText: { color: '#fff', fontSize: 28, lineHeight: 32 },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.4)', justifyContent: 'center', alignItems: 'center' },
  modalCard: { backgroundColor: '#fff', borderRadius: 16, padding: 24, width: '82%' },
  modalTitle: { fontSize: 18, fontWeight: '700', marginBottom: 16, color: Colors.text },
  modalInput: {
    borderWidth: 1, borderColor: Colors.border, borderRadius: 10,
    padding: 12, fontSize: 16, marginBottom: 16, color: Colors.text,
  },
  modalActions: { flexDirection: 'row', justifyContent: 'flex-end', gap: 12 },
  modalBtn: { paddingHorizontal: 16, paddingVertical: 10 },
  cancelText: { color: Colors.textSecondary, fontSize: 15 },
  createBtn: { backgroundColor: Colors.custom, borderRadius: 8 },
  createBtnDisabled: { opacity: 0.4 },
  createText: { color: '#fff', fontSize: 15, fontWeight: '600' },
});
