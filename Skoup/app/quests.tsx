const QUEST_MAX = [5, 10, 15, 20, 25, 30, 50, 100, 150, 200, 250, 300];
import React, { useState, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  SafeAreaView,
  TouchableOpacity,
  Image,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect } from 'expo-router';
import { useAuth } from './_layout';

const apiURL = 'http://192.168.193.45:5431/';

type Quest = {
  id: string;
  title: string;
  description: string;
  difficulty: 'Easy' | 'Medium' | 'Hard';
  max: number;
  reward: number;
};

const dailyQuests: Quest[] = [
  { id: 'd1', title: 'Daily Quest 1', description: 'Pick up 5 items.', difficulty: 'Easy', max: 5, reward: 10 },
  { id: 'd2', title: 'Daily Quest 2', description: 'Pick up 10 items.', difficulty: 'Easy', max: 10, reward: 20 },
  { id: 'd3', title: 'Daily Quest 3', description: 'Pick up 15 items.', difficulty: 'Medium', max: 15, reward: 30 },
  { id: 'd4', title: 'Daily Quest 4', description: 'Pick up 20 items.', difficulty: 'Medium', max: 20, reward: 40 },
  { id: 'd5', title: 'Daily Quest 5', description: 'Pick up 25 items.', difficulty: 'Hard', max: 25, reward: 50 },
  { id: 'd6', title: 'Daily Quest 6', description: 'Pick up 30 items.', difficulty: 'Hard', max: 30, reward: 60 },
];
const weeklyQuests: Quest[] = [
  { id: 'w1', title: 'Weekly Quest 1', description: 'Collect 50 items.', difficulty: 'Easy', max: 50, reward: 100 },
  { id: 'w2', title: 'Weekly Quest 2', description: 'Collect 100 items.', difficulty: 'Easy', max: 100, reward: 200 },
  { id: 'w3', title: 'Weekly Quest 3', description: 'Collect 150 items.', difficulty: 'Medium', max: 150, reward: 300 },
  { id: 'w4', title: 'Weekly Quest 4', description: 'Collect 200 items.', difficulty: 'Medium', max: 200, reward: 400 },
  { id: 'w5', title: 'Weekly Quest 5', description: 'Collect 250 items.', difficulty: 'Hard', max: 250, reward: 500 },
  { id: 'w6', title: 'Weekly Quest 6', description: 'Collect 300 items.', difficulty: 'Hard', max: 300, reward: 600 },
];

export default function QuestsPage() {
  const { token } = useAuth();
  const [coin, setCoin] = useState<number>(0);

  const [progressMap, setProgressMap] = useState<Record<string, number>>(() => {
    return Object.fromEntries(
      [...dailyQuests, ...weeklyQuests].map(q => [q.id, 0])
    );
  });
  const [claimedMap, setClaimedMap] = useState<Record<string, boolean>>(() => (
    Object.fromEntries([...dailyQuests, ...weeklyQuests].map(q => [q.id, false]))
  ));

  useFocusEffect(
    React.useCallback(() => {
      fetch(`${apiURL}users/me`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
      })
        .then(res => res.json())
        .then(data => {
          console.log('API /users/me response:', data);
          if (typeof data.coin === 'number') {
            setCoin(data.coin);
          }
        })
        .catch(console.error);

      fetch(`${apiURL}users/me`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
      })
        .then(res => res.json())
        .then(data => {
          console.log('API /users/me quests response:', data);
          if (Array.isArray(data.quests)) {
            const updatedFlags = Object.fromEntries(
              [...dailyQuests, ...weeklyQuests].map((q, i) => [q.id, data.quests[i] === 1])
            );
            setClaimedMap(updatedFlags);
          }
          if (typeof data.trash_collected === 'number') {
            const total = data.trash_collected;
            const newProgress = Object.fromEntries(
              [...dailyQuests, ...weeklyQuests].map(q => [
                q.id,
                Math.min(total, q.max),
              ])
            );
            setProgressMap(newProgress);
          }
        })
        .catch(console.error);
    }, [token])
  );


  const handleClaim = async (questId: string) => {
    try {
      const quest = [...dailyQuests, ...weeklyQuests].find(q => q.id === questId);
      if (quest) {
        const resp = await fetch(`${apiURL}users/me/coin`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            ...(token ? { Authorization: `Bearer ${token}` } : {}),
          },
          body: JSON.stringify({ amount: quest.reward }),
        });
        const json = await resp.json();
        if (typeof json.coin === 'number') {
          setCoin(json.coin);
        }
      }
      const newMap = { ...claimedMap, [questId]: true };
      setClaimedMap(newMap);
      const flagsArray = [...dailyQuests, ...weeklyQuests].map(q =>
        newMap[q.id] ? 1 : 0
      );

      fetch(`${apiURL}users/me/update-quests`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({ quests: flagsArray }),
      })
        .then(res => res.json())
        .then(data => console.log('Claim flags updated:', data.quests))
        .catch(console.error);
    } catch (err) {
      console.error('Failed to claim reward', err);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Quests & Challenges</Text>
        <View style={styles.coinContainer}>
          <Image
            source={require('../assets/ui/coin.png')}
            style={styles.coinIcon}
          />
          <Text style={styles.coinText}>{coin}</Text>
        </View>
      </View>

      <ScrollView contentContainerStyle={styles.list}>
        <Text style={styles.sectionHeader}>Daily Quests</Text>
        {dailyQuests.map(q => {
          const badgeColor =
            q.difficulty === 'Easy'
              ? '#28a745'
              : q.difficulty === 'Medium'
              ? '#FFA500'
              : '#DC3545';
          return (
            <View
             key={q.id}
             style={[
               styles.questCard,
               { borderLeftWidth: 4, borderLeftColor: badgeColor },
             ]}
           >
              <View style={styles.questHeader}>
                <Text style={styles.questTitle}>{q.title}</Text>
                <View style={styles.rewardContainer}>
                  <Image
                    source={require('../assets/ui/coin.png')}
                    style={styles.rewardIcon}
                  />
                  <Text style={styles.rewardText}>{q.reward}</Text>
                </View>
              </View>
              <Text style={styles.questDesc}>{q.description}</Text>
              <Text style={styles.progressText}>
                Progress: {progressMap[q.id]} / {q.max}
              </Text>
              <TouchableOpacity
                style={[
                  styles.claimButton,
                  (claimedMap[q.id] || progressMap[q.id] < q.max)
                    ? styles.claimDisabled
                    : null,
                ]}
                disabled={claimedMap[q.id] || progressMap[q.id] < q.max}
                onPress={() => handleClaim(q.id)}
              >
                <Text style={styles.claimButtonText}>
                  {claimedMap[q.id] ? 'Claimed' : 'Claim'}
                </Text>
              </TouchableOpacity>
            </View>
          );
        })}
        <Text style={styles.sectionHeader}>Weekly Quests</Text>
        {weeklyQuests.map(q => {
          const badgeColor =
            q.difficulty === 'Easy'
              ? '#28a745'
              : q.difficulty === 'Medium'
              ? '#FFA500'
              : '#DC3545';
          return (
            <View
             key={q.id}
             style={[
               styles.questCard,
               { borderLeftWidth: 4, borderLeftColor: badgeColor },
             ]}
           >
              <View style={styles.questHeader}>
                <Text style={styles.questTitle}>{q.title}</Text>
                <View style={styles.rewardContainer}>
                  <Image
                    source={require('../assets/ui/coin.png')}
                    style={styles.rewardIcon}
                  />
                  <Text style={styles.rewardText}>{q.reward}</Text>
                </View>
              </View>
              <Text style={styles.questDesc}>{q.description}</Text>
              <Text style={styles.progressText}>
                Progress: {progressMap[q.id]} / {q.max}
              </Text>
              <TouchableOpacity
                style={[
                  styles.claimButton,
                  (claimedMap[q.id] || progressMap[q.id] < q.max)
                    ? styles.claimDisabled
                    : null,
                ]}
                disabled={claimedMap[q.id] || progressMap[q.id] < q.max}
                onPress={() => handleClaim(q.id)}
              >
                <Text style={styles.claimButtonText}>
                  {claimedMap[q.id] ? 'Claimed' : 'Claim'}
                </Text>
              </TouchableOpacity>
            </View>
          );
        })}
      </ScrollView>
    </SafeAreaView>
  );
}


const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F7FAFC' },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingTop: 52,
    paddingBottom: 8,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
    elevation: 2,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowOffset: { width: 0, height: 1 },
    shadowRadius: 3,
  },
  title: { fontSize: 22, fontWeight: '700', color: '#2D3748' },
  coinContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    padding: 8,
    borderRadius: 16,
  },
  coinText: { marginLeft: 6, fontSize: 18, fontWeight: '600', color: '#333' },

  list: {
    paddingTop: 16,
    paddingHorizontal: 16,
    paddingBottom: 40,
    backgroundColor: '#F7FAFC',
  },
  questCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 20,
    marginBottom: 16,
    marginHorizontal: 0,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    elevation: 1,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowOffset: { width: 0, height: 1 },
    shadowRadius: 2,
  },
  questHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#EDF2F7',
    paddingBottom: 8,
  },
  questTitle: { fontSize: 18, fontWeight: '600', color: '#2D3748' },
  badge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 8,
  },
  badgeText: { color: '#fff', fontSize: 12, fontWeight: '600' },
  questDesc: { marginTop: 8, fontSize: 14, color: '#444', lineHeight: 20 },
  sectionHeader: {
    alignSelf: 'flex-start',
    marginVertical: 16,
    marginLeft: 0,
    paddingHorizontal: 12,
    paddingVertical: 6,
    backgroundColor: '#fff',
    borderRadius: 16,
    fontSize: 18,
    fontWeight: '700',
    color: '#2D3748',
  },
  progressText: {
    marginTop: 12,
    fontSize: 14,
    color: '#4A5568',
    fontStyle: 'italic',
  },
  rewardContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FEEBC8',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  rewardText: {
    marginLeft: 6,
    fontSize: 14,
    fontWeight: '600',
    color: '#DD6B20',
  },
  claimButton: {
    marginTop: 16,
    width: '100%',
    paddingVertical: 12,
    borderRadius: 8,
    backgroundColor: '#38A169',
    alignItems: 'center',
  },
  claimDisabled: {
    backgroundColor: '#A0AEC0',
  },
  claimButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '700',
  },
  coinIcon: {
    width: 24,
    height: 24,
    marginRight: 8,
  },
  rewardIcon: {
    width: 18,
    height: 18,
    marginRight: 6,
  },
});