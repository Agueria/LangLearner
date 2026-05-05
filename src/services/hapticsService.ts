import * as Haptics from 'expo-haptics';

export const playCorrectHaptic = async () => {
  await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
};

export const playIncorrectHaptic = async () => {
  await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
};

export const playLightHaptic = async () => {
  await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
};
