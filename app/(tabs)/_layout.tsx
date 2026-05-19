import { Tabs, useRouter } from 'expo-router';
import { TouchableOpacity, Text, View, Platform } from 'react-native';
import { Colors } from '../../constants/Colors';
import { useCurrency } from '../../context/CurrencyContext';

function HeaderRight() {
  const router = useRouter();
  const { currency, setCurrency } = useCurrency();
  return (
    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4, marginRight: 12 }}>
      <TouchableOpacity
        onPress={() => setCurrency(currency === 'RSD' ? 'EUR' : 'RSD')}
        style={{ backgroundColor: Colors.primary, borderRadius: 6, paddingHorizontal: 8, paddingVertical: 4 }}
      >
        <Text style={{ color: '#fff', fontSize: 12, fontWeight: '700' }}>{currency}</Text>
      </TouchableOpacity>
      <TouchableOpacity onPress={() => router.push('/stats' as any)} style={{ padding: 4 }}>
        <Text style={{ fontSize: 20 }}>📊</Text>
      </TouchableOpacity>
    </View>
  );
}

export default function TabsLayout() {
  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: Colors.primary,
        tabBarStyle: { paddingBottom: Platform.OS === 'ios' ? 20 : 8, height: Platform.OS === 'ios' ? 80 : 60 },
        headerRight: () => <HeaderRight />,
      }}
    >
      <Tabs.Screen
        name="groceries"
        options={{
          title: 'Groceries',
          tabBarLabel: 'Groceries',
          tabBarIcon: ({ color }) => <Text style={{ fontSize: 22, color }}>🛒</Text>,
          tabBarActiveTintColor: Colors.groceries,
        }}
      />
      <Tabs.Screen
        name="bills"
        options={{
          title: 'Bills',
          tabBarLabel: 'Bills',
          tabBarIcon: ({ color }) => <Text style={{ fontSize: 22, color }}>💳</Text>,
          tabBarActiveTintColor: Colors.bills,
        }}
      />
      <Tabs.Screen
        name="lists"
        options={{
          title: 'My Lists',
          tabBarLabel: 'My Lists',
          tabBarIcon: ({ color }) => <Text style={{ fontSize: 22, color }}>📋</Text>,
          tabBarActiveTintColor: Colors.custom,
        }}
      />
      <Tabs.Screen name="index" options={{ href: null }} />
      <Tabs.Screen name="[tabId]" options={{ href: null, title: 'List' }} />
    </Tabs>
  );
}
