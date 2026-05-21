import { useFocusEffect } from "@react-navigation/native";
import { useLocalSearchParams, useNavigation, useRouter } from "expo-router";
import React, { useCallback, useState } from "react";
import {
  Alert,
  FlatList,
  KeyboardAvoidingView,
  Modal,
  Platform,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { TodoItemRow } from "../../components/todos/TodoItem";
import { Colors } from "../../constants/Colors";
import { deleteTab, getTabs, updateTabName } from "../../db/tabs";
import {
  deleteTodoItem,
  getTodoItems,
  insertTodoItem,
  TodoItem,
  toggleTodoDone,
} from "../../db/todos";

let idCounter = 0;
function genId() {
  return `todo_${Date.now()}_${idCounter++}`;
}

export default function CustomTabScreen() {
  const { tabId } = useLocalSearchParams<{ tabId: string }>();
  const [items, setItems] = useState<TodoItem[]>([]);
  const [newItemText, setNewItemText] = useState("");
  const [tabName, setTabName] = useState("");
  const [showRenameModal, setShowRenameModal] = useState(false);
  const [renameText, setRenameText] = useState("");
  const navigation = useNavigation();
  const router = useRouter();

  useFocusEffect(
    useCallback(() => {
      if (tabId) {
        load();
        loadTabName();
      }
    }, [tabId]),
  );

  async function loadTabName() {
    const tabs = await getTabs();
    const tab = tabs.find((t) => t.id === tabId);
    if (tab) {
      setTabName(tab.name);
      navigation.setOptions({ title: tab.name });
    }
  }

  async function load() {
    if (!tabId) return;
    const data = await getTodoItems(tabId);
    setItems(data);
  }

  async function handleAdd() {
    const text = newItemText.trim();
    if (!text || !tabId) return;
    await insertTodoItem({
      id: genId(),
      tab_id: tabId,
      name: text,
      is_done: 0,
      created_at: new Date().toISOString(),
    });
    setNewItemText("");
    await load();
  }

  async function handleToggle(id: string, isDone: boolean) {
    await toggleTodoDone(id, isDone);
    await load();
  }

  async function handleDelete(id: string) {
    await deleteTodoItem(id);
    await load();
  }

  async function handleRename() {
    if (!renameText.trim() || !tabId) return;
    await updateTabName(tabId, renameText.trim());
    setShowRenameModal(false);
    await loadTabName();
  }

  function handleDeleteTab() {
    Alert.alert("Delete Tab", `Delete "${tabName}" and all its items?`, [
      { text: "Cancel", style: "cancel" },
      {
        text: "Delete",
        style: "destructive",
        onPress: async () => {
          if (tabId) await deleteTab(tabId);
          router.back();
        },
      },
    ]);
  }

  const pending = items.filter((i) => !i.is_done);
  const done = items.filter((i) => i.is_done);

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      keyboardVerticalOffset={Platform.OS === "ios" ? 105 : 0}
      style={styles.container}
    >
      <View style={styles.tabActions}>
        <TouchableOpacity
          onPress={() => {
            setRenameText(tabName);
            setShowRenameModal(true);
          }}
          style={styles.actionBtn}
        >
          <Text style={styles.actionBtnText}>✏️ Rename</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={handleDeleteTab} style={styles.actionBtn}>
          <Text style={[styles.actionBtnText, { color: Colors.danger }]}>
            🗑 Delete Tab
          </Text>
        </TouchableOpacity>
      </View>

      <FlatList
        data={[...pending, ...done]}
        keyExtractor={(i) => i.id}
        renderItem={({ item }) => (
          <TodoItemRow
            item={item}
            onToggle={handleToggle}
            onDelete={handleDelete}
          />
        )}
        keyboardShouldPersistTaps="handled"
        ListEmptyComponent={
          <Text style={styles.empty}>No items yet. Add one below.</Text>
        }
      />

      <View style={styles.inputBar}>
        <TextInput
          style={styles.input}
          placeholder="Add item..."
          value={newItemText}
          onChangeText={setNewItemText}
          returnKeyType="done"
          onSubmitEditing={handleAdd}
        />
        <TouchableOpacity
          style={styles.addBtn}
          onPress={handleAdd}
          disabled={!newItemText.trim()}
        >
          <Text style={styles.addBtnText}>Add</Text>
        </TouchableOpacity>
      </View>

      <Modal visible={showRenameModal} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <Text style={styles.modalTitle}>Rename Tab</Text>
            <TextInput
              style={styles.modalInput}
              value={renameText}
              onChangeText={setRenameText}
              autoFocus
              returnKeyType="done"
              onSubmitEditing={handleRename}
            />
            <View style={styles.modalActions}>
              <TouchableOpacity
                onPress={() => setShowRenameModal(false)}
                style={styles.modalBtn}
              >
                <Text style={styles.modalCancelText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={handleRename}
                style={[styles.modalBtn, styles.modalConfirmBtn]}
              >
                <Text style={styles.modalConfirmText}>Rename</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  tabActions: {
    flexDirection: "row",
    justifyContent: "flex-end",
    gap: 12,
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: Colors.card,
    borderBottomWidth: 1,
    borderBottomColor: Colors.separator,
  },
  actionBtn: { paddingHorizontal: 8, paddingVertical: 4 },
  actionBtnText: { fontSize: 14, color: Colors.primary },
  empty: {
    textAlign: "center",
    color: Colors.textSecondary,
    marginTop: 60,
    fontSize: 15,
  },
  inputBar: {
    flexDirection: "row",
    padding: 12,
    backgroundColor: Colors.card,
    borderTopWidth: 1,
    borderTopColor: Colors.separator,
    gap: 8,
  },
  input: {
    flex: 1,
    backgroundColor: Colors.background,
    borderRadius: 10,
    padding: 12,
    fontSize: 16,
    color: Colors.text,
  },
  addBtn: {
    backgroundColor: Colors.custom,
    borderRadius: 10,
    paddingHorizontal: 16,
    justifyContent: "center",
  },
  addBtnText: { color: "#fff", fontWeight: "600", fontSize: 15 },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.4)",
    justifyContent: "center",
    alignItems: "center",
  },
  modalCard: {
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 24,
    width: "80%",
  },
  modalTitle: { fontSize: 18, fontWeight: "700", marginBottom: 16 },
  modalInput: {
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: 10,
    padding: 12,
    fontSize: 16,
    marginBottom: 16,
  },
  modalActions: { flexDirection: "row", justifyContent: "flex-end", gap: 12 },
  modalBtn: { paddingHorizontal: 16, paddingVertical: 10 },
  modalCancelText: { color: Colors.textSecondary, fontSize: 15 },
  modalConfirmBtn: { backgroundColor: Colors.primary, borderRadius: 8 },
  modalConfirmText: { color: "#fff", fontSize: 15, fontWeight: "600" },
});
