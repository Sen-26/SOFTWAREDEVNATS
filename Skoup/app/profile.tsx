// app/profile.tsx
import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Image,
  StyleSheet,
  Dimensions,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useRouter, useFocusEffect } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

const AVATAR_KEY = '@user_avatar';
const { width } = Dimensions.get('window');

export default function Profile() {
  const router = useRouter();

  // Avatar URI state
  const [avatarUri, setAvatarUri] = useState<string | null>(null);

  // Reload avatar whenever screen is focused
  useFocusEffect(
    React.useCallback(() => {
      AsyncStorage.getItem(AVATAR_KEY).then(uri => {
        if (uri) setAvatarUri(uri);
      });
    }, [])
  );

  // Tab state and random tag
  const [selectedTab, setSelectedTab] = useState<'Me' | 'Friends'>('Me');
  const [tag, setTag] = useState<string>('');
  useEffect(() => {
    const randomTag = Math.random()
      .toString(36)
      .substring(2, 10)
      .toUpperCase();
    setTag('#' + randomTag);
  }, []);

  return (
    <View style={styles.container}>
      {/* Tabs */}
      <View style={styles.tabContainer}>
        {(['Me', 'Friends'] as const).map(tab => (
          <TouchableOpacity
            key={tab}
            style={[styles.tab, selectedTab === tab && styles.activeTab]}
            onPress={() => setSelectedTab(tab)}
          >
            <Text
              style={[
                styles.tabText,
                selectedTab === tab && styles.activeTabText,
              ]}
            >
              {tab}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {selectedTab === 'Me' ? (
        <View style={[styles.meSection, styles.sectionCard]}>
          {/* Header */}
          <View style={styles.header}>
            <View>
              <Text style={styles.profileName}>Pranav Kumar</Text>
              <Text style={styles.profileTag}>{tag}</Text>
            </View>
            <View style={styles.coinContainer}>
              <Text style={styles.coinText}>💰 1,234</Text>
            </View>
          </View>

          {/* Avatar */}
          <TouchableOpacity
            style={styles.avatarWrapper}
            onPress={() => router.push('/edit-avatar')}
          >
            {avatarUri ? (
              <Image source={{ uri: avatarUri }} style={styles.avatar} />
            ) : (
              <Image
                source={require('../assets/avatar-placeholder.jpg')}
                style={styles.avatar}
              />
            )}
          </TouchableOpacity>

          {/* Level Section */}
          <View style={styles.levelSection}>
            <View style={styles.levelInfo}>
              <Text style={styles.levelNumber}>5</Text>
              <Text style={styles.levelLabel}>LEVEL</Text>
            </View>
            <View style={styles.progressBar}>
              <View style={[styles.progressFill, { width: '70%' }]} />
            </View>
          </View>
        </View>
      ) : (
        <View style={[styles.friendsSection, styles.sectionCard]}>
          <Text style={styles.genericText}>Friend list goes here</Text>
        </View>
      )}

      {/* Return to Map */}
      <TouchableOpacity
        style={styles.backButton}
        onPress={() => router.push('/')}
      >
        <Ionicons name="leaf-outline" size={32} color="white" />
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FFF', paddingHorizontal: 20, paddingTop: 40, paddingBottom: 20 },
  tabContainer: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderColor: '#EEE',
    marginVertical: 30,
    justifyContent: 'space-between',
  },
  tab: {
    flex: 1,
    paddingVertical: 16,
    alignItems: 'center',
  },
  activeTab: {
    borderBottomWidth: 3,
    borderColor: '#007bff',
  },
  tabText: { fontSize: 18, color: '#555' },
  activeTabText: { color: '#007bff', fontWeight: 'bold', fontSize: 18 },

  meSection: { flex: 1 },
  sectionCard: {
    backgroundColor: '#fff',
    padding: 20,
    marginBottom: 20,
    borderRadius: 12,
    // iOS shadow
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 8,
    // Android shadow
    elevation: 3,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  profileName: { 
    fontSize: 30, 
    fontWeight: 'bold', 
    color: '#333' 
  },
  profileTag: { 
    fontSize: 18, 
    color: '#888', 
    marginTop: 6 
  },
  coinContainer: {
    backgroundColor: '#f0f0f0',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  coinText: { fontSize: 16, color: '#333' },

  avatarWrapper: {
    alignSelf: 'center',
    marginBottom: 20,
  },
  avatar: {
    width: 220,
    height: 220,
    borderRadius: 120,
    borderWidth: 3,
    borderColor: '#007bff',
  },

  levelSection: {
    marginTop: 20,
    flexDirection: 'row',
    alignItems: 'center',
  },
  levelInfo: {
    alignItems: 'center',
    marginRight: 12,
  },
  levelNumber: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#333',
  },
  levelLabel: {
    fontSize: 14,
    color: '#666',
    marginTop: 4,
  },
  progressBar: {
    width: width - 125,
    height: 16,
    backgroundColor: '#EEE',
    borderRadius: 8,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#007bff',
  },

  friendsSection: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  genericText: { fontSize: 16, color: '#666' },

  backButton: {
    position: 'absolute',
    bottom: 30,
    right: 20,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#28a745',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.3,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 4,
    elevation: 5,
  },
});