import React from 'react';
import { View, TextInput, TouchableOpacity, Text, StyleSheet, ScrollView } from 'react-native';
import { Colors } from '../../constants/Colors';

export type SortKey = 'name' | 'price' | 'location';

interface Props {
  search: string;
  onSearchChange: (v: string) => void;
  locations: string[];
  selectedLocation: string | null;
  onLocationChange: (v: string | null) => void;
  sortKey: SortKey;
  onSortChange: (k: SortKey) => void;
}

export function SearchFilterBar({ search, onSearchChange, locations, selectedLocation, onLocationChange, sortKey, onSortChange }: Props) {
  const sorts: { key: SortKey; label: string }[] = [
    { key: 'name', label: 'Name' },
    { key: 'price', label: 'Price' },
    { key: 'location', label: 'Location' },
  ];

  return (
    <View style={styles.container}>
      <TextInput
        style={styles.searchInput}
        placeholder="Search items..."
        value={search}
        onChangeText={onSearchChange}
        clearButtonMode="while-editing"
      />
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.chips}>
        <TouchableOpacity
          style={[styles.chip, selectedLocation === null && styles.chipActive]}
          onPress={() => onLocationChange(null)}
        >
          <Text style={[styles.chipText, selectedLocation === null && styles.chipTextActive]}>All</Text>
        </TouchableOpacity>
        {locations.map(loc => (
          <TouchableOpacity
            key={loc}
            style={[styles.chip, selectedLocation === loc && styles.chipActive]}
            onPress={() => onLocationChange(loc)}
          >
            <Text style={[styles.chipText, selectedLocation === loc && styles.chipTextActive]}>{loc}</Text>
          </TouchableOpacity>
        ))}
      </ScrollView>
      <View style={styles.sortRow}>
        <Text style={styles.sortLabel}>Sort:</Text>
        {sorts.map(s => (
          <TouchableOpacity key={s.key} style={[styles.sortBtn, sortKey === s.key && styles.sortBtnActive]} onPress={() => onSortChange(s.key)}>
            <Text style={[styles.sortBtnText, sortKey === s.key && styles.sortBtnTextActive]}>{s.label}</Text>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { backgroundColor: Colors.card, paddingHorizontal: 12, paddingTop: 8, paddingBottom: 4 },
  searchInput: {
    backgroundColor: Colors.background,
    borderRadius: 10,
    padding: 10,
    fontSize: 15,
    marginBottom: 8,
  },
  chips: { marginBottom: 8 },
  chip: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    backgroundColor: Colors.background,
    marginRight: 8,
  },
  chipActive: { backgroundColor: Colors.primary },
  chipText: { color: Colors.textSecondary, fontSize: 13 },
  chipTextActive: { color: '#fff' },
  sortRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 4 },
  sortLabel: { color: Colors.textSecondary, fontSize: 13, marginRight: 8 },
  sortBtn: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
    backgroundColor: Colors.background,
    marginRight: 6,
  },
  sortBtnActive: { backgroundColor: Colors.primary },
  sortBtnText: { color: Colors.textSecondary, fontSize: 13 },
  sortBtnTextActive: { color: '#fff' },
});
