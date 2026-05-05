import * as Notifications from 'expo-notifications';
import {
  cancelDailyReminder,
  scheduleDailyReminder,
} from '../src/services/notificationService';

const mockedNotifications = jest.mocked(Notifications);

describe('notification service', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('does not schedule when permission is denied', async () => {
    mockedNotifications.requestPermissionsAsync.mockResolvedValue({
      granted: false,
    } as Notifications.NotificationPermissionsStatus);

    await expect(
      scheduleDailyReminder({ body: 'Body', title: 'Title' })
    ).resolves.toBe(false);
    expect(
      mockedNotifications.scheduleNotificationAsync
    ).not.toHaveBeenCalled();
  });

  it('schedules a daily reminder when permission is granted', async () => {
    mockedNotifications.requestPermissionsAsync.mockResolvedValue({
      granted: true,
    } as Notifications.NotificationPermissionsStatus);

    await expect(
      scheduleDailyReminder({ body: 'Body', title: 'Title' })
    ).resolves.toBe(true);
    expect(
      mockedNotifications.cancelAllScheduledNotificationsAsync
    ).toHaveBeenCalledTimes(1);
    expect(mockedNotifications.scheduleNotificationAsync).toHaveBeenCalledWith(
      expect.objectContaining({
        content: { body: 'Body', title: 'Title' },
      })
    );
  });

  it('cancels all scheduled reminders', async () => {
    await cancelDailyReminder();

    expect(
      mockedNotifications.cancelAllScheduledNotificationsAsync
    ).toHaveBeenCalledTimes(1);
  });
});
