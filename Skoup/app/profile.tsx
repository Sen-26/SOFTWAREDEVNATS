// app/profile.tsx
import React, { useState, useEffect } from 'react';
import {
  View,
  ScrollView,
  Text,
  TouchableOpacity,
  Image,
  StyleSheet,
  Dimensions,
  ActivityIndicator,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Ionicons } from '@expo/vector-icons';
import { Entypo } from '@expo/vector-icons';
import { useRouter, useFocusEffect } from 'expo-router';
import { useAuth } from './_layout';
import { Buffer } from 'buffer';

const API_BASE = 'http://192.168.193.45:5431'; // Update with your server address

import { LineChart } from 'react-native-chart-kit';

const AVATAR_KEY = '@user_avatar';
const COIN_KEY = '@user_coins';
const { width } = Dimensions.get('window');

export default function Profile() {
  const router = useRouter();

  const [menuVisible, setMenuVisible] = useState(false);
  const toggleMenu = () => setMenuVisible(v => !v);

  // User profile state
  const { token } = useAuth();
  const [avatarUri, setAvatarUri] = useState<string>('');
  const [profileName, setProfileName] = useState<string>('');

  const [coins, setCoins] = useState<number>(0);

  const [dailyCounts, setDailyCounts] = useState<number[]>([]);
  const [weeklyCounts, setWeeklyCounts] = useState<number[]>([]);
  const [monthlyCounts, setMonthlyCounts] = useState<number[]>([]);

  useFocusEffect(
    React.useCallback(() => {
      fetch(`${API_BASE}/users/me`, {
        headers: { Authorization: `Bearer ${token}` },
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
              setAvatarUri(`data:image/png;base64,${b64}`);
            })
            .catch(console.error);
          if (data.username) setProfileName(data.username);
        })
        .catch(console.error);
      AsyncStorage.getItem(COIN_KEY).then(value => {
        if (value) setCoins(parseInt(value, 10));
      });
      AsyncStorage.getItem('@daily_history').then(v => setDailyCounts(v ? JSON.parse(v) : []));
      AsyncStorage.getItem('@weekly_history').then(v => setWeeklyCounts(v ? JSON.parse(v) : []));
      AsyncStorage.getItem('@monthly_history').then(v => setMonthlyCounts(v ? JSON.parse(v) : []));
    }, [token])
  );

  const [selectedTab, setSelectedTab] = useState<'Me' | 'Friends'>('Me');
  const [tag, setTag] = useState<string>('');
  useEffect(() => {
    const randomTag = Math.random()
      .toString(36)
      .substring(2, 10)
      .toUpperCase();
    setTag('#' + randomTag);
  }, []);

  const PIECE_WEIGHT_KG = 0.05;
  const CO2_PER_KG = 2.5;
  const WATER_PER_KG = 10;
  const totalPieces = coins;
  const totalWeight = (totalPieces * PIECE_WEIGHT_KG).toFixed(1);
  const totalCO2 = (parseFloat(totalWeight) * CO2_PER_KG).toFixed(1);
  const totalWater = (parseFloat(totalWeight) * WATER_PER_KG).toFixed(0);
  const chartWidth = width - 40;

  return (
    <View style={styles.container}>
      {/* Hamburger Menu */}
      <TouchableOpacity
        style={styles.menuButton}
        onPress={toggleMenu}
      >
        <Entypo name="menu" size={28} color="#333" />
      </TouchableOpacity>
      {menuVisible && (
        <View style={styles.dropdownMenu}>
          <TouchableOpacity
            style={styles.dropdownItem}
            onPress={() => { toggleMenu(); router.push('/'); }}
          >
            <Ionicons name="home-outline" size={20} color="#333" style={styles.dropdownIcon} />
            <Text style={styles.dropdownText}>Home</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.dropdownItem}
            onPress={() => { toggleMenu(); router.push('/profile'); }}
          >
            <Ionicons name="person-outline" size={20} color="#333" style={styles.dropdownIcon} />
            <Text style={styles.dropdownText}>Profile</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.dropdownItem}
            onPress={() => { toggleMenu(); router.push('/shop'); }}
          >
            <Ionicons name="storefront-outline" size={20} color="#333" style={styles.dropdownIcon} />
            <Text style={styles.dropdownText}>Shop</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.dropdownItem}
            onPress={() => { toggleMenu(); /* add settings route if exists */ }}
          >
            <Ionicons name="settings-outline" size={20} color="#333" style={styles.dropdownIcon} />
            <Text style={styles.dropdownText}>Settings</Text>
          </TouchableOpacity>
        </View>
      )}
      <ScrollView
        style={styles.scrollContainer}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
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
                <Text style={styles.profileName}>{profileName}</Text>
                <Text style={styles.profileTag}>{tag}</Text>
              </View>
              <View style={styles.coinContainer}>
                <Text style={styles.coinText}>💰 {coins}</Text>
              </View>
            </View>

            {/* Avatar */}
            <TouchableOpacity
              style={styles.avatarWrapper}
              onPress={() => router.push('/edit-avatar')}
            >
              { !avatarUri && (
                <ActivityIndicator size="large" color="#007bff" style={styles.avatarLoader} />
              ) }
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

            {/* Impact Dashboard */}
            <View style={styles.dashboardSection}>
              <Text style={styles.dashboardHeader}>Your Impact</Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.dashboardCards}>
                <View style={styles.metricCard}>
                  <Text style={styles.metricTitle}>Total Collected</Text>
                  <Text style={styles.metricValue}>{totalPieces} items</Text>
                  <Text style={styles.metricSub}>{totalWeight} kg</Text>
                </View>
                <View style={styles.metricCard}>
                  <Text style={styles.metricTitle}>CO₂ Offset</Text>
                  <Text style={styles.metricValue}>{totalCO2} kg</Text>
                  <Text style={styles.metricSub}>Equivalent</Text>
                </View>
                <View style={styles.metricCard}>
                  <Text style={styles.metricTitle}>Water Saved</Text>
                  <Text style={styles.metricValue}>{totalWater} L</Text>
                  <Text style={styles.metricSub}>Equivalent</Text>
                </View>
              </ScrollView>
              <Text style={styles.chartLabel}>Last 7 Days</Text>
              <LineChart
                data={{
                  labels: ['Mon','Tue','Wed','Thu','Fri','Sat','Sun'],
                  datasets: [{ data: dailyCounts.length ? dailyCounts : Array(7).fill(0) }],
                }}
                width={chartWidth}
                height={160}
                chartConfig={styles.chartConfig}
                bezier
                style={styles.chartStyle}
              />
              <Text style={styles.chartLabel}>Last 4 Weeks</Text>
              <LineChart
                data={{
                  labels: ['Wk1','Wk2','Wk3','Wk4'],
                  datasets: [{ data: weeklyCounts.length ? weeklyCounts : Array(4).fill(0) }],
                }}
                width={chartWidth}
                height={140}
                chartConfig={styles.chartConfig}
                style={styles.chartStyle}
              />
              <Text style={styles.chartLabel}>Last 6 Months</Text>
              <LineChart
                data={{
                  labels: ['M1','M2','M3','M4','M5','M6'],
                  datasets: [{ data: monthlyCounts.length ? monthlyCounts : Array(6).fill(0) }],
                }}
                width={chartWidth}
                height={140}
                chartConfig={styles.chartConfig}
                style={styles.chartStyle}
              />
            </View>
          </View>
        ) : (
          <View style={[styles.friendsSection, styles.sectionCard]}>
            <Text style={styles.genericText}>Friend list goes here</Text>
          </View>
        )}
      </ScrollView>

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
  menuButton: {
    position: 'absolute',
    top: 40,
    left: 20,
    backgroundColor: 'rgba(255,255,255,0.9)',
    padding: 8,
    borderRadius: 20,
    zIndex: 10,
  },
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
  avatarLoader: {
    position: 'absolute',
    top: '45%',
    left: '45%',
    zIndex: 1,
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
  dashboardSection: {
    marginTop: 30,
  },
  dashboardHeader: {
    fontSize: 22,
    fontWeight: '700',
    color: '#333',
    marginBottom: 12,
  },
  dashboardCards: {
    flexDirection: 'row',
    marginBottom: 16,
  },
  metricCard: {
    backgroundColor: '#F7FAFC',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    marginRight: 16,
    width: 140,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 8,
    elevation: 3,
  },
  metricTitle: {
    fontSize: 14,
    color: '#4A5568',
    marginBottom: 4,
  },
  metricValue: {
    fontSize: 18,
    fontWeight: '700',
    color: '#2C7A7B',
  },
  metricSub: {
    fontSize: 12,
    color: '#666',
    marginTop: 2,
  },
  chartLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginTop: 16,
    marginLeft: 2,
  },
  chartStyle: {
    marginVertical: 8,
    borderRadius: 12,
    paddingBottom: 5,    // ensure x-axis labels are not cut off
  },
  chartConfig: {
    backgroundGradientFrom: '#fff',
    backgroundGradientTo: '#fff',
    color: opacity => `rgba(44, 122, 123, ${opacity})`,
    labelColor: opacity => `rgba(31, 41, 55, ${opacity})`,
    propsForDots: { r: '5', strokeWidth: '2', stroke: '#2C7A7B' },
  },
  dropdownMenu: {
    position: 'absolute',
    top: 80,
    left: 20,
    width: 180,
    backgroundColor: '#fff',
    borderRadius: 8,
    paddingVertical: 8,
    // iOS shadow
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 8,
    // Android
    elevation: 5,
    zIndex: 10,
  },
  dropdownItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#EEE',
  },
  dropdownIcon: {
    marginRight: 12,
  },
  dropdownText: {
    color: '#333',
    fontSize: 16,
    fontWeight: '500',
  },
  scrollContainer: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 100, // space for back button
  },
});