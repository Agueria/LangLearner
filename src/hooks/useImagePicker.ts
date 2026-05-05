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
        mediaTypes: ['images'],
        quality: 1,
      });

      if (result.canceled) {
        return null;
      }

      const asset = result.assets?.[0];

      if (!asset?.uri) {
        Alert.alert(i18n.t('errors.imagePickerTitle'), i18n.t('errors.noImage'));
        return null;
      }

      return asset.uri;
    } catch (error) {
      Alert.alert(
        i18n.t('errors.imagePickerTitle'),
        i18n.t('errors.imagePicker')
      );
      return null;
    }
  }, []);

  return { pickImage };
};
