import * as Notifications from 'expo-notifications';
import { getBills } from '../db/bills';

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
    shouldShowBanner: true,
    shouldShowList: true,
  }),
});

export async function requestNotificationPermissions(): Promise<boolean> {
  const { status } = await Notifications.requestPermissionsAsync();
  return status === 'granted';
}

export async function scheduleBillReminders(): Promise<void> {
  await Notifications.cancelAllScheduledNotificationsAsync();

  const bills = await getBills();
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const fiveDaysFromNow = new Date(today);
  fiveDaysFromNow.setDate(fiveDaysFromNow.getDate() + 5);

  for (const bill of bills) {
    if (bill.is_paid) continue;
    const dueDate = new Date(bill.due_date);
    dueDate.setHours(0, 0, 0, 0);

    if (dueDate <= fiveDaysFromNow) {
      const diffDays = Math.round((dueDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
      let body = '';
      if (diffDays < 0) body = `Overdue by ${Math.abs(diffDays)} day(s)`;
      else if (diffDays === 0) body = 'Due today!';
      else body = `Due in ${diffDays} day(s)`;

      await Notifications.scheduleNotificationAsync({
        content: {
          title: `Bill Due: ${bill.name}`,
          body,
          data: { billId: bill.id },
        },
        trigger: null,
      });
    }
  }
}
