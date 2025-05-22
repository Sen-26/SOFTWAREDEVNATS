import React, { useState, useEffect } from 'react';
import { useFocusEffect } from 'expo-router';
import {
  SafeAreaView,
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  FlatList,
  TextInput,
  Keyboard,
  TouchableWithoutFeedback,
  Share,
} from 'react-native';
import MapView, { Marker } from 'react-native-maps';
import AsyncStorage from '@react-native-async-storage/async-storage';

import { useRouter } from 'expo-router';

const EVENTS_KEY = '@events_list';
const RSVP_KEY = '@user_joined_events';

const initialEvents = [
  { id: 'e1', name: 'Nashville Cleanup',       date: '2025-06-01', latitude: 36.1627, longitude: -86.7816, rsvpCount: 10, badge: 'Newcomer', teamEligible: true },
  { id: 'e2', name: 'Memphis Litter Patrol',   date: '2025-06-05', latitude: 35.1495, longitude: -90.0490, rsvpCount: 25, badge: 'Coastal Hero', teamEligible: false },
  { id: 'e3', name: 'Chattanooga Restoration', date: '2025-06-10', latitude: 35.0456, longitude: -85.3097, rsvpCount: 8,  badge: 'River Steward', teamEligible: true },
];

export default function EventsPage() {
  const router = useRouter();

  const [mode, setMode]                 = useState<'Create' | 'Join'>('Create');
  const [eventsList, setEventsList]     = useState<typeof initialEvents>(initialEvents);
  const [joinedIds, setJoinedIds]       = useState<string[]>([]);
  const [searchQuery, setSearchQuery]   = useState('');
  const [filter, setFilter]             = useState<'All' | 'Nearby' | 'Today'>('All');


  useEffect(() => {
    AsyncStorage.getItem(EVENTS_KEY)
      .then(v => v && setEventsList(JSON.parse(v)))
      .catch(console.error);
  }, []);

  useFocusEffect(
    React.useCallback(() => {
      AsyncStorage.getItem(RSVP_KEY)
        .then(v => {
          if (v) {
            setJoinedIds(JSON.parse(v));
          }
        })
        .catch(console.error);
    }, [])
  );

  useEffect(() => {
    AsyncStorage.setItem(EVENTS_KEY, JSON.stringify(eventsList)).catch(console.error);
  }, [eventsList]);

  const filteredEvents = eventsList
    .filter(e => e.name.toLowerCase().includes(searchQuery.toLowerCase()))
    .filter(e => {
      if (filter === 'Nearby') return true;
      if (filter === 'Today')  return e.date === new Date().toISOString().slice(0,10);
      return true;
    });

  const handleCreate = (name: string, date: string) => {
    const id = `c${Date.now()}`;
    setEventsList(prev => [...prev, { id, name, date, latitude:0, longitude:0, rsvpCount:0, badge:'Host', teamEligible:true }]);
  };
  const handleRSVP = (item: typeof initialEvents[0]) => {
    const joined = joinedIds.includes(item.id);
    const newJoined = joined ? joinedIds.filter(i => i !== item.id) : [...joinedIds, item.id];
    setJoinedIds(newJoined);
    AsyncStorage.setItem(RSVP_KEY, JSON.stringify(newJoined)).catch(console.error);
    setEventsList(prev =>
      prev.map(e => e.id === item.id
        ? { ...e, rsvpCount: joined ? e.rsvpCount - 1 : e.rsvpCount + 1 }
        : e
      )
    );
  };
  const handleCalendar = (item: typeof initialEvents[0]) => {
    alert(`Add to calendar: ${item.name} on ${item.date}`);
  };
  const handleShare = (item: typeof initialEvents[0]) => {
    Share.share({ message: `Join me at "${item.name}" on ${item.date}!` });
  };

  const renderCreate = () => (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>Create a New Event</Text>
      <TextInput style={styles.input} placeholder="Event Name" value={searchQuery} onChangeText={setSearchQuery} />
      <TextInput style={styles.input} placeholder="Date (YYYY-MM-DD)" keyboardType="numbers-and-punctuation" onChangeText={setSearchQuery} />
      <TouchableOpacity style={styles.actionButton} onPress={() => handleCreate(searchQuery, searchQuery)}>
        <Text style={styles.actionText}>Create</Text>
      </TouchableOpacity>
    </View>
  );

  const renderJoin = () => (
    <View style={styles.section}>
      <TextInput style={styles.searchInput} placeholder="Search events..." value={searchQuery} onChangeText={setSearchQuery} />
      <View style={styles.filterRow}>
        {['All','Nearby','Today'].map(f => (
          <TouchableOpacity key={f} style={[styles.filterBtn, filter===f && styles.filterActive]} onPress={() => setFilter(f as any)}>
            <Text style={[styles.filterText, filter===f && styles.filterTextActive]}>{f}</Text>
          </TouchableOpacity>
        ))}
      </View>
      <FlatList
        data={filteredEvents}
        keyExtractor={i => i.id}
        renderItem={({ item }) => {
          const joined = joinedIds.includes(item.id);
          return (
            <View style={styles.eventCard}>
              <View style={styles.eventInfo}>
                <Text style={styles.eventName}>{item.name}</Text>
                <Text style={styles.eventMeta}>📅 {item.date}   👥 {item.rsvpCount}</Text>
                {item.badge && <Text style={styles.eventBadge}>{item.badge}</Text>}
              </View>
              <View style={styles.eventActions}>
                <TouchableOpacity style={[styles.joinButton, joined && styles.leaveButton]} onPress={() => handleRSVP(item)}>
                  <Text style={styles.joinText}>{joined ? 'Leave' : 'Join'}</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.iconBtn} onPress={() => handleCalendar(item)}>
                  <Text>📅</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.iconBtn} onPress={() => handleShare(item)}>
                  <Text>🔗</Text>
                </TouchableOpacity>
              </View>
            </View>
          );
        }}
        ListFooterComponent={<View style={{ height: 40 }} />}
      />
    </View>
  );

  return (
    <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
      <SafeAreaView style={styles.container}>
        <Text style={styles.pageTitle}>Community Events</Text>
        <MapView
          style={styles.map}
          initialRegion={{
            latitude: 35.5175,
            longitude: -86.5804,
            latitudeDelta: 5,
            longitudeDelta: 5,
          }}
        >
          {eventsList.map(e => (
            <Marker
              key={e.id}
              coordinate={{ latitude: e.latitude, longitude: e.longitude }}
              title={e.name}
            />
          ))}
        </MapView>
        <View style={styles.toggleRow}>
          <TouchableOpacity style={[styles.toggleButton, mode==='Create' && styles.toggleActive]} onPress={() => setMode('Create')}>
            <Text style={[styles.toggleText, mode==='Create' && styles.toggleTextActive]}>Create</Text>
          </TouchableOpacity>
          <TouchableOpacity style={[styles.toggleButton, mode==='Join' && styles.toggleActive]} onPress={() => setMode('Join')}>
            <Text style={[styles.toggleText, mode==='Join' && styles.toggleTextActive]}>Join</Text>
          </TouchableOpacity>
        </View>
        {mode==='Create' ? renderCreate() : renderJoin()}
      </SafeAreaView>
    </TouchableWithoutFeedback>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F7FAFC',
  },
  pageTitle: {
    fontSize: 28, fontWeight: '700', textAlign: 'center', marginVertical: 16, color: '#2D3748',
  },
  map: {
    height: '25%', width: '100%',
  },
  toggleRow: {
    flexDirection: 'row', marginHorizontal: 16, marginTop: 16, borderRadius: 8, backgroundColor: '#E2E8F0', overflow: 'hidden',
  },
  toggleButton: {
    flex: 1, paddingVertical: 12, alignItems: 'center',
  },
  toggleActive: {
    backgroundColor: '#3182CE',
  },
  toggleText: { fontSize: 16, color: '#4A5568', fontWeight: '600' },
  toggleTextActive: { color: '#FFF' },
  section: { flex: 1, paddingHorizontal: 16, paddingTop: 16 },
  searchInput: { backgroundColor: '#FFF', borderColor: '#CBD5E0', borderWidth: 1, borderRadius: 8, padding: 8, marginHorizontal: 16, marginBottom: 12 },
  filterRow: { flexDirection: 'row', marginBottom: 12, justifyContent: 'center' },
  filterBtn: { padding: 6, marginHorizontal: 4, borderRadius: 12 },
  filterActive: { backgroundColor: '#3182CE' },
  filterText: { color: '#4A5568' },
  filterTextActive: { color: '#FFF', fontWeight: '600' },
  sectionTitle: { fontSize: 20, fontWeight: '700', color: '#2D3748', marginBottom: 12 },
  input: { backgroundColor: '#FFF', borderColor: '#CBD5E0', borderWidth: 1, borderRadius: 8, padding: 10, marginBottom: 12 },
  actionButton: { backgroundColor: '#38A169', paddingVertical: 12, borderRadius: 8, alignItems: 'center' },
  actionText: { color: '#FFF', fontSize: 16, fontWeight: '600' },
  eventCard: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', backgroundColor: '#FFF', borderRadius: 8, padding: 16, marginBottom: 12, shadowColor: '#000', shadowOpacity: 0.05, shadowOffset: { width: 0, height: 2 }, shadowRadius: 4, elevation: 2 },
  eventInfo: { flex: 1 },
  eventName: { fontSize: 16, fontWeight: '600', color: '#2D3748' },
  eventMeta: { fontSize: 14, color: '#718096', marginTop: 4 },
  eventBadge: { marginTop: 4, alignSelf: 'flex-start', backgroundColor: '#FEEBC8', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 12, color: '#DD6B20', fontWeight: '600' },
  eventActions: { flexDirection: 'row', alignItems: 'center' },
  joinButton: { backgroundColor: '#3182CE', paddingHorizontal: 16, paddingVertical: 8, borderRadius: 8 },
  leaveButton: { backgroundColor: '#E53E3E' },
  joinText: { color: '#FFF', fontWeight: '600' },
  iconBtn: { marginLeft: 8, padding: 6 },
});