import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

export default function QuestsPage() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Quests & Challenges</Text>
      <Text style={styles.subtitle}>
        Coming soon! Here you’ll find daily, weekly & location-based missions.
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F0F4F8',
    padding: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    marginBottom: 12,
    color: '#333',
  },
  subtitle: {
    fontSize: 16,
    color: '#555',
    textAlign: 'center',
    lineHeight: 22,
  },
});