import { useEffect, useState } from 'react';
import { Stack } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { initDb } from '../db/schema';
import { getUser, saveUser } from '../db/user';
import { insertTab, getTabs } from '../db/tabs';
import { UsernameModal } from '../components/shared/UsernameModal';
import { scheduleBillReminders, requestNotificationPermissions } from '../services/notifications';
import { CurrencyProvider } from '../context/CurrencyContext';

SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const [ready, setReady] = useState(false);
  const [showUsername, setShowUsername] = useState(false);

  useEffect(() => {
    bootstrap();
  }, []);

  async function bootstrap() {
    try {
      await initDb();

      const tabs = await getTabs();
      if (tabs.length === 0) {
        await insertTab({ id: 'groceries', name: 'Groceries', type: 'groceries', position: 0 });
        await insertTab({ id: 'bills', name: 'Bills', type: 'bills', position: 1 });
      }

      const user = await getUser();
      if (!user) {
        setShowUsername(true);
      } else {
        await requestNotificationPermissions();
        await scheduleBillReminders();
      }
    } finally {
      setReady(true);
      SplashScreen.hideAsync();
    }
  }

  async function handleUsernameSave(username: string) {
    await saveUser(username);
    setShowUsername(false);
    await requestNotificationPermissions();
    await scheduleBillReminders();
  }

  if (!ready) return null;

  return (
    <CurrencyProvider>
      <Stack>
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen name="stats" options={{ title: 'Stats', presentation: 'modal' }} />
      </Stack>
      <UsernameModal visible={showUsername} onSave={handleUsernameSave} />
    </CurrencyProvider>
  );
}
