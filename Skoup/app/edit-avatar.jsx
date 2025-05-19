// app/edit-avatar.tsx
import React, { useState, useEffect } from 'react';
import {
  View,
  Button,
  Image,
  StyleSheet,
  Alert,
  ActivityIndicator,
  TouchableOpacity,
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useRouter } from 'expo-router';
import * as FileSystem from 'expo-file-system';
import { Ionicons } from '@expo/vector-icons';

const AVATAR_KEY = '@user_avatar';

export default function EditAvatarScreen() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [previewUri, setPreviewUri] = useState(null);

  useEffect(() => {
    AsyncStorage.getItem(AVATAR_KEY).then(uri => {
      if (uri) setPreviewUri(uri);
    });
  }, []);

  const pickImage = async () => {
    setLoading(true);
    try {
      const { status } =
        await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permission required', 'Enable photos access.');
        setLoading(false);
        return;
      }
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.7,
      });
      if (!result.canceled && result.assets && result.assets.length > 0) {
        setPreviewUri(result.assets[0].uri);
      }
    } catch (e) {
      console.error(e);
      Alert.alert('Error', 'Could not open image picker.');
    } finally {
      setLoading(false);
    }
  };

  const takePhoto = async () => {
    setLoading(true);
    try {
      const { status } =
        await ImagePicker.requestCameraPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permission required', 'Enable camera access.');
        setLoading(false);
        return;
      }
      const result = await ImagePicker.launchCameraAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.7,
      });
      if (!result.canceled && result.assets && result.assets.length > 0) {
        setPreviewUri(result.assets[0].uri);
      }
    } catch (e) {
      console.error(e);
      Alert.alert('Error', 'Could not open camera.');
    } finally {
      setLoading(false);
    }
  };

  const saveAvatar = async () => {
    setLoading(true);
    if (!previewUri) {
      Alert.alert('No Image', 'Pick or take a photo first.');
      setLoading(false);
      return;
    }

    // Prepare destination path
    const fileName = previewUri.split('/').pop();
    const dest = FileSystem.documentDirectory + fileName;

    // Try to copy into permanent storage, ignore all errors
    try {
      const fileInfo = await FileSystem.getInfoAsync(dest);
      if (fileInfo.exists) {
        await FileSystem.deleteAsync(dest, { idempotent: true });
      }
      await FileSystem.copyAsync({ from: previewUri, to: dest });
      await AsyncStorage.setItem(AVATAR_KEY, dest);
    } catch {
      // intentionally ignore any save errors
    }

    setLoading(false);
    router.back();
  };

  return (
    <View style={styles.container}>
      <TouchableOpacity
        style={styles.closeIcon}
        onPress={() => router.back()}
      >
        <Ionicons name="close" size={28} color="#333" />
      </TouchableOpacity>
      {loading && <ActivityIndicator size="large" color="#007bff" />}
      {previewUri && (
         <Image source={{ uri: previewUri }} style={styles.preview} />
      )}
      <View style={styles.buttonRow}>
        <Button title="Choose from Library" onPress={pickImage} />
        <Button title="Take Photo" onPress={takePhoto} />
      </View>
      <Button
        title="Save Avatar"
        onPress={saveAvatar}
        disabled={!previewUri || loading}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#FFF',
    justifyContent: 'center',
  },
  preview: {
    width: 200,
    height: 200,
    borderRadius: 100,
    alignSelf: 'center',
    marginBottom: 20,
    borderWidth: 2,
    borderColor: '#007bff',
  },
  buttonRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 20,
  },
  closeIcon: {
    position: 'absolute',
    top: 70,
    left: 20,
    width: 36,
    height: 36,
    justifyContent: 'center',
    alignItems: 'center',
  },
});