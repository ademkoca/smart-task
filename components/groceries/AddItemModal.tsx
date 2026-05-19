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

export interface AddItemModalHandle {
  applyBarcode: (barcode: string, name: string, price: number | null, location: string | null, lat: number | null, lng: number | null) => void;
  applyLocation: (label: string, lat: number, lng: number) => void;
}

interface Props {
  visible: boolean;
  onAdd: (item: ItemData) => void;
  onClose: () => void;
  onScanRequest: () => void;
  onLocationPickRequest: (current: { lat: number; lng: number; label: string } | null) => void;
  // Parent passes these back after scan/pick completes
  pendingBarcode?: { code: string; name: string; price: number | null; location: string | null; lat: number | null; lng: number | null } | null;
  pendingLocation?: { label: string; lat: number; lng: number } | null;
}

export function AddItemModal({
  visible, onAdd, onClose, onScanRequest, onLocationPickRequest,
  pendingBarcode, pendingLocation,
}: Props) {
  const [name, setName] = useState('');
  const [price, setPrice] = useState('');
  const [location, setLocation] = useState('');
  const [lat, setLat] = useState<number | null>(null);
  const [lng, setLng] = useState<number | null>(null);
  const [barcode, setBarcode] = useState<string | null>(null);

  // Apply barcode lookup result from parent (no visible guard — parent sets this before re-opening)
  useEffect(() => {
    if (pendingBarcode) {
      setBarcode(pendingBarcode.code);
      setName(pendingBarcode.name);
      setPrice(pendingBarcode.price != null ? String(pendingBarcode.price) : '');
      setLocation(pendingBarcode.location ?? '');
      setLat(pendingBarcode.lat ?? null);
      setLng(pendingBarcode.lng ?? null);
    }
  }, [pendingBarcode]);

  // Apply location pick result from parent (no visible guard — parent sets this before re-opening)
  useEffect(() => {
    if (pendingLocation) {
      setLocation(pendingLocation.label);
      setLat(pendingLocation.lat);
      setLng(pendingLocation.lng);
    }
  }, [pendingLocation]);

  function handleAdd() {
    const trimmedName = name.trim();
    if (!trimmedName) return;
    onAdd({
      name: trimmedName,
      barcode,
      price: price.trim() ? parseFloat(price.trim()) : null,
      location: location.trim() || null,
      lat,
      lng,
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
          <View style={styles.locationRow}>
            <TextInput
              style={[styles.input, styles.locationInput]}
              placeholder="e.g. Walmart Aisle 3"
              value={location}
              onChangeText={(v) => { setLocation(v); setLat(null); setLng(null); }}
              returnKeyType="done"
            />
            <TouchableOpacity
              style={styles.mapBtn}
              onPress={() => onLocationPickRequest(lat != null && lng != null ? { lat, lng, label: location } : null)}
            >
              <Text style={styles.mapBtnText}>📍 Map</Text>
            </TouchableOpacity>
          </View>
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
  locationRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  locationInput: { flex: 1 },
  mapBtn: { backgroundColor: Colors.card, borderRadius: 10, padding: 14 },
  mapBtnText: { fontSize: 14 },
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
