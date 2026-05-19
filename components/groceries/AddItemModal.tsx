import React, { useState, useEffect } from 'react';
import {
  Modal, View, Text, TextInput, TouchableOpacity, StyleSheet,
  KeyboardAvoidingView, Platform, ScrollView,
} from 'react-native';
import { Colors } from '../../constants/Colors';

export interface ItemData {
  name: string;
  barcode: string | null;
  price: number | null;
  location: string | null;
  lat: number | null;
  lng: number | null;
}

interface Props {
  visible: boolean;
  onAdd: (item: ItemData) => void;
  onClose: () => void;
  onScanRequest: () => void;
  pendingBarcode?: { code: string; name: string; price: number | null; location: string | null; lat: number | null; lng: number | null } | null;
}

export function AddItemModal({ visible, onAdd, onClose, onScanRequest, pendingBarcode }: Props) {
  const [name, setName] = useState('');
  const [price, setPrice] = useState('');
  const [location, setLocation] = useState('');
  const [barcode, setBarcode] = useState<string | null>(null);

  useEffect(() => {
    if (pendingBarcode) {
      setBarcode(pendingBarcode.code);
      setName(pendingBarcode.name);
      setPrice(pendingBarcode.price != null ? String(pendingBarcode.price) : '');
      setLocation(pendingBarcode.location ?? '');
    }
  }, [pendingBarcode]);

  function handleAdd() {
    const trimmedName = name.trim();
    if (!trimmedName) return;
    onAdd({
      name: trimmedName,
      barcode,
      price: price.trim() ? parseFloat(price.trim()) : null,
      location: location.trim() || null,
      lat: null,
      lng: null,
    });
  }

  return (
    <Modal visible={visible} animationType="slide" presentationStyle="pageSheet">
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={{ flex: 1 }}>
        <View style={styles.header}>
          <TouchableOpacity onPress={onClose}><Text style={styles.cancel}>Cancel</Text></TouchableOpacity>
          <Text style={styles.title}>Add Item</Text>
          <TouchableOpacity onPress={handleAdd} disabled={!name.trim()}>
            <Text style={[styles.add, !name.trim() && styles.addDisabled]}>Add</Text>
          </TouchableOpacity>
        </View>
        <ScrollView contentContainerStyle={styles.body} keyboardShouldPersistTaps="handled">
          <Text style={styles.label}>Item Name *</Text>
          <TextInput
            style={styles.input}
            placeholder="e.g. Milk"
            value={name}
            onChangeText={setName}
            autoFocus
            returnKeyType="next"
          />
          <Text style={styles.label}>Price (optional)</Text>
          <TextInput
            style={styles.input}
            placeholder="0.00"
            value={price}
            onChangeText={setPrice}
            keyboardType="decimal-pad"
            returnKeyType="next"
          />
          <Text style={styles.label}>Location (optional)</Text>
          <TextInput
            style={styles.input}
            placeholder="e.g. Walmart Aisle 3"
            value={location}
            onChangeText={setLocation}
            returnKeyType="done"
          />
          {barcode ? <Text style={styles.barcodeHint}>Barcode: {barcode}</Text> : null}
          <TouchableOpacity style={styles.scanBtn} onPress={onScanRequest}>
            <Text style={styles.scanBtnText}>📷  Scan Barcode</Text>
          </TouchableOpacity>
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
  title: { fontSize: 17, fontWeight: '600', color: Colors.text },
  add: { color: Colors.primary, fontSize: 16, fontWeight: '600' },
  addDisabled: { opacity: 0.3 },
  body: { padding: 20, backgroundColor: Colors.background, flexGrow: 1 },
  label: { fontSize: 13, color: Colors.textSecondary, marginBottom: 6, marginTop: 12 },
  input: { backgroundColor: Colors.card, borderRadius: 10, padding: 14, fontSize: 16, color: Colors.text },
  barcodeHint: { fontSize: 12, color: Colors.textSecondary, marginTop: 8 },
  scanBtn: {
    marginTop: 24,
    backgroundColor: Colors.card,
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: Colors.primary,
    borderStyle: 'dashed',
  },
  scanBtnText: { color: Colors.primary, fontSize: 16, fontWeight: '600' },
});
