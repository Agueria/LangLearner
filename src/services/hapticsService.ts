import * as Haptics from 'expo-haptics';

// Haptics fonksiyonlari kucuk wrapper'lar olarak tutuldu.
// Boylece ekranlar Expo enum detaylarini bilmez; sadece "correct",
// "incorrect" veya "light" feedback ister.
export const playCorrectHaptic = async () => {
  await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
};

export const playIncorrectHaptic = async () => {
  await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
};

export const playLightHaptic = async () => {
  await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
};
