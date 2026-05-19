import React, { useState, useCallback } from 'react';
import { View, FlatList, Text, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import {
  getGroceryItems, insertGroceryItem, toggleGroceryDone,
  updateGroceryItem, deleteGroceryItem, upsertItemCache, GroceryItem, clearGroceryList,
  getCachedItem,
} from '../../db/groceries';
import { GroceryItemRow } from '../../components/groceries/GroceryItem';
import { AddItemModal, ItemData } from '../../components/groceries/AddItemModal';
import { BarcodeScanner } from '../../components/groceries/BarcodeScanner';
import { SearchFilterBar, SortKey } from '../../components/shared/SearchFilterBar';
import { Colors } from '../../constants/Colors';
import { useCurrency } from '../../context/CurrencyContext';

let idCounter = 0;
function genId() { return `gi_${Date.now()}_${idCounter++}`; }

export default function GroceriesScreen() {
  const { formatPrice } = useCurrency();
  const [items, setItems] = useState<GroceryItem[]>([]);
  const [search, setSearch] = useState('');
  const [selectedLocation, setSelectedLocation] = useState<string | null>(null);
  const [sortKey, setSortKey] = useState<SortKey>('name');
  const [addKey, setAddKey] = useState(0);

  const [showAdd, setShowAdd] = useState(false);
  const [showScanner, setShowScanner] = useState(false);
  const [pendingBarcode, setPendingBarcode] = useState<{
    code: string; name: string; price: number | null; location: string | null; lat: number | null; lng: number | null;
  } | null>(null);

  useFocusEffect(useCallback(() => { load(); }, []));

  async function load() {
    setItems(await getGroceryItems());
  }

  async function handleScanRequest() {
    setShowAdd(false);
    setTimeout(() => setShowScanner(true), 350);
  }

  async function handleBarcodeScan(code: string) {
    setShowScanner(false);
    const cached = await getCachedItem(code);
    const result = {
      code,
      name: cached?.name ?? '',
      price: cached?.price ?? null,
      location: cached?.location ?? null,
      lat: null,
      lng: null,
    };
    if (!cached) {
      Alert.alert('New Item', 'Barcode not found in history. Please fill in the details.');
    }
    setPendingBarcode(result);
    setTimeout(() => setShowAdd(true), 350);
  }

  async function handleAdd(itemData: ItemData) {
    const newItem: GroceryItem = {
      id: genId(),
      name: itemData.name,
      barcode: itemData.barcode,
      price: itemData.price,
      location: itemData.location,
      lat: null,
      lng: null,
      is_done: 0,
      created_at: new Date().toISOString(),
    };
    await insertGroceryItem(newItem);
    if (itemData.barcode) {
      await upsertItemCache({
        barcode: itemData.barcode,
        name: itemData.name,
        price: itemData.price,
        location: itemData.location,
        lat: null,
        lng: null,
      });
    }
    setPendingBarcode(null);
    setShowAdd(false);
    await load();
  }

  function handleCloseAdd() {
    setPendingBarcode(null);
    setShowAdd(false);
  }

  async function handleToggle(id: string, isDone: boolean) {
    await toggleGroceryDone(id, isDone);
    await load();
  }

  async function handleUpdate(id: string, price: number | null, location: string | null, lat: number | null, lng: number | null) {
    await updateGroceryItem(id, price, location, lat, lng);
    const item = items.find(i => i.id === id);
    if (item?.barcode) {
      await upsertItemCache({ barcode: item.barcode, name: item.name, price, location, lat, lng });
    }
    await load();
  }

  async function handleDelete(id: string) {
    await deleteGroceryItem(id);
    await load();
  }

  function handleClearList() {
    Alert.alert('Clear List', 'Remove all grocery items?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Clear', style: 'destructive', onPress: async () => { await clearGroceryList(); await load(); } },
    ]);
  }

  const locations = [...new Set(items.map(i => i.location).filter(Boolean) as string[])];

  let filtered = items.filter(i => {
    const matchSearch = !search || i.name.toLowerCase().includes(search.toLowerCase());
    const matchLoc = !selectedLocation || i.location === selectedLocation;
    return matchSearch && matchLoc;
  });

  filtered = filtered.sort((a, b) => {
    if (sortKey === 'price') return (a.price ?? Infinity) - (b.price ?? Infinity);
    if (sortKey === 'location') return (a.location ?? '').localeCompare(b.location ?? '');
    return a.name.localeCompare(b.name);
  });

  const allSorted = [...filtered.filter(i => !i.is_done), ...filtered.filter(i => i.is_done)];
  const totalCost = items.filter(i => !i.is_done && i.price != null).reduce((s, i) => s + i.price!, 0);

  return (
    <View style={styles.container}>
      <SearchFilterBar
        search={search}
        onSearchChange={setSearch}
        locations={locations}
        selectedLocation={selectedLocation}
        onLocationChange={setSelectedLocation}
        sortKey={sortKey}
        onSortChange={setSortKey}
      />

      <View style={styles.totalBar}>
        <Text style={styles.totalLabel}>Estimated Total</Text>
        <Text style={styles.totalAmount}>{formatPrice(totalCost)}</Text>
      </View>

      <FlatList
        data={allSorted}
        keyExtractor={i => i.id}
        renderItem={({ item }) => (
          <GroceryItemRow
            item={item}
            onToggle={handleToggle}
            onUpdate={handleUpdate}
            onDelete={handleDelete}
          />
        )}
        ListEmptyComponent={<Text style={styles.empty}>No items yet. Tap + to add.</Text>}
        ListFooterComponent={
          items.length > 0 ? (
            <TouchableOpacity style={styles.clearBtn} onPress={handleClearList}>
              <Text style={styles.clearBtnText}>Clear All Items</Text>
            </TouchableOpacity>
          ) : null
        }
      />

      <TouchableOpacity
        style={styles.fab}
        onPress={() => { setAddKey(k => k + 1); setPendingBarcode(null); setShowAdd(true); }}
      >
        <Text style={styles.fabText}>＋</Text>
      </TouchableOpacity>

      <AddItemModal
        key={addKey}
        visible={showAdd}
        onAdd={handleAdd}
        onClose={handleCloseAdd}
        onScanRequest={handleScanRequest}
        pendingBarcode={pendingBarcode}
      />

      <BarcodeScanner
        visible={showScanner}
        onScan={handleBarcodeScan}
        onClose={() => { setShowScanner(false); setTimeout(() => setShowAdd(true), 350); }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  totalBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.groceries,
    paddingHorizontal: 16,
    paddingVertical: 10,
  },
  totalLabel: { flex: 1, color: '#fff', fontSize: 14, fontWeight: '500' },
  totalAmount: { color: '#fff', fontSize: 20, fontWeight: '700' },
  empty: { textAlign: 'center', color: Colors.textSecondary, marginTop: 60, fontSize: 15 },
  clearBtn: { margin: 20, alignItems: 'center' },
  clearBtnText: { color: Colors.danger, fontSize: 14 },
  fab: {
    position: 'absolute',
    bottom: 32,
    right: 24,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: Colors.groceries,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.3,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 4 },
  },
  fabText: { color: '#fff', fontSize: 28, lineHeight: 32 },
});
