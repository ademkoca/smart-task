import React, { useEffect, useState } from 'react';
import { View, Text, ScrollView, StyleSheet, Dimensions } from 'react-native';
import { BarChart } from 'react-native-chart-kit';
import { getGroceryStats, getTopItems } from '../db/groceries';
import { getBillsStats } from '../db/bills';
import { Colors } from '../constants/Colors';
import { useCurrency } from '../context/CurrencyContext';

const screenWidth = Dimensions.get('window').width;

export default function StatsScreen() {
  const { formatPrice } = useCurrency();
  const [groceryStats, setGroceryStats] = useState<{ location: string; total: number; count: number }[]>([]);
  const [topItems, setTopItems] = useState<{ name: string; count: number }[]>([]);
  const [billStats, setBillStats] = useState<{ month: string; total: number }[]>([]);

  useEffect(() => {
    (async () => {
      setGroceryStats(await getGroceryStats());
      setTopItems(await getTopItems());
      setBillStats(await getBillsStats());
    })();
  }, []);

  const chartConfig = {
    backgroundColor: Colors.card,
    backgroundGradientFrom: Colors.card,
    backgroundGradientTo: Colors.card,
    decimalPlaces: 0,
    color: (opacity = 1) => `rgba(0, 122, 255, ${opacity})`,
    labelColor: () => Colors.textSecondary,
    style: { borderRadius: 12 },
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={{ padding: 16 }}>
      <Text style={styles.sectionTitle}>Spending by Location</Text>
      {groceryStats.length > 0 ? (
        <View style={styles.card}>
          <BarChart
            data={{
              labels: groceryStats.map(s => s.location.length > 10 ? s.location.slice(0, 10) + '…' : s.location),
              datasets: [{ data: groceryStats.map(s => s.total) }],
            }}
            width={screenWidth - 48}
            height={200}
            yAxisLabel=""
            yAxisSuffix=""
            chartConfig={{ ...chartConfig, color: (opacity = 1) => `rgba(52, 199, 89, ${opacity})` }}
            style={styles.chart}
            showValuesOnTopOfBars
          />
          {groceryStats.map(s => (
            <View key={s.location} style={styles.statRow}>
              <Text style={styles.statLabel}>{s.location}</Text>
              <Text style={styles.statValue}>{formatPrice(s.total)} ({s.count} items)</Text>
            </View>
          ))}
        </View>
      ) : (
        <Text style={styles.empty}>Mark grocery items as done to see spending stats.</Text>
      )}

      <Text style={styles.sectionTitle}>Most Purchased Items</Text>
      {topItems.length > 0 ? (
        <View style={styles.card}>
          {topItems.map(item => (
            <View key={item.name} style={styles.statRow}>
              <Text style={styles.statLabel}>{item.name}</Text>
              <Text style={styles.statValue}>{item.count}×</Text>
            </View>
          ))}
        </View>
      ) : (
        <Text style={styles.empty}>No grocery history yet.</Text>
      )}

      <Text style={styles.sectionTitle}>Monthly Bills</Text>
      {billStats.length > 0 ? (
        <View style={styles.card}>
          <BarChart
            data={{
              labels: billStats.map(s => s.month.slice(5)),
              datasets: [{ data: billStats.map(s => s.total) }],
            }}
            width={screenWidth - 48}
            height={200}
            yAxisLabel=""
            yAxisSuffix=""
            chartConfig={{ ...chartConfig, color: (opacity = 1) => `rgba(255, 149, 0, ${opacity})` }}
            style={styles.chart}
            showValuesOnTopOfBars
          />
          {billStats.map(s => (
            <View key={s.month} style={styles.statRow}>
              <Text style={styles.statLabel}>{s.month}</Text>
              <Text style={styles.statValue}>{formatPrice(s.total)}</Text>
            </View>
          ))}
        </View>
      ) : (
        <Text style={styles.empty}>No bill data yet.</Text>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  sectionTitle: { fontSize: 18, fontWeight: '700', color: Colors.text, marginTop: 16, marginBottom: 8 },
  card: { backgroundColor: Colors.card, borderRadius: 16, padding: 16, marginBottom: 8 },
  chart: { borderRadius: 12, marginBottom: 12 },
  statRow: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 6, borderBottomWidth: 1, borderBottomColor: Colors.separator },
  statLabel: { color: Colors.text, fontSize: 14, flex: 1 },
  statValue: { color: Colors.textSecondary, fontSize: 14, fontWeight: '600' },
  empty: { color: Colors.textSecondary, fontSize: 14, marginBottom: 16 },
});
