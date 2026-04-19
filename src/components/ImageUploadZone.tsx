import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Image,
  StyleSheet,
  Alert,
  Platform,
  PermissionsAndroid,
  Linking,
} from 'react-native';
import {
  launchImageLibrary,
  type ImageLibraryOptions,
  type Asset,
} from 'react-native-image-picker';

interface ImageUploadZoneProps {
  onImageSelected: (
    uri: string,
    name: string,
    type: string,
    previewUri: string,
    width?: number,
    height?: number,
  ) => void;
  disabled?: boolean;
}

export function ImageUploadZone({
  onImageSelected,
  disabled = false,
}: ImageUploadZoneProps) {
  const [preview, setPreview] = useState<string | null>(null);
  const [fileName, setFileName] = useState<string | null>(null);

  const requestAndroidPermissions = async () => {
    if (Platform.OS !== 'android') {return true;}
    
    const permission = Platform.Version >= 33 
      ? PermissionsAndroid.PERMISSIONS.READ_MEDIA_IMAGES 
      : PermissionsAndroid.PERMISSIONS.READ_EXTERNAL_STORAGE;

    try {
      const hasPermission = await PermissionsAndroid.check(permission);
      if (hasPermission) {return true;}

      const status = await PermissionsAndroid.request(permission);

      if (status === PermissionsAndroid.RESULTS.GRANTED) {
        return true;
      }

      if (status === PermissionsAndroid.RESULTS.NEVER_ASK_AGAIN) {
        Alert.alert(
          'Permission Required',
          'Gallery access is permanently denied. Please enable it in system settings to select images.',
          [
            { text: 'Cancel', style: 'cancel' },
            { text: 'Open Settings', onPress: () => Linking.openSettings() },
          ],
        );
      }
      return false;
    } catch (err) {
      console.warn(err);
      return false;
    }
  };

  const handlePickImage = async () => {
    if (disabled) {return;}

    const hasPermission = await requestAndroidPermissions();
    if (!hasPermission) {
      Alert.alert('Permission Denied', 'Please grant gallery access to select images.');
      return;
    }

    const options: ImageLibraryOptions = {
      mediaType: 'photo',
      includeBase64: false,
      quality: 1,
      selectionLimit: 1,
    };

    launchImageLibrary(options, response => {
      if (response.didCancel) {return;}
      if (response.errorCode) {
        Alert.alert('Error', response.errorMessage || 'Failed to pick image');
        return;
      }

      const asset: Asset | undefined = response.assets?.[0];
      if (!asset || !asset.uri) {return;}

      const mimeType = asset.type || 'image/jpeg';
      if (!['image/jpeg', 'image/png', 'image/jpg'].includes(mimeType)) {
        Alert.alert('Invalid Format', 'Please select a JPEG or PNG image');
        return;
      }

      setPreview(asset.uri);
      setFileName(asset.fileName || 'image.jpg');
      onImageSelected(
        asset.uri,
        asset.fileName || 'image.jpg',
        mimeType,
        asset.uri,
        asset.width,
        asset.height,
      );
    });
  };

  const clearImage = () => {
    setPreview(null);
    setFileName(null);
  };

  return (
    <View style={styles.container}>
      {!preview ? (
        <TouchableOpacity
          style={[styles.uploadZone, disabled && styles.uploadZoneDisabled]}
          onPress={handlePickImage}
          disabled={disabled}
          activeOpacity={0.7}
        >
          {/* Upload icon area */}
          <View style={styles.iconContainer}>
            <Text style={styles.uploadIcon}>📤</Text>
          </View>
          <View style={styles.textContainer}>
            <Text style={styles.uploadTitle}>Tap to select an image</Text>
            <Text style={styles.uploadSubtitle}>from your device gallery</Text>
          </View>
          <Text style={styles.formatText}>Supported formats: JPEG, PNG</Text>
        </TouchableOpacity>
      ) : (
        <View style={styles.previewContainer}>
          <Image
            source={{ uri: preview }}
            style={styles.previewImage}
            resizeMode="contain"
          />
          <TouchableOpacity
            style={styles.clearButton}
            onPress={clearImage}
            disabled={disabled}
          >
            <Text style={styles.clearButtonText}>✕</Text>
          </TouchableOpacity>
          <View style={styles.fileNameBar}>
            <Text style={styles.fileNameText} numberOfLines={1}>
              {fileName}
            </Text>
          </View>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { width: '100%' },
  uploadZone: {
    borderWidth: 2,
    borderStyle: 'dashed',
    borderColor: '#475569', // slate-600
    borderRadius: 12,
    padding: 32,
    alignItems: 'center',
    gap: 12,
    backgroundColor: 'rgba(30, 41, 59, 0.5)', // slate-800/50
  },
  uploadZoneDisabled: {
    opacity: 0.5,
  },
  iconContainer: {
    width: 52,
    height: 52,
    borderRadius: 10,
    backgroundColor: 'rgba(79, 70, 229, 0.2)', // indigo-600/20
    alignItems: 'center',
    justifyContent: 'center',
  },
  uploadIcon: { fontSize: 22 },
  textContainer: { alignItems: 'center', gap: 4 },
  uploadTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#e2e8f0', // slate-200
  },
  uploadSubtitle: {
    fontSize: 12,
    color: '#94a3b8', // slate-400
  },
  formatText: {
    fontSize: 11,
    color: '#64748b', // slate-500
  },
  previewContainer: {
    borderRadius: 12,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(99, 102, 241, 0.5)', // indigo-600/50
    backgroundColor: '#1e293b', // slate-800
  },
  previewImage: {
    width: '100%',
    height: 280,
  },
  clearButton: {
    position: 'absolute',
    top: 8,
    right: 8,
    width: 32,
    height: 32,
    borderRadius: 8,
    backgroundColor: 'rgba(2, 6, 23, 0.9)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  clearButtonText: {
    color: '#cbd5e1',
    fontSize: 13,
    fontWeight: '700',
  },
  fileNameBar: {
    padding: 10,
    backgroundColor: 'rgba(2, 6, 23, 0.5)',
    borderTopWidth: 1,
    borderTopColor: '#334155', // slate-700
  },
  fileNameText: {
    fontSize: 11,
    color: '#94a3b8', // slate-400
  },
});
