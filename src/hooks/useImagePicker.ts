import { useCallback } from 'react';
import { Alert } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import i18n from '../localization/i18n';

type UseImagePickerResult = {
  pickImage: () => Promise<string | null>;
};

export const useImagePicker = (): UseImagePickerResult => {
  const pickImage = useCallback(async (): Promise<string | null> => {
    try {
      // Galeri native izin gerektirir. Izin reddedilirse uygulama cokmez,
      // kullaniciya Alert ile aciklama gosterilir ve null donulur.
      const permissionResult =
        await ImagePicker.requestMediaLibraryPermissionsAsync();

      if (!permissionResult.granted) {
        Alert.alert(
          i18n.t('errors.permissionTitle'),
          i18n.t('errors.permissionMessage')
        );
        return null;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        // Sadece gorsel secimine izin veriyoruz; deck kapagi icin video gerekmez.
        mediaTypes: ['images'],
        quality: 1,
      });

      if (result.canceled) {
        // Kullanici galeriyi acip vazgecerse bu bir hata degildir.
        return null;
      }

      const asset = result.assets?.[0];

      if (!asset?.uri) {
        Alert.alert(i18n.t('errors.imagePickerTitle'), i18n.t('errors.noImage'));
        return null;
      }

      return asset.uri;
    } catch (error) {
      // Native API beklenmedik hata verirse generic fakat kullanici dostu bir
      // mesaj gosteriyoruz.
      Alert.alert(
        i18n.t('errors.imagePickerTitle'),
        i18n.t('errors.imagePicker')
      );
      return null;
    }
  }, []);

  return { pickImage };
};
