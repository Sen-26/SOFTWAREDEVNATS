// app/shop.tsx
import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  FlatList,
  Image,
  Dimensions,
  ScrollView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

const { width } = Dimensions.get('window');

type Tab = 'Challenges' | 'Streaks' | 'Achievements' | 'Shop';

export default function ShopPage() {
  const [selectedTab, setSelectedTab] = useState<Tab>('Challenges');

  const renderChallenges = () => (
    <ScrollView contentContainerStyle={styles.content}>
      <View style={styles.card}>
        <View style={styles.cardHeader}>
          <Ionicons name="sunny-outline" size={20} color="#007bff" />
          <Text style={styles.cardTitle}>Daily Missions</Text>
        </View>
        <Text style={styles.cardText}>• Pick 10 pieces of trash today</Text>
        <Text style={styles.cardText}>• Earn 20 coins for completion</Text>
      </View>
      <View style={styles.card}>
        <View style={styles.cardHeader}>
          <Ionicons name="calendar-outline" size={20} color="#007bff" />
          <Text style={styles.cardTitle}>Weekly Missions</Text>
        </View>
        <Text style={styles.cardText}>• Clean 50 items this week</Text>
        <Text style={styles.cardText}>• Earn 150 coins for completion</Text>
      </View>
      <View style={styles.card}>
        <View style={styles.cardHeader}>
          <Ionicons name="location-outline" size={20} color="#007bff" />
          <Text style={styles.cardTitle}>Nearby Hotspot</Text>
        </View>
        <Text style={styles.cardText}>• Central Park: Collect 5 items</Text>
        <Text style={styles.cardText}>• Earn 30 coins and badge</Text>
      </View>
    </ScrollView>
  );

  const renderStreaks = () => (
    <View style={styles.content}>
      <View style={styles.streakCard}>
        <View style={styles.streakCircle}>
          <Text style={styles.streakNumber}>7</Text>
        </View>
        <Text style={styles.streakLabel}>DAY STREAK</Text>
      </View>
      <Text style={styles.sectionText}>
        Keep up your daily cleanup activity to build streaks and unlock exclusive rewards.
      </Text>
    </View>
  );

  const renderAchievements = () => (
    <ScrollView contentContainerStyle={styles.content}>
      <View style={styles.card}>
        <View style={styles.cardHeader}>
          <Ionicons name="trophy-outline" size={20} color="#007bff" />
          <Text style={styles.cardTitle}>100 Pieces Collected</Text>
        </View>
        <Text style={styles.cardText}>Unlocked on May 10, 2025</Text>
      </View>
      <View style={styles.card}>
        <View style={styles.cardHeader}>
          <Ionicons name="trophy-outline" size={20} color="#007bff" />
          <Text style={styles.cardTitle}>30-Day Streak</Text>
        </View>
        <Text style={styles.cardText}>Unlocked on May 5, 2025</Text>
      </View>
      <View style={styles.card}>
        <View style={styles.cardHeader}>
          <Ionicons name="trophy-outline" size={20} color="#007bff" />
          <Text style={styles.cardTitle}>Community Hero</Text>
        </View>
        <Text style={styles.cardText}>Helped organize 3 events</Text>
      </View>
    </ScrollView>
  );

  const shopItems = [
    {
      id: '1',
      name: 'Eco Gloves',
      cost: 100,
      image: 'https://i.imgur.com/OY1T8KX.png',
    },
    {
      id: '2',
      name: 'Cleanup Badge',
      cost: 200,
      image: 'https://i.imgur.com/BT0Q3qT.png',
    },
    {
      id: '3',
      name: 'Seed Bomb Pack',
      cost: 150,
      image: 'https://i.imgur.com/3V6JjNy.png',
    },
    {
      id: '4',
      name: 'Reusable Bag',
      cost: 120,
      image: 'https://i.imgur.com/1Jp3Q7a.png',
    },
  ];

  const renderShop = () => (
    <FlatList
      contentContainerStyle={styles.content}
      data={shopItems}
      keyExtractor={item => item.id}
      numColumns={2}
      renderItem={({ item }) => (
        <View style={styles.shopCard}>
          <Image source={{ uri: item.image }} style={styles.shopImage} />
          <Text style={styles.shopName}>{item.name}</Text>
          <Text style={styles.shopCost}>💎 {item.cost}</Text>
          <TouchableOpacity style={styles.buyButton}>
            <Text style={styles.buyButtonText}>Buy</Text>
          </TouchableOpacity>
        </View>
      )}
    />
  );

  const renderContent = () => {
    switch (selectedTab) {
      case 'Challenges':
        return renderChallenges();
      case 'Streaks':
        return renderStreaks();
      case 'Achievements':
        return renderAchievements();
      case 'Shop':
        return renderShop();
      default:
        return null;
    }
  };

  return (
    <View style={styles.container}>
      {/* Main content */}
      {renderContent()}

      {/* Bottom Tabs */}
      <View style={styles.tabs}>
        <TouchableOpacity
          style={styles.tab}
          onPress={() => setSelectedTab('Challenges')}
        >
          <Ionicons
            name="calendar-outline"
            size={24}
            color={selectedTab === 'Challenges' ? '#007bff' : '#666'}
          />
          <Text
            style={[
              styles.tabText,
              selectedTab === 'Challenges' && styles.tabTextActive,
            ]}
          >
            Challenges
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.tab}
          onPress={() => setSelectedTab('Streaks')}
        >
          <Ionicons
            name="flame-outline"
            size={24}
            color={selectedTab === 'Streaks' ? '#007bff' : '#666'}
          />
          <Text
            style={[
              styles.tabText,
              selectedTab === 'Streaks' && styles.tabTextActive,
            ]}
          >
            Streaks
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.tab}
          onPress={() => setSelectedTab('Achievements')}
        >
          <Ionicons
            name="trophy-outline"
            size={24}
            color={selectedTab === 'Achievements' ? '#007bff' : '#666'}
          />
          <Text
            style={[
              styles.tabText,
              selectedTab === 'Achievements' && styles.tabTextActive,
            ]}
          >
            Achievements
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.tab}
          onPress={() => setSelectedTab('Shop')}
        >
          <Ionicons
            name="cart-outline"
            size={24}
            color={selectedTab === 'Shop' ? '#007bff' : '#666'}
          />
          <Text
            style={[
              styles.tabText,
              selectedTab === 'Shop' && styles.tabTextActive,
            ]}
          >
            Shop
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F9FAFB' },
  content: {
    paddingVertical: 20,
    paddingHorizontal: 16,
  },
  // Cards
  card: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    // iOS shadow
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 8,
    // Android
    elevation: 3,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#111',
    marginLeft: 8,
  },
  cardText: { fontSize: 14, color: '#444', marginTop: 8 },

  streakCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 20,
    alignItems: 'center',
    margin: 16,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 8,
    elevation: 3,
  },
  streakCircle: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: '#007bff',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  streakNumber: {
    fontSize: 36,
    fontWeight: 'bold',
    color: '#fff',
  },
  streakLabel: {
    fontSize: 14,
    letterSpacing: 1,
    color: '#333',
  },
  sectionText: { fontSize: 16, color: '#333', paddingHorizontal: 16 },

  // Shop cards
  shopCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    width: (width - 48) / 2,
    margin: 8,
    padding: 12,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 8,
    elevation: 3,
  },
  shopImage: {
    width: 64,
    height: 64,
    resizeMode: 'contain',
    marginBottom: 12,
  },
  shopName: { fontSize: 16, fontWeight: '600', color: '#111', marginBottom: 8 },
  shopCost: { fontSize: 14, color: '#666', marginBottom: 12 },
  buyButton: {
    backgroundColor: '#28a745',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
  },
  buyButtonText: { color: '#fff', fontWeight: '600' },

  // Bottom tabs
  tabs: {
    flexDirection: 'row',
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
    backgroundColor: '#fff',
    paddingVertical: 8,
  },
  tab: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 12,
  },
  tabText: { fontSize: 12, color: '#666', marginTop: 4 },
  tabTextActive: { color: '#007bff', fontWeight: '600' },
});