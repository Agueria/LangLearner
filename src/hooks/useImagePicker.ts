import { useCallback } from 'react';
import { Alert } from 'react-native';
import * as ImagePicker from 'expo-image-picker';

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
          'Permission needed',
          'Please allow photo access to choose a cover photo.'
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
        Alert.alert('Image picker error', 'No image was selected.');
        return null;
      }

      return asset.uri;
    } catch (error) {
      Alert.alert(
        'Image picker error',
        'Something went wrong while selecting an image.'
      );
      return null;
    }
  }, []);

  return { pickImage };
};
