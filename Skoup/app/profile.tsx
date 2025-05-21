// app/profile.tsx
import { Entypo, FontAwesome5, Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Buffer } from 'buffer';
import { useFocusEffect, useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Dimensions,
  Image,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { useAuth } from './_layout';

const API_BASE = 'http://192.168.193.45:5431'; // Update with your server address

import { LineChart } from 'react-native-chart-kit';

const AVATAR_KEY = '@user_avatar';
const { width } = Dimensions.get('window');
const bannerStyles = {banner_1: null, banner_2: 'https://i.ibb.co/7J5WR0xL/trash-banner-1.png'};
export default function Profile() {
  const router = useRouter();

  const [menuVisible, setMenuVisible] = useState(false);
  const toggleMenu = () => setMenuVisible(v => !v);


  // User profile state
  const { token } = useAuth();
  const [avatarUri, setAvatarUri] = useState<string>('');
  const [profileName, setProfileName] = useState<string>('');

  const [coins, setCoins] = useState<number>(0);
  const [trashCollected, setTrashCollected] = useState<number>(0);

  const [dailyCounts, setDailyCounts] = useState<number[]>([]);
  const [weeklyCounts, setWeeklyCounts] = useState<number[]>([]);
  const [monthlyCounts, setMonthlyCounts] = useState<number[]>([]);
  const { level, progress, goal } = getLevelAndProgress(trashCollected);

  const [leaderboard, setLeaderboard] = useState<any[]>([]);
  const [loadingLeaderboard, setLoadingLeaderboard] = useState(false);
  const [leaderboardError, setLeaderboardError] = useState<string | null>(null);

  function getLevelAndProgress(trashCollected: number) {
    const level = Math.floor(trashCollected / 50) + 1;
    const goal = level * 50;
    const progress = (trashCollected % 50) / 50; // 0 to 1
    return { level, progress, goal };
  }
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
          // Update coin count
          if (typeof data.coin === 'number') {
            setCoins(data.coin);
          }
          // Update trash collected count
          if (typeof data.trash_collected === 'number') {
            setTrashCollected(data.trash_collected);
          }
        })
        .catch(console.error);
      // Still load chart history from AsyncStorage
      AsyncStorage.getItem('@daily_history').then(v => setDailyCounts(v ? JSON.parse(v) : []));
      AsyncStorage.getItem('@weekly_history').then(v => setWeeklyCounts(v ? JSON.parse(v) : []));
      AsyncStorage.getItem('@monthly_history').then(v => setMonthlyCounts(v ? JSON.parse(v) : []));
    }, [token])
  );

  const [selectedTab, setSelectedTab] = useState<'Me' | 'Leaderboard'>('Me');
  const [tag, setTag] = useState<string>('');
  useEffect(() => {
    const randomTag = Math.random()
      .toString(36)
      .substring(2, 10)
      .toUpperCase();
    setTag('#' + randomTag);
  }, []);

  useEffect(() => {
    if (selectedTab !== 'Leaderboard') return;
    setLoadingLeaderboard(true);
    setLeaderboardError(null);
    setLeaderboard([]);
    fetch(`${API_BASE}/users/nearby`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ radius: 1 }),
    })
      .then(res => res.json())
      .then(async (resp: { nearby_user_ids: string[] }) => {
        let ids = resp.nearby_user_ids || [];
        // Always include the current user
        let meId = null;
        try {
          const meRes = await fetch(`${API_BASE}/users/me`, {
            headers: { Authorization: `Bearer ${token}` },
          });
          const meData = await meRes.json();
          meId = meData.id;
          if (meId && !ids.includes(meId)) ids = [meId, ...ids];
        } catch {}
        if (!Array.isArray(ids) || ids.length === 0) {
          setLeaderboard([]);
          setLoadingLeaderboard(false);
          return;
        }
        // Fetch all user profiles in parallel
        const userProfiles = await Promise.all(
          ids.map(async id => {
            try {
              const res = await fetch(`${API_BASE}/users/${id}`, {
                headers: { Authorization: `Bearer ${token}` },
              });
              const data = await res.json();
              // Fetch avatar
              let avatarUri = '';
              try {
                const avatarRes = await fetch(`${API_BASE}/users/${id}/avatar?t=${Date.now()}`, {
                  headers: { Authorization: `Bearer ${token}` },
                });
                if (avatarRes.ok) {
                  const buffer = await avatarRes.arrayBuffer();
                  avatarUri = `data:image/png;base64,${Buffer.from(buffer).toString('base64')}`;
                }
              } catch {}
              return {
                id,
                username: data.username,
                banner: bannerStyles[data.equipped_items.find(item => item.startsWith("banner_")) || "banner_1"],
                trash_collected: data.trash_collected || 0,
                avatarUri,
                isMe: id === meId,
              };
            } catch {
              return null;
            }
          })
        );
        // Filter out nulls and sort by trash_collected desc
        const sorted = userProfiles.filter(Boolean).sort((a, b) => (b!.trash_collected - a!.trash_collected));
        setLeaderboard(sorted as any[]);
        setLoadingLeaderboard(false);
      })
      .catch(() => {
        setLeaderboard([]);
        setLeaderboardError('Failed to load leaderboard.');
        setLoadingLeaderboard(false);
      });
  }, [selectedTab, token]);

  const PIECE_WEIGHT_KG = 0.05;
  const CO2_PER_KG = 2.5;
  const WATER_PER_KG = 10;
  const totalPieces = trashCollected;
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
          {(['Me', 'Leaderboard'] as const).map(tab => (
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
                <FontAwesome5 name="coins" size={20} color="#FFD700" />
                <Text style={styles.coinText}>{coins}</Text>
              </View>
            </View>

            {/* Avatar */}
            <TouchableOpacity
              style={styles.avatarWrapper}
              onPress={() => router.push('/edit-avatar')}
            >
              {!avatarUri && (
                <ActivityIndicator size="large" color="#007bff" style={styles.avatarLoader} />
              )}
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
                <Text style={styles.levelNumber}>{level}</Text>
                <Text style={styles.levelLabel}>LEVEL</Text>
              </View>
              <View style={{ flex: 1 }}>
                <View
                  style={[
                    styles.progressBar,
                    progress >= 1 && { backgroundColor: '#fff', borderWidth: 1, borderColor: '#000' },
                  ]}
                >
                  <View
                    style={[
                      styles.progressFill,
                      {
                        width: `${progress * 100}%`,
                      },
                    ]}
                  />
                  <Text
                    style={[
                      styles.progressCenterText,
                      progress >= 0.5 && { color: '#fff' },
                    ]}
                  >
                    {trashCollected} / {goal}
                  </Text>
                </View>
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
                  labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
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
                  labels: ['Wk1', 'Wk2', 'Wk3', 'Wk4'],
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
                  labels: ['M1', 'M2', 'M3', 'M4', 'M5', 'M6'],
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
          loadingLeaderboard ? (
            <ActivityIndicator size="large" color="#007bff" style={{ marginTop: 30 }} />
          ) : leaderboardError ? (
            <Text style={styles.genericText}>{leaderboardError}</Text>
          ) : leaderboard.length === 0 ? (
            <Text style={styles.genericText}>No nearby users found.</Text>
          ) : (
            <ScrollView style={{ width: '100%' }} contentContainerStyle={{ paddingVertical: 10 }}>
              {leaderboard.map((user, idx) => (
  <View
    key={user.id}
    style={[
      styles.sectionCard,
      {
        marginBottom: 14,
        padding: 0,
        overflow: 'hidden',
        backgroundColor: user.banner ? 'transparent' : '#fff',
      },
    ]}
  >
    {/* Banner Background (if any) */}
    {user.banner && (
      <Image
        source={{ uri: user.banner }}
        style={{
          ...StyleSheet.absoluteFillObject,
          resizeMode: 'cover',
        }}
      />
    )}

    {/* Dark overlay to enhance text readability */}
    {user.banner && (
      <View
        style={{
          ...StyleSheet.absoluteFillObject,
          backgroundColor: 'rgba(0,0,0,0.3)',
        }}
      />
    )}

    {/* Content */}
    <View style={{ flexDirection: 'row', alignItems: 'center', padding: 16 }}>
      {/* Avatar */}
      <View style={{ marginRight: 16 }}>
        <Image
          source={
            user.avatarUri
              ? { uri: user.avatarUri }
              : require('../assets/avatar-placeholder.jpg')
          }
          style={{
            width: 56,
            height: 56,
            borderRadius: 28,
            borderWidth: 2,
            borderColor: '#007bff',
            backgroundColor: '#EEE',
          }}
        />
      </View>

      {/* User Info */}
      <View style={{ flex: 1 }}>
        <Text
          style={{
            fontSize: 18,
            fontWeight: user.isMe ? 'bold' : '600',
            color: user.banner ? '#fff' : '#333',
          }}
        >
          {user.username || 'Unknown'} {user.isMe ? '(You)' : ''}
        </Text>
        <Text
          style={{
            fontSize: 14,
            color: user.banner ? '#e2e8f0' : '#2C7A7B',
            marginTop: 2,
          }}
        >
          {user.trash_collected} items
        </Text>
      </View>

      {/* Rank Number */}
      <View
        style={{
          width: 32,
          height: 32,
          borderRadius: 16,
          backgroundColor: '#007bff',
          justifyContent: 'center',
          alignItems: 'center',
          marginLeft: 10,
        }}
      >
        <Text style={{ color: '#fff', fontWeight: 'bold', fontSize: 16 }}>
          {idx + 1}
        </Text>
      </View>
    </View>
  </View>
))}


            </ScrollView>
          )
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
    flexDirection: 'row',
    alignItems: 'center',
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
    height: 28, // taller bar
    backgroundColor: '#EEE', // default black
    borderRadius: 14,
    overflow: 'hidden',
    flexDirection: 'row',
    alignItems: 'center',
    position: 'relative',
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#007bff',
  },

  leaderBoardSection: { flex: 1, justifyContent: 'center', alignItems: 'center' },
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
  progressCenterText: {
    position: 'absolute',
    left: 0,
    right: 0,
    textAlign: 'center',
    color: '#000',
    fontWeight: 'bold',
    fontSize: 16,
    zIndex: 2,
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