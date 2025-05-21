// app/shop.tsx
import React, { useState , useEffect} from 'react';
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
import axios from 'axios';
import { useAuth } from './_layout';
import { SafeAreaView } from 'react-native-safe-area-context';

const { width } = Dimensions.get('window');
const apiURL = "http://192.168.193.45:5431/";

type Tab = 'Challenges' | 'Streaks' | 'Achievements' | 'Shop';

export default function ShopPage() {
  const [selectedTab, setSelectedTab] = useState<Tab>('Challenges');

  const renderChallenges = () => (
    <SafeAreaView>
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
    </SafeAreaView>
  );

  const renderStreaks = () => (
    <SafeAreaView>
      <View style={styles.content}>
        <View style={styles.streakCard}>
          <View style={styles.streakCircle}>
            <Text style={styles.streakNumber}>{userStreak}</Text>
          </View>
          <Text style={styles.streakLabel}>DAY STREAK</Text>
        </View>
        <Text style={styles.sectionText}>
          Keep up your daily cleanup activity to build streaks and unlock exclusive rewards.
        </Text>
      </View>
    </SafeAreaView>
  );

  const renderAchievements = () => (
    <SafeAreaView>
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
    </SafeAreaView>
  );

  const shopItems = [
    {
      id: '1',
      displayName: 'Default Map',
      name: 'map_1',
      cost: 0,
      image: 'https://i.imgur.com/OY1T8KX.png',
    },
    {
      id: '2',
      displayName: 'Desert Adventure Map',

      name: 'map_2',
      cost: 30,
      image: 'https://i.imgur.com/BT0Q3qT.png',
    },
    {
      id: '3',
      displayName: 'Midnight Map',

      name: 'map_3',
      cost: 150,
      image: 'https://i.imgur.com/3V6JjNy.png',
    },
    {
      id: '4',
      displayName: 'Lime Green Map',

      name: 'map_4',
      cost: 120,
      image: 'https://i.imgur.com/1Jp3Q7a.png',
    },
    {
      id: '5',
      displayName: 'Default Banner',

      name: 'banner_1',
      cost: 0,
      image: 'https://i.imgur.com/1Jp3Q7a.png',
    },
    {
      id: '6',
      displayName: 'Trash Warrior Banner',

      name: 'banner_2',
      cost: 400,
      image: 'https://i.imgur.com/1Jp3Q7a.png',
    },
  ];
  const [userCoin, setUserCoin] = useState(0);
  const [userStreak, setUserStreak] = useState(0);
  const [unlockedItems, setUnlockedItems] = useState<string[]>([]);
  const {token} = useAuth(); // Replace with real token logic
  
  useEffect(() => {
    fetchUserData();
  }, []);
  const [equippedItems, setEquippedItems] = useState<string[]>([]);

  const fetchUserData = async () => {
    try {
      const res = await axios.get(apiURL+'users/me', {
        headers: { Authorization: `Bearer ${token}` },
      });
      setUserCoin(res.data.coin);
      setUnlockedItems(res.data.unlocked_items || []);
      setEquippedItems(res.data.equipped_items || []);
      setUserStreak(res.data.streak);
    } catch (err) {
      console.error('Failed to fetch user data', err);
    }
  };
  const equipItem = async (itemId: string) => {
    try {
      await axios.post(
        apiURL+'users/me/equip_item',
        { new_item: itemId },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      fetchUserData(); // Refresh both coin, unlocked, and equipped state
    } catch (err) {
      console.error('Failed to equip item', err);
      alert('Could not equip item.');
    }
  };
  
  const buyItem = async (item: typeof shopItems[0]) => {
    if (unlockedItems.includes(item.name)) {
      alert('You already own this item.');
      return;
    }
  
    if (userCoin < item.cost) {
      alert('Not enough coins!');
      return;
    }
  
    try {
      await axios.post(
        apiURL + 'users/me/coin',
        { amount: -item.cost },
        { headers: { Authorization: `Bearer ${token}` } }
      );
  
      await axios.post(
        apiURL + 'users/me/add_to_unlocked_items',
        { item: item.name },
        { headers: { Authorization: `Bearer ${token}` } }
      );
  
      alert(`${item.name} purchased!`);
      fetchUserData();
    } catch (err) {
      console.error('Purchase failed', err);
      alert('Failed to purchase item.');
    }
  };
  

  const renderShop = () => (
    <SafeAreaView>
      <View>
        <Text style={styles.coinDisplay}>💰 Coins: {userCoin}</Text>
        <FlatList
          contentContainerStyle={styles.content}
          data={shopItems}
          keyExtractor={item => item.id}
          numColumns={2}
          renderItem={({ item }) => {
            const owned = unlockedItems.includes(item.name); // Fix: check by name
            const equipped = equippedItems.includes(item.name);
    
            return (
              <View style={styles.shopCard}>
                <Image source={{ uri: item.image }} style={styles.shopImage} />
                <Text style={styles.shopName}>{item.displayName}</Text>
                <Text style={styles.shopCost}>💎 {item.cost}</Text>
    
                {owned ? (
                  equipped ? (
                    <View style={styles.equippedBadge}>
                      <Text style={styles.equippedText}>Equipped</Text>
                    </View>
                  ) : (
                    <TouchableOpacity
                      style={styles.equipButton}
                      onPress={() => equipItem(item.name)}
                    >
                      <Text style={styles.equipButtonText}>Equip</Text>
                    </TouchableOpacity>
                  )
                ) : (
                  <TouchableOpacity
                    style={styles.buyButton}
                    onPress={() => buyItem(item)}
                  >
                    <Text style={styles.buyButtonText}>Buy</Text>
                  </TouchableOpacity>
                )}
              </View>
            );
          }}
        />
      </View>
    </SafeAreaView>
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
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
  content: {
    paddingVertical: 20,
    paddingHorizontal: 16,
    paddingBottom: 80, // So content doesn't get hidden by tabs
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
  cardText: {
    fontSize: 14,
    color: '#444',
    marginTop: 8,
  },

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

  sectionText: {
    fontSize: 16,
    color: '#333',
    paddingHorizontal: 16,
  },

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
  shopName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111',
    marginBottom: 8,
  },
  shopCost: {
    fontSize: 14,
    color: '#666',
    marginBottom: 12,
  },
  buyButton: {
    backgroundColor: '#28a745',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
  },
  buyButtonText: {
    color: '#fff',
    fontWeight: '600',
  },

  // Bottom tabs
  tabs: {
    flexDirection: 'row',
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
    backgroundColor: '#fff',
    paddingVertical: 8,
    position: 'absolute',
    bottom: 0,
    width: '100%',
  },
  tab: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 12,
  },
  tabText: {
    fontSize: 12,
    color: '#666',
    marginTop: 4,
  },
  tabTextActive: {
    color: '#007bff',
    fontWeight: '600',
  },

  // Coin display
  coinDisplay: {
    fontSize: 18,
    fontWeight: '600',
    color: '#111',
    padding: 16,
    textAlign: 'center',
    backgroundColor: '#fff',
  },

  // Equip button
  equipButton: {
    backgroundColor: '#007bff',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
  },
  equipButtonText: {
    color: '#fff',
    fontWeight: '600',
  },

  equippedBadge: {
    backgroundColor: '#6c757d',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
  },
  equippedText: {
    color: '#fff',
    fontWeight: '600',
  },

  ownedText: {
    color: '#999',
    fontWeight: '600',
    fontSize: 14,
    marginTop: 4,
  },
});


