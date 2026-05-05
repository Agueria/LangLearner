import '@testing-library/jest-native/extend-expect';

jest.mock('react-native-reanimated', () =>
  // eslint-disable-next-line global-require
  require('react-native-reanimated/mock')
);

jest.mock('expo-haptics', () => ({
  ImpactFeedbackStyle: { Light: 'Light' },
  NotificationFeedbackType: { Success: 'Success', Warning: 'Warning' },
  impactAsync: jest.fn(),
  notificationAsync: jest.fn(),
}));

jest.mock('expo-notifications', () => ({
  SchedulableTriggerInputTypes: { DAILY: 'daily' },
  cancelAllScheduledNotificationsAsync: jest.fn(),
  requestPermissionsAsync: jest.fn(),
  scheduleNotificationAsync: jest.fn(),
}));
