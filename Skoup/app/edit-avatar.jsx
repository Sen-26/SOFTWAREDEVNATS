// app/edit-avatar.tsx
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Buffer } from 'buffer';
import * as ImagePicker from 'expo-image-picker';
import { useFocusEffect, useRouter } from 'expo-router';
import { useCallback, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Button,
  Image,
  StyleSheet,
  TouchableOpacity,
  View
} from 'react-native';
// import * as FileSystem from 'expo-file-system';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from './_layout';
const API_BASE = 'http://192.168.193.45:5431';

const AVATAR_KEY = '@user_avatar';

export default function EditAvatarScreen() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [previewUri, setPreviewUri] = useState(null);
  const { token } = useAuth();

  useFocusEffect(
      useCallback(() => {
        fetch(`${API_BASE}/users/me`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            ...(token ? { Authorization: `Bearer ${token}` } : {}),
          },
        })
          .then(res => res.json())
          .then(data => {
            const endpoint = `${API_BASE}/users/${data.id}/avatar?t=${Date.now()}`;
          // Fetch raw image bytes and convert to base64 data URI
          fetch(endpoint, {
            headers: { Authorization: `Bearer ${token}` },
          })
            .then(res => res.arrayBuffer())
            .then(buffer => {
              const b64 = Buffer.from(buffer).toString('base64');
              setPreviewUri(`data:image/png;base64,${b64}`);
            })
            .catch(console.error);
          })
          .catch(console.error);
      }, [token])
    );

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
    console.log('Uploading to:', `${API_BASE}/users/me/avatar`);
    console.log('File URI:', previewUri);
    if (!previewUri) {
      Alert.alert('No Image', 'Pick or take a photo first.');
      return;
    }
    setLoading(true);
    const formData = new FormData();
    formData.append('file', {
      uri: previewUri,
      name: 'avatar.jpg',
      type: 'image/jpeg',
    });
    try {
      const response = await fetch(`${API_BASE}/users/me/avatar`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'multipart/form-data',
        },
        body: formData,
      });
      console.log('Response status:', response.status);
      const json = await response.json();
      if (json.avatar_url) {
        await AsyncStorage.setItem(AVATAR_KEY, json.avatar_url);
      }
      router.back();
    } catch (err) {
      console.error('Upload failed', err);
      Alert.alert('Error', 'Could not upload avatar.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <TouchableOpacity
        style={styles.closeIcon}
        onPress={() => router.back()}
      >
        <Ionicons name="close" size={28} color="#333" />
      </TouchableOpacity>
       {!previewUri && (
                      <ActivityIndicator size="large" color="#007bff" style={styles.avatarLoader} />
                    )}
                    {previewUri ? (
                      <Image source={{ uri: previewUri }} style={styles.preview} />
                    ) : (
                      <Image
                        source={require('../assets/avatar-placeholder.jpg')}
                        style={styles.preview}
                      />
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