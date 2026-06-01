// Tabs layout for the main sections of the app.
import { Tabs } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { useThemeColors } from '../../src/hooks';

export default function TabsLayout() {
  const { t } = useTranslation();
  const colors = useThemeColors();

  return (
    <Tabs
      screenOptions={{
        // Tabs, React Navigation'in native chrome katmanidir. Ekranlar kendi
        // background rengini degistirse bile header ve tab bar otomatik tema
        // degistirmez; bu nedenle dark/light palette burada da uygulanir.
        headerStyle: {
          backgroundColor: colors.background,
        },
        headerTintColor: colors.text,
        headerTitleAlign: 'center',
        headerTitleStyle: {
          color: colors.text,
        },
        sceneStyle: {
          backgroundColor: colors.background,
        },
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.mutedText,
        tabBarStyle: {
          backgroundColor: colors.surface,
          borderTopColor: colors.border,
        },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: t('tabs.home'),
        }}
      />
      <Tabs.Screen
        name="decks"
        options={{
          title: t('tabs.decks'),
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: t('tabs.profile'),
        }}
      />
    </Tabs>
  );
}
