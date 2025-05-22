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
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import axios from 'axios';
import { useAuth } from './_layout';
import { SafeAreaView } from 'react-native-safe-area-context';

const { width } = Dimensions.get('window');
const apiURL = "http://192.168.193.45:5431/";


export default function ShopPage() {

  const shopItems = [
    {
      id: '1',
      displayName: 'Default Map',
      name: 'map_1',
      cost: 0,
      image: 'https://snazzy-maps-cdn.azureedge.net/assets/2-midnight-commander.png?v=20170626082819',
    },
    {
      id: '2',
      displayName: 'Desert Adventure Map',

      name: 'map_2',
      cost: 30,
      image: 'https://snazzy-maps-cdn.azureedge.net/assets/93-lost-in-the-desert.png?v=20170626082912',
    },
    {
      id: '3',
      displayName: 'Midnight Map',

      name: 'map_3',
      cost: 150,
      image: 'https://snazzy-maps-cdn.azureedge.net/assets/19883-midnight-minimal.png?v=20170626043955',
    },
    {
      id: '4',
      displayName: 'Lime Green Map',

      name: 'map_4',
      cost: 120,
      image: 'https://snazzy-maps-cdn.azureedge.net/assets/24149-hud-display.png?v=20170626033743',
    },
    {
      id: '5',
      displayName: 'Default Banner',

      name: 'banner_1',
      cost: 0,
      image: 'S',
    },
    {
      id: '6',
      displayName: 'Trash Warrior Banner',

      name: 'banner_2',
      cost: 400,
      image: 'https://i.ibb.co/7J5WR0xL/trash-banner-1.png',
    },
    {
      id: '7',
      displayName: 'Ominous Banner',

      name: 'banner_3',
      cost: 400,
      image: 'https://www.goodfreephotos.com/cache/other-photos/backgrounds/green-pattern-and-design-background.jpg',
    },
    {
      id: '8',
      displayName: 'Watercolor Banner',

      name: 'banner_4',
      cost: 400,
      image: 'https://images.rawpixel.com/image_800/cHJpdmF0ZS9sci9pbWFnZXMvd2Vic2l0ZS8yMDIzLTA5L3BkbWlzY3Byb2plY3QyMC1zbWtra3MxOTY0LTM0Ni1pbWFnZS5qcGc.jpg',
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
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.shopWrapper}>
        <View style={styles.coinContainer}>
          <Image
            source={require('../assets/ui/coin.png')}
            style={styles.coinIcon}
          />
          <Text style={styles.coinDisplay}>{userCoin}</Text>
        </View>
        <FlatList
          horizontal={false}
          showsHorizontalScrollIndicator={false}
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
                <View style={styles.costContainer}>
                  <Image
                    source={require('../assets/ui/coin.png')}
                    style={styles.coinSmallIcon}
                  />
                  <Text style={styles.shopCost}>{item.cost}</Text>
                </View>
    
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
  
  return (
    <View style={styles.container}>
      {renderShop()}
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
    alignItems: 'center',
    paddingBottom: 120, // extra bottom padding for full scroll
  },

  // Cards
  card: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 8,
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

  // Streak card…
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
    width: (width - 56) / 2, // slightly reduced width to avoid scroll
    margin: 4,               // smaller side margins
    overflow: 'hidden',      // ensures rounded corners clip the image
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 8,
    elevation: 3,
  },
  shopImage: {
    width: '100%',
    aspectRatio: 1,         // makes it square
    resizeMode: 'cover',    // fills the area
  },
  shopContent: {
    padding: 12,            // content under the image
    alignItems: 'center',
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


  // Coin display
  coinDisplay: {
    fontSize: 18,
    fontWeight: '600',
    color: '#111',
    // Remove padding and background here, now handled in coinContainer
  },

  // Coin display row at top
  coinContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#fff',
  },
  coinIcon: {
    width: 28,
    height: 28,
    marginRight: 8,
  },
  // Cost badge inside shop card
  costContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  coinSmallIcon: {
    width: 16,
    height: 16,
    marginRight: 4,
    marginTop: -10,
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
    paddingHorizontal: 16,
    paddingVertical: 8,
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
  // Wrapper for Shop tab to center items
  shopWrapper: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal:16,
    paddingBottom: 40,  // extra space to scroll past last card
  },

  // Ensure SafeAreaView and wrapper expand fully
  safeArea: {
    flex: 1,
  },
});
  