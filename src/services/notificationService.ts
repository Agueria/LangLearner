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
  const permission = await Notifications.requestPermissionsAsync();

  if (!permission.granted) {
    return false;
  }

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
  await Notifications.cancelAllScheduledNotificationsAsync();
};
