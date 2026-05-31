import * as Notifications from 'expo-notifications';

type ReminderContent = {
  body: string;
  title: string;
};

const DAILY_REMINDER_HOUR = 19;

export const scheduleDailyReminder = async ({
  body,
  title,
}: ReminderContent): Promise<boolean> => {
  // Bildirim native izin ister. Izin verilmezse false doneriz; Profile ekrani
  // buna gore kullaniciya "permission denied" mesaji gosterir.
  const permission = await Notifications.requestPermissionsAsync();

  if (!permission.granted) {
    return false;
  }

  // Tek bir gunluk hatirlatici istiyoruz. Once eskileri temizlemek duplicate
  // notification olusmasini engeller.
  await Notifications.cancelAllScheduledNotificationsAsync();
  await Notifications.scheduleNotificationAsync({
    content: {
      body,
      title,
    },
    trigger: {
      hour: DAILY_REMINDER_HOUR,
      minute: 0,
      type: Notifications.SchedulableTriggerInputTypes.DAILY,
    },
  });

  return true;
};

export const cancelDailyReminder = async () => {
  // Uygulamada sadece bu reminder kullanildigi icin tum schedule'lari temizlemek
  // basit ve guvenli bir kapatma davranisi saglar.
  await Notifications.cancelAllScheduledNotificationsAsync();
};
