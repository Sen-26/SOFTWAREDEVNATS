import { Entypo, Ionicons, MaterialIcons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Buffer } from 'buffer';
import { CameraView, useCameraPermissions } from 'expo-camera';
import * as Location from 'expo-location';
import { useFocusEffect, useRouter } from 'expo-router';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Animated,
  Easing,
  Image,
  ImageBackground,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import MapView, { PROVIDER_GOOGLE } from 'react-native-maps';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useAuth } from './_layout';

const apiURL = "http://192.168.193.45:5431/";

const mapStyles = { 
  map_1: 
  [
    {
        "featureType": "all",
        "elementType": "labels.text.fill",
        "stylers": [
            {
                "color": "#ffffff"
            }
        ]
    },
    {
        "featureType": "all",
        "elementType": "labels.text.stroke",
        "stylers": [
            {
                "color": "#000000"
            },
            {
                "lightness": 13
            }
        ]
    },
    {
        "featureType": "administrative",
        "elementType": "geometry.fill",
        "stylers": [
            {
                "color": "#000000"
            }
        ]
    },
    {
        "featureType": "administrative",
        "elementType": "geometry.stroke",
        "stylers": [
            {
                "color": "#144b53"
            },
            {
                "lightness": 14
            },
            {
                "weight": 1.4
            }
        ]
    },
    {
        "featureType": "landscape",
        "elementType": "all",
        "stylers": [
            {
                "color": "#08304b"
            }
        ]
    },
    {
        "featureType": "poi",
        "elementType": "geometry",
        "stylers": [
            {
                "color": "#0c4152"
            },
            {
                "lightness": 5
            }
        ]
    },
    {
        "featureType": "road.highway",
        "elementType": "geometry.fill",
        "stylers": [
            {
                "color": "#000000"
            }
        ]
    },
    {
        "featureType": "road.highway",
        "elementType": "geometry.stroke",
        "stylers": [
            {
                "color": "#0b434f"
            },
            {
                "lightness": 25
            }
        ]
    },
    {
        "featureType": "road.arterial",
        "elementType": "geometry.fill",
        "stylers": [
            {
                "color": "#000000"
            }
        ]
    },
    {
        "featureType": "road.arterial",
        "elementType": "geometry.stroke",
        "stylers": [
            {
                "color": "#0b3d51"
            },
            {
                "lightness": 16
            }
        ]
    },
    {
        "featureType": "road.local",
        "elementType": "geometry",
        "stylers": [
            {
                "color": "#000000"
            }
        ]
    },
    {
        "featureType": "transit",
        "elementType": "all",
        "stylers": [
            {
                "color": "#146474"
            }
        ]
    },
    {
        "featureType": "water",
        "elementType": "all",
        "stylers": [
            {
                "color": "#021019"
            }
        ]
    }
],
map_2: 

[
    {
        "elementType": "labels",
        "stylers": [
            {
                "visibility": "on"
            },
            {
                "color": "#f49f53"
            }
        ]
    },
    {
        "featureType": "landscape",
        "stylers": [
            {
                "color": "#f9ddc5"
            },
            {
                "lightness": -7
            }
        ]
    },
    {
        "featureType": "road",
        "stylers": [
            {
                "color": "#813033"
            },
            {
                "lightness": 43
            }
        ]
    },
    {
        "featureType": "poi.business",
        "stylers": [
            {
                "color": "#645c20"
            },
            {
                "lightness": 38
            }
        ]
    },
    {
        "featureType": "water",
        "stylers": [
            {
                "color": "#1994bf"
            },
            {
                "saturation": -69
            },
            {
                "gamma": 0.99
            },
            {
                "lightness": 43
            }
        ]
    },
    {
        "featureType": "road.local",
        "elementType": "geometry.fill",
        "stylers": [
            {
                "color": "#f19f53"
            },
            {
                "weight": 1.3
            },
            {
                "visibility": "on"
            },
            {
                "lightness": 16
            }
        ]
    },
    {
        "featureType": "poi.business"
    },
    {
        "featureType": "poi.park",
        "stylers": [
            {
                "color": "#645c20"
            },
            {
                "lightness": 39
            }
        ]
    },
    {
        "featureType": "poi.school",
        "stylers": [
            {
                "color": "#a95521"
            },
            {
                "lightness": 35
            }
        ]
    },
    {},
    {
        "featureType": "poi.medical",
        "elementType": "geometry.fill",
        "stylers": [
            {
                "color": "#813033"
            },
            {
                "lightness": 38
            },
            {
                "visibility": "off"
            }
        ]
    },
    {},
    {},
    {},
    {},
    {},
    {},
    {},
    {},
    {},
    {},
    {},
    {
        "elementType": "labels"
    },
    {
        "featureType": "poi.sports_complex",
        "stylers": [
            {
                "color": "#9e5916"
            },
            {
                "lightness": 32
            }
        ]
    },
    {},
    {
        "featureType": "poi.government",
        "stylers": [
            {
                "color": "#9e5916"
            },
            {
                "lightness": 46
            }
        ]
    },
    {
        "featureType": "transit.station",
        "stylers": [
            {
                "visibility": "off"
            }
        ]
    },
    {
        "featureType": "transit.line",
        "stylers": [
            {
                "color": "#813033"
            },
            {
                "lightness": 22
            }
        ]
    },
    {
        "featureType": "transit",
        "stylers": [
            {
                "lightness": 38
            }
        ]
    },
    {
        "featureType": "road.local",
        "elementType": "geometry.stroke",
        "stylers": [
            {
                "color": "#f19f53"
            },
            {
                "lightness": -10
            }
        ]
    },
    {},
    {},
    {}
],
map_4:
[
  {
      "featureType": "all",
      "elementType": "geometry",
      "stylers": [
          {
              "color": "#000000"
          }
      ]
  },
  {
      "featureType": "all",
      "elementType": "labels",
      "stylers": [
          {
              "visibility": "on"
          }
      ]
  },
  {
      "featureType": "all",
      "elementType": "labels.text",
      "stylers": [
          {
              "visibility": "on"
          }
      ]
  },
  {
      "featureType": "all",
      "elementType": "labels.text.fill",
      "stylers": [
          {
              "gamma": 0.01
          },
          {
              "lightness": 20
          },
          {
              "visibility": "on"
          }
      ]
  },
  {
      "featureType": "all",
      "elementType": "labels.text.stroke",
      "stylers": [
          {
              "saturation": -31
          },
          {
              "lightness": -33
          },
          {
              "weight": 2
          },
          {
              "gamma": 0.8
          }
      ]
  },
  {
      "featureType": "all",
      "elementType": "labels.icon",
      "stylers": [
          {
              "visibility": "on"
          }
      ]
  },
  {
      "featureType": "administrative",
      "elementType": "geometry",
      "stylers": [
          {
              "color": "#000000"
          }
      ]
  },
  {
      "featureType": "landscape",
      "elementType": "geometry",
      "stylers": [
          {
              "saturation": "-100"
          },
          {
              "lightness": "30"
          }
      ]
  },
  {
      "featureType": "landscape.man_made",
      "elementType": "geometry.fill",
      "stylers": [
          {
              "visibility": "on"
          },
          {
              "color": "#5f5f5f"
          }
      ]
  },
  {
      "featureType": "landscape.natural.landcover",
      "elementType": "geometry",
      "stylers": [
          {
              "visibility": "off"
          }
      ]
  },
  {
      "featureType": "poi",
      "elementType": "geometry",
      "stylers": [
          {
              "saturation": "20"
          }
      ]
  },
  {
      "featureType": "poi.park",
      "elementType": "geometry",
      "stylers": [
          {
              "color": "#50ff7a"
          },
          {
              "saturation": "-90"
          },
          {
              "lightness": "0"
          }
      ]
  },
  {
      "featureType": "road",
      "elementType": "geometry",
      "stylers": [
          {
              "lightness": 10
          },
          {
              "saturation": "-100"
          }
      ]
  },
  {
      "featureType": "road",
      "elementType": "geometry.fill",
      "stylers": [
          {
              "color": "#50ff7a"
          },
          {
              "lightness": "45"
          },
          {
              "saturation": "-30"
          },
          {
              "gamma": "1"
          }
      ]
  },
  {
      "featureType": "road",
      "elementType": "geometry.stroke",
      "stylers": [
          {
              "saturation": "-100"
          },
          {
              "lightness": 25
          }
      ]
  },
  {
      "featureType": "water",
      "elementType": "all",
      "stylers": [
          {
              "lightness": -20
          }
      ]
  },
  {
      "featureType": "water",
      "elementType": "geometry.fill",
      "stylers": [
          {
              "color": "#50ff7a"
          },
          {
              "saturation": "-80"
          },
          {
              "lightness": "10"
          }
      ]
  }
],
map_3:
[
  {
      "featureType": "all",
      "elementType": "labels.text.fill",
      "stylers": [
          {
              "color": "#ffffff"
          }
      ]
  },
  {
      "featureType": "all",
      "elementType": "labels.text.stroke",
      "stylers": [
          {
              "color": "#000000"
          },
          {
              "lightness": 13
          }
      ]
  },
  {
      "featureType": "administrative",
      "elementType": "all",
      "stylers": [
          {
              "visibility": "off"
          }
      ]
  },
  {
      "featureType": "administrative",
      "elementType": "geometry.fill",
      "stylers": [
          {
              "color": "#000000"
          }
      ]
  },
  {
      "featureType": "administrative",
      "elementType": "geometry.stroke",
      "stylers": [
          {
              "color": "#144b53"
          },
          {
              "lightness": 14
          },
          {
              "weight": 1.4
          }
      ]
  },
  {
      "featureType": "administrative.province",
      "elementType": "all",
      "stylers": [
          {
              "visibility": "on"
          }
      ]
  },
  {
      "featureType": "administrative.locality",
      "elementType": "all",
      "stylers": [
          {
              "visibility": "on"
          }
      ]
  },
  {
      "featureType": "administrative.neighborhood",
      "elementType": "all",
      "stylers": [
          {
              "visibility": "on"
          }
      ]
  },
  {
      "featureType": "landscape",
      "elementType": "all",
      "stylers": [
          {
              "color": "#08304b"
          }
      ]
  },
  {
      "featureType": "landscape.man_made",
      "elementType": "all",
      "stylers": [
          {
              "visibility": "on"
          }
      ]
  },
  {
      "featureType": "landscape.natural",
      "elementType": "all",
      "stylers": [
          {
              "visibility": "on"
          }
      ]
  },
  {
      "featureType": "poi",
      "elementType": "all",
      "stylers": [
          {
              "visibility": "on"
          }
      ]
  },
  {
      "featureType": "poi",
      "elementType": "geometry",
      "stylers": [
          {
              "color": "#0e5166"
          },
          {
              "lightness": 5
          }
      ]
  },
  {
      "featureType": "poi",
      "elementType": "labels",
      "stylers": [
          {
              "visibility": "simplified"
          }
      ]
  },
  {
      "featureType": "poi",
      "elementType": "labels.text.fill",
      "stylers": [
          {
              "visibility": "on"
          },
          {
              "color": "#7aecff"
          }
      ]
  },
  {
      "featureType": "poi",
      "elementType": "labels.text.stroke",
      "stylers": [
          {
              "visibility": "off"
          }
      ]
  },
  {
      "featureType": "poi",
      "elementType": "labels.icon",
      "stylers": [
          {
              "visibility": "simplified"
          }
      ]
  },
  {
      "featureType": "poi.attraction",
      "elementType": "all",
      "stylers": [
          {
              "visibility": "off"
          }
      ]
  },
  {
      "featureType": "poi.place_of_worship",
      "elementType": "all",
      "stylers": [
          {
              "visibility": "off"
          }
      ]
  },
  {
      "featureType": "poi.sports_complex",
      "elementType": "all",
      "stylers": [
          {
              "visibility": "off"
          }
      ]
  },
  {
      "featureType": "road.highway",
      "elementType": "geometry.fill",
      "stylers": [
          {
              "color": "#e7ff00"
          },
          {
              "visibility": "on"
          },
          {
              "weight": "0.90"
          }
      ]
  },
  {
      "featureType": "road.highway",
      "elementType": "geometry.stroke",
      "stylers": [
          {
              "color": "#0b434f"
          },
          {
              "lightness": 25
          },
          {
              "visibility": "off"
          }
      ]
  },
  {
      "featureType": "road.highway",
      "elementType": "labels.text",
      "stylers": [
          {
              "visibility": "simplified"
          }
      ]
  },
  {
      "featureType": "road.arterial",
      "elementType": "geometry.fill",
      "stylers": [
          {
              "color": "#2aff00"
          },
          {
              "visibility": "on"
          },
          {
              "weight": "0.80"
          }
      ]
  },
  {
      "featureType": "road.arterial",
      "elementType": "geometry.stroke",
      "stylers": [
          {
              "color": "#0b3d51"
          },
          {
              "lightness": 16
          },
          {
              "visibility": "off"
          }
      ]
  },
  {
      "featureType": "road.arterial",
      "elementType": "labels",
      "stylers": [
          {
              "visibility": "off"
          }
      ]
  },
  {
      "featureType": "road.local",
      "elementType": "geometry",
      "stylers": [
          {
              "color": "#000000"
          }
      ]
  },
  {
      "featureType": "road.local",
      "elementType": "geometry.fill",
      "stylers": [
          {
              "visibility": "on"
          },
          {
              "color": "#00ab69"
          },
          {
              "weight": "0.80"
          }
      ]
  },
  {
      "featureType": "road.local",
      "elementType": "labels",
      "stylers": [
          {
              "visibility": "off"
          }
      ]
  },
  {
      "featureType": "transit",
      "elementType": "all",
      "stylers": [
          {
              "color": "#146474"
          }
      ]
  },
  {
      "featureType": "transit",
      "elementType": "geometry",
      "stylers": [
          {
              "visibility": "on"
          },
          {
              "color": "#ff0000"
          },
          {
              "weight": "0.90"
          }
      ]
  },
  {
      "featureType": "transit",
      "elementType": "labels.text",
      "stylers": [
          {
              "visibility": "simplified"
          },
          {
              "color": "#ff6300"
          }
      ]
  },
  {
      "featureType": "transit",
      "elementType": "labels.icon",
      "stylers": [
          {
              "visibility": "on"
          },
          {
              "color": "#ff3f00"
          },
          {
              "weight": "0.80"
          }
      ]
  },
  {
      "featureType": "transit.station.bus",
      "elementType": "all",
      "stylers": [
          {
              "visibility": "off"
          }
      ]
  },
  {
      "featureType": "transit.station.bus",
      "elementType": "geometry",
      "stylers": [
          {
              "visibility": "off"
          }
      ]
  },
  {
      "featureType": "transit.station.bus",
      "elementType": "labels",
      "stylers": [
          {
              "visibility": "off"
          }
      ]
  },
  {
      "featureType": "water",
      "elementType": "all",
      "stylers": [
          {
              "color": "#010a33"
          }
      ]
  }
]
};

const AVATAR_KEY = '@user_avatar';
const COIN_KEY = '@user_coins';
const EPA_MAP_VISIBLE = '@epa_map_visible';

export default function HomePage() {
    const router = useRouter();
    const { token } = useAuth();
    const [progressCount, setProgressCount] = useState<number>(0);
    const [trashCollected, setTrashCollected] = useState<number>(0);
    const [equippedItems, setEquippedItems] = useState<string[]>([]);

    const insets = useSafeAreaInsets();
    // Animated width from 0→percent
    const progressAnim = useRef(new Animated.Value(0)).current;

    // Refresh profile data on screen focus
    useFocusEffect(
      useCallback(() => {
        fetch(`${apiURL}users/me`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            ...(token ? { Authorization: `Bearer ${token}` } : {}),
          },
        })
          .then(res => res.json())
          .then(data => {
            const endpoint = `${apiURL}/users/${data.id}/avatar?t=${Date.now()}`;
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
          if (data.username) setUserName(data.username);
            // update coin in AsyncStorage for progress calc
            setEquippedItems(data.equipped_items || []);
            console.log(data.equipped_items)
            const mapKey = data.equipped_items.find(item => item.startsWith("map_")) || "map_1";
            setMapStyle(mapStyles[mapKey]);
            if (typeof data.coin === 'number') {
              AsyncStorage.setItem(COIN_KEY, data.coin.toString());
              const pieces = Math.floor(data.coin / 2);
              setProgressCount(Math.min(pieces, 50));
            }
            // update trash count
            if (typeof data.trash_collected === 'number') {
              setTrashCollected(data.trash_collected);
            }
          })
          .catch(console.error);
      }, [token])
    );


    // Animate when progressCount changes
    useEffect(() => {
      const pct = (progressCount / 50) * 100;
      Animated.timing(progressAnim, {
        toValue: pct,
        duration: 800,
        easing: Easing.out(Easing.quad),
        useNativeDriver: false,
      }).start();
    }, [progressCount]);
  
    // Map state
    const [region, setRegion] = useState<any>(null);
    const [mapStyle, setMapStyle] = useState(mapStyles["map_1"]);
    const [infoVisible, setInfoVisible] = useState(false);
    const slideAnim = useRef(new Animated.Value(-120)).current;

    // EPA Map Overlay State
    const [epaMapVisible, setEpaMapVisible] = useState(false);
    const [epaMapOpacity, setEpaMapOpacity] = useState(0.7);
    
    const [avatarUri, setAvatarUri] = useState<string | null>(null);
    const [userName, setUserName] = useState<string | null>(null);

    useEffect(() => {
      AsyncStorage.getItem(AVATAR_KEY).then(uri => {
        if (uri) setAvatarUri(uri);
      });
      AsyncStorage.getItem(EPA_MAP_VISIBLE).then(value => {
        if (value !== null) setEpaMapVisible(value === 'true');
      });
    }, []);
    useEffect(() => {
      AsyncStorage.setItem(EPA_MAP_VISIBLE, epaMapVisible.toString());
    }, [epaMapVisible]);
    // Camera permission + ref
    const [permission, requestPermission] = useCameraPermissions();
    const cameraRef = useRef<CameraView>(null);

    // NEW: toggle camera view
    const [cameraVisible, setCameraVisible] = useState(false);

    // Result modal state
    const [showResults, setShowResults] = useState(false);
    const [tokensEarned, setTokensEarned] = useState<number>(0);

    const handleSnap = async () => {
      if (!cameraRef.current) return;
      const photo = await cameraRef.current.takePictureAsync();
      setCameraVisible(false);

      try {
        const { image, count } = await uploadPhoto(photo);
        setAnnotatedImage(image);
        setDetectionCount(count);
        if (count === 0) {
          Alert.alert(
            'No trash detected',
            'Please make sure the trash is clearly visible and try again.'
          );
          setCameraVisible(true);
          return;
        }
        // compute tokens based on returned count
        const current = parseInt((await AsyncStorage.getItem(COIN_KEY)) || '0', 10);
        const tokens = count * 2;
        // Update server trash count and read back the new total
        const resp = await fetch(`${apiURL}users/me/trash_collected`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            ...(token ? { Authorization: `Bearer ${token}` } : {}),
          },
          body: JSON.stringify({ amount: count }),
        });
        const json = await resp.json();
        if (typeof json.trash_collected === 'number') {
          setTrashCollected(json.trash_collected);
        }
        // Update server-side coin balance
        const coinResp = await fetch(`${apiURL}users/me/coin`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            ...(token ? { Authorization: `Bearer ${token}` } : {}),
          },
          body: JSON.stringify({ amount: tokens }),
        });
        const coinJson = await coinResp.json();
        if (typeof coinJson.coin === 'number') {
          await AsyncStorage.setItem(COIN_KEY, coinJson.coin.toString());
        }
        setTokensEarned(tokens);
      } catch (err) {
        console.error('Upload or processing failed', err);
      }

      setShowResults(true);
    };
    const [annotatedImage, setAnnotatedImage] = useState<string | null>(null);
    const [detectionCount, setDetectionCount] = useState<number | null>(null);

    // Dropdown menu hooks
    const [menuVisible, setMenuVisible] = useState(false);
    const toggleMenu = () => {
      setMenuVisible(v => !v);
    };
    const toggleEpaMap = () => {
      setEpaMapVisible(prev => !prev);
    };
    const uploadPhoto = async (photo: { uri: string }) => {
      const formData = new FormData();

      formData.append('file', {
        uri: photo.uri,
        name: 'photo.jpg',
        type: 'image/jpeg',
      } as any);

      try {
        const response = await fetch("http://192.168.193.45:5431/detection/process-image", {
          method: 'POST',
          body: formData,
          headers: {
            'Content-Type': 'multipart/form-data',
            ...(token ? { Authorization: `Bearer ${token}` } : {}),
          },
        });

        const json = await response.json();

        if (json.image) {
          const base64Image = `data:image/jpeg;base64,${json.image}`;
          return { image: base64Image, count: json.count };
        }
        throw new Error('Invalid response from server');
      } catch (error) {
        console.error('❌ Upload failed:', error);
        throw error;
      }
    };
    // Fetch location
    useEffect(() => {
      (async () => {
        const { status } = await Location.requestForegroundPermissionsAsync();
        if (status !== 'granted') return;
        const loc = await Location.getCurrentPositionAsync({});
        setRegion({
          latitude: loc.coords.latitude,
          longitude: loc.coords.longitude,
          latitudeDelta: 0.05,
          longitudeDelta: 0.05,
        });
      })();
    }, []);

    // Update user location on entering HomePage
    useEffect(() => {
      (async () => {
        if (!token) return;
        try {
          const { status } = await Location.requestForegroundPermissionsAsync();
          if (status === 'granted') {
            const loc = await Location.getCurrentPositionAsync({});
            await fetch(`${apiURL}users/me/location`, {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${token}`,
              },
              body: JSON.stringify({
                latitude: loc.coords.latitude,
                longitude: loc.coords.longitude,
              }),
            });
          }
        } catch (e) {
          // Ignore location errors
        }
      })();
    }, [token]);

    // Show scan results
    if (showResults) {
      return (
        <View style={styles.resultsContainer}>
          <View style={styles.resultsCard}>
            {annotatedImage && (
              <Image source={{ uri: annotatedImage }} style={styles.resultImage} />
            )}
            <View style={styles.statsRow}>
              <View style={styles.statBox}>
                <Ionicons name="trash-outline" size={28} color="#007bff" />
                <Text style={styles.statNumber}>{detectionCount}</Text>
                <Text style={styles.statLabel}>Items</Text>
              </View>
              <View style={styles.statBox}>
                <Ionicons name="sparkles-outline" size={28} color="#007bff" />
                <Text style={styles.statNumber}>{tokensEarned}</Text>
                <Text style={styles.statLabel}>Tokens</Text>
              </View>
            </View>
            <TouchableOpacity
              style={styles.resultButton}
              onPress={() => setShowResults(false)}
            >
              <Text style={styles.resultButtonText}>Back to Map</Text>
            </TouchableOpacity>
          </View>
        </View>
      );
    }

    if (!region) {
      return (
        <View style={styles.loading}>
          <ActivityIndicator size="large" color="#007bff" />
        </View>
      );
    }

    // SHOW CAMERA PREVIEW IF ACTIVE
    if (cameraVisible && permission?.granted) {
      return (
        <View style={styles.cameraContainer}>
          <CameraView
            ref={cameraRef}
            style={styles.cameraFull}
            facing="back"
          />
          {/* Tooltip */}
          <View style={styles.tooltip}>
            <Text style={styles.tooltipText}>Make sure the trash is in frame</Text>
          </View>
          <TouchableOpacity onPress={handleSnap} style={styles.snapButton}>
            <Ionicons name="ellipse" size={64} color="white" />
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => setCameraVisible(false)}
            style={styles.closeIcon}
          >
            <Ionicons name="close" size={24} color="white" />
          </TouchableOpacity>
        </View>
      );
    }
    
    // MAIN MAP + UI
    return (
      <View style={styles.container}>
        <MapView
          style={StyleSheet.absoluteFillObject}
          provider={PROVIDER_GOOGLE}
          showsUserLocation
          followsUserLocation
          region={region}
          customMapStyle={mapStyle}
        >
          {epaMapVisible && (
            <Overlay 
              bounds={[
                [24.396308, -125.0],  // Southwest coordinate [latitude, longitude]
                [49.384358, -66.93457]   // Northeast coordinate [latitude, longitude]
              ]}
              image={{
                uri: 'https://services2.arcgis.com/FiaPA4ga0iQKduv3/arcgis/rest/services/US_TrashIndex_BoundedCombined_v1/MapServer/export?dpi=96&transparent=true&format=png32&layers=show:0&bbox=' + 
                     `${region.longitude - region.longitudeDelta},${region.latitude - region.latitudeDelta},` +
                     `${region.longitude + region.longitudeDelta},${region.latitude + region.latitudeDelta}` +
                     '&bboxSR=4326&imageSR=4326&size=512,512&f=image'
              }}
              opacity={epaMapOpacity}
            />
          )}
        </MapView>
  
        {/* Top Buttons */}
        {!cameraVisible && (
        <View style={styles.topButtons}>
          <TouchableOpacity style={styles.menuButton} onPress={toggleMenu}>
            <Entypo name="menu" size={28} color="white" />
          </TouchableOpacity>
          <ImageBackground
            source={require('../assets/ui/progress_panel.png')}
            style={[
              styles.progressPanel,
              { top: insets.top - 45, right: insets.right - 10 },
            ]}
            imageStyle={styles.progressPanelImage}
          >
            <TouchableOpacity
              style={styles.progressSlider}
              activeOpacity={0.8}
              onPress={() => router.push('/quests')}
            >

              {/* Header (removed progress count text) */}
              <View style={styles.progressHeader}>
                {/* Progress count text removed */}
              </View>

              {/* Progress bar: dark grey track, orange fill */}
              <Text style={styles.trashCollectedOverlay}>
                {trashCollected}
                <Text style={styles.trashCollectedItems}> items</Text>
              </Text>
              <View style={styles.progressBarBackground}>
                <Animated.View
                  style={[
                    styles.progressBarFill,
                    {
                      width: progressAnim.interpolate({
                        inputRange: [0, 100],
                        outputRange: ['0%', '100%'],
                      }),
                    },
                  ]}
                />
                <Image
                  source={require('../assets/ui/coin.png')}
                  style={styles.nextRewardIcon}
                />
              </View>
            </TouchableOpacity>
          </ImageBackground>
        </View>
        )}

        {/* Dropdown Menu */}
        {menuVisible && (
          <View style={styles.dropdownMenu}>
            <TouchableOpacity onPress={() => { toggleMenu(); router.push('/'); }} style={styles.dropdownItem}>
              <Ionicons name="home-outline" size={20} color="#333" style={styles.dropdownIcon} />
              <Text style={styles.dropdownText}>Home</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={() => { toggleMenu(); router.push('/profile'); }} style={styles.dropdownItem}>
              <Ionicons name="person-outline" size={20} color="#333" style={styles.dropdownIcon} />
              <Text style={styles.dropdownText}>Profile</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={() => { toggleMenu(); router.push('/shop'); }} style={styles.dropdownItem}>
              <Ionicons name="storefront-outline" size={20} color="#333" style={styles.dropdownIcon} />
              <Text style={styles.dropdownText}>Shop</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={() => { toggleMenu(); /* add settings route if exists */ }} style={styles.dropdownItem}>
              <Ionicons name="settings-outline" size={20} color="#333" style={styles.dropdownIcon} />
              <Text style={styles.dropdownText}>Settings</Text>
            </TouchableOpacity>
            
            {/* EPA Map Layer Toggle */}
            <View style={[styles.dropdownItem, styles.toggleItem]}>
              <Ionicons name="layers-outline" size={20} color="#333" style={styles.dropdownIcon} />
              <Text style={styles.dropdownText}>EPA Trash Risk</Text>
              <Switch
                value={epaMapVisible}
                onValueChange={toggleEpaMap}
                trackColor={{ false: "#767577", true: "#81b0ff" }}
                thumbColor={epaMapVisible ? "#007bff" : "#f4f3f4"}
                style={styles.toggle}
              />
            </View>
            
            {/* Opacity Slider (only show when EPA map is visible) */}
            {epaMapVisible && (
              <View style={[styles.dropdownItem, styles.sliderItem]}>
                <Text style={styles.sliderLabel}>Opacity: {Math.round(epaMapOpacity * 100)}%</Text>
                <Slider
                  style={styles.slider}
                  minimumValue={0.2}
                  maximumValue={1}
                  value={epaMapOpacity}
                  onValueChange={setEpaMapOpacity}
                  minimumTrackTintColor="#007bff"
                  maximumTrackTintColor="#d3d3d3"
                  thumbTintColor="#007bff"
                />
              </View>
            )}
          </View>
        )}
  
        {/* Bottom Buttons */}
        <View style={styles.bottomButtons}>
          <TouchableOpacity
            style={styles.profileButton}
            onPress={() => router.push('/profile')}
          >
            <Image
              source={
                avatarUri
                  ? { uri: avatarUri }
                  : { uri: require('../assets/avatar-placeholder.jpg') }
              }
              style={styles.profileImage}
            />
            {/* Username overlay */}
            <View style={styles.profileNameOverlay}>
              <Text style={styles.profileNameOverlayText}>{userName}</Text>
            </View>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.cameraButton}
            onPress={() => {
              if (!permission?.granted) requestPermission();
              else setCameraVisible(true);
            }}
          >
            <Ionicons name="camera" size={48} color="white" />
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.shopButton}
            onPress={() => router.push('/shop')}
          >
            <MaterialIcons name="store" size={24} color="white" />
          </TouchableOpacity>
        </View>

        {/* EPA Map Legend (only show when EPA map is visible) */}
        {epaMapVisible && (
          <View style={styles.mapLegend}>
            <Text style={styles.legendTitle}>EPA Trash Risk</Text>
            <View style={styles.legendItems}>
              <View style={styles.legendItem}>
                <View style={[styles.legendColor, {backgroundColor: 'rgba(255, 0, 0, 0.7)'}]} />
                <Text style={styles.legendText}>High Risk</Text>
              </View>
              <View style={styles.legendItem}>
                <View style={[styles.legendColor, {backgroundColor: 'rgba(255, 165, 0, 0.7)'}]} />
                <Text style={styles.legendText}>Medium Risk</Text>
              </View>
              <View style={styles.legendItem}>
                <View style={[styles.legendColor, {backgroundColor: 'rgba(255, 255, 0, 0.7)'}]} />
                <Text style={styles.legendText}>Low Risk</Text>
              </View>
            </View>
          </View>
        )}
      </View>
    );
  }
  
  const styles = StyleSheet.create({
    container: { flex: 1 },
    loading: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  
    // CAMERA MODE
    cameraContainer: { flex: 1 },
    cameraFull: { flex: 1 },
    snapButton: {
      position: 'absolute',
      bottom: 60,
      alignSelf: 'center',
      width: 80,
      height: 80,
      borderRadius: 40,
      backgroundColor: 'white',
      justifyContent: 'center',
      alignItems: 'center',
      elevation: 6,
      zIndex: 2,
    },
    closeIcon: {
      position: 'absolute',
      top: 60,
      left: 20,
      width: 40,
      height: 40,
      borderRadius: 20,
      backgroundColor: 'rgba(0,0,0,0.6)',
      justifyContent: 'center',
      alignItems: 'center',
      zIndex: 3,
    },
  
    // MAP MODE UI
    topButtons: {
      position: 'absolute',
      top: 40,
      left: 20,
      right: 20,
      flexDirection: 'row',
      justifyContent: 'space-between',
    },
    menuButton: {
      backgroundColor: 'rgba(0,0,0,0.6)',
      borderRadius: 20,
      padding: 8,
    },
    infoButton: {
      backgroundColor: 'rgba(0,0,0,0.6)',
      borderRadius: 20,
      padding: 8,
    },
    infoPanel: {
      position: 'absolute',
      top: 90,
      right: 20,
      backgroundColor: 'white',
      padding: 12,
      borderRadius: 10,
      shadowColor: '#000',
      shadowOpacity: 0.3,
      shadowOffset: { width: 0, height: 2 },
      elevation: 5,
    },
    infoText: { fontSize: 14 },
  
    bottomButtons: {
      position: 'absolute',
      bottom: 30,
      left: 10,
      right: 30,
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
    },
    profileButton: {
      width: 72,
      height: 72,
      borderRadius: 36,
      borderWidth: 2,
      borderColor: 'white',
    },
    profileImage: {
      width: '100%',
      height: '100%',
      borderRadius: 36,
    },
  
    cameraButton: {
      backgroundColor: '#007bff',
      width: 112,
      height: 112,
      borderRadius: 56,
      justifyContent: 'center',
      alignItems: 'center',
      elevation: 6,
    },
    shopButton: {
      backgroundColor: '#28a745',
      width: 52,
      height: 52,
      borderRadius: 10,
      justifyContent: 'center',
      alignItems: 'center',
    },
    tooltip: {
      position: 'absolute',
      top: 60,
      alignSelf: 'center',
      backgroundColor: 'rgba(0,0,0,0.6)',
      paddingHorizontal: 12,
      paddingVertical: 6,
      borderRadius: 8,
      zIndex: 4,
    },
    tooltipText: {
      color: 'white',
      fontSize: 14,
    },
    profileNameOverlay: {
      position: 'absolute',
      bottom: -15,
      right: -24,
      backgroundColor: 'rgba(0, 0, 0, 0.8)',
      borderWidth: 1,
      borderColor: 'white',
      paddingHorizontal: 8,
      paddingVertical: 4,
      borderRadius: 14,
      zIndex: 4,
    },
    profileNameOverlayText: {
      color: 'white',
      fontSize: 14,
      fontWeight: 'bold',
      textShadowColor: 'rgba(0, 0, 0, 0.75)',
      textShadowOffset: { width: 0, height: 1 },
      textShadowRadius: 2,
    },
    dropdownMenu: {
      position: 'absolute',
      top: 80,
      left: 20,
      width: 150,
      backgroundColor: '#fff',
      // iOS shadow
      shadowColor: '#000',
      shadowOpacity: 0.1,
      shadowOffset: { width: 0, height: 2 },
      shadowRadius: 8,
      // Android elevation
      elevation: 5,
      borderRadius: 12,
      paddingVertical: 10,
      paddingHorizontal: 10,
      zIndex: 10,
      // height removed to auto-size
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
      fontSize: 18,
      color: '#333',
      fontWeight: '600',
    },



  
    resultsContainer: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      backgroundColor: '#E5E9F0',  
      padding: 16,
    },
    resultImage: {
      width: '100%',
      height: 260,
      resizeMode: 'cover',
      borderRadius: 12,
      marginBottom: 16,
    },
    // Card for scan results
    resultsCard: {
      backgroundColor: '#FFFFFF',
      borderRadius: 16,
      padding: 24,
      marginHorizontal: 16,
      shadowColor: '#000',
      shadowOpacity: 0.05,
      shadowOffset: { width: 0, height: 4 },
      shadowRadius: 12,
      elevation: 6,
      width: '100%',
      maxWidth: 420,
      alignItems: 'center',
    },
    statsRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      width: '100%',
      marginVertical: 24,
    },
    statBox: {
      flex: 1,
      alignItems: 'center',
      paddingVertical: 12,
      marginHorizontal: 8,
      backgroundColor: '#F3F4F6',
      borderRadius: 12,
    },
    statNumber: {
      fontSize: 22,
      fontWeight: '700',
      color: '#1F2937',
      marginTop: 6,
    },
    statLabel: {
      fontSize: 14,
      color: '#6B7280',
      marginTop: 4,
    },
    resultButton: {
      backgroundColor: '#2563EB',
      paddingVertical: 14,
      paddingHorizontal: 36,
      borderRadius: 12,
      marginTop: 8,
    },
    resultButtonText: {
      color: '#FFFFFF',
      fontSize: 18,
      fontWeight: '700',
    },
    imageWrapper: {
      width: '100%',
      height: 260,
      borderRadius: 12,
      overflow: 'hidden',
      marginBottom: 24,
      borderWidth: 1,
      borderColor: '#DDD',
      justifyContent: 'center',
      alignItems: 'center',
    },
    toggleItem: {
      justifyContent: 'space-between',
    },
    sliderItem: {
      flexDirection: 'column',
      alignItems: 'flex-start',
      paddingTop: 8,
      paddingBottom: 12,
    },
    sliderLabel: {
      fontSize: 14,
      color: '#666',
      marginBottom: 8,
    },
    slider: {
      width: '100%',
      height: 40,
    },


    toggle: {
      marginLeft: 8,
    },
    
    // Map Legend
    mapLegend: {
      position: 'absolute',
      right: 20,
      bottom: 160,
      backgroundColor: 'white',
      padding: 12,
      borderRadius: 10,
      shadowColor: '#000',
      shadowOpacity: 0.3,
      shadowOffset: { width: 0, height: 2 },
      elevation: 5,
    },
    legendTitle: {
      fontSize: 14,
      fontWeight: 'bold',
      marginBottom: 8,
      textAlign: 'center',
    },
    legendItems: {
      flexDirection: 'column',
      gap: 8,
    },
    legendItem: {
      flexDirection: 'row',
      alignItems: 'center',
    },
    legendColor: {
      width: 16,
      height: 16,
      marginRight: 8,
    },
    legendText: {
      fontSize: 12,
    },   
    // Themed panel parent
    progressPanel: {
      position: 'absolute',
      zIndex: 20,
      width: 240,
      height: 100,
      padding: 8,
      backgroundColor: 'transparent',
      overflow: 'hidden',
    },
    progressPanelImage: {
      resizeMode: 'stretch',
      borderRadius: 12,
    },
    progressSlider: {
      flex: 1,
      justifyContent: 'space-between',
    },
    decorationLeft: {
      position: 'absolute',
      top: 6,
      left: 6,
    },
    decorationRight: {
      position: 'absolute',
      top: 6,
      right: 6,
    },
    progressHeader: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
    },
    progressCount: {
      color: '#FFD700',
      marginLeft: 8,
      fontSize: 14,
    },
    progressBarBackground: {
      width: '95%',
      height: 25,
      borderRadius: 12, // fully round corners
      backgroundColor: '#2e2e2e',  // very dark grey for unfilled bar
      overflow: 'visible',   // allow coin to overflow
      marginTop: 8,
    },
    progressBarFill: {
      height: '100%',
      backgroundColor: '#FFA500',
      borderRadius: 12,
    },
    nextRewardIcon: {
      position: 'absolute',
      right: -13,        // shift icon to overlap end of bar
      top: '50%',
      marginTop: -18,    // center icon vertically over bar (half of height)
      width: 34,         // larger icon size
      height: 34,
      borderRadius: 25,  // match half of width/height
      zIndex: 5,
    },
    // Overlay for trash collected number on progress bar
    trashCollectedOverlay: {
      position: 'absolute',
      top: '17%',       // moved up
      right: '20%',     // shifted to the right
      fontSize: 26,     // larger text
      fontWeight: 'bold',
      color: '#FFA500', // orange
      zIndex: 2,
    },
    // Smaller “items” text next to trash count
    trashCollectedItems: {
      fontSize: 16,       // smaller than the main number
      fontWeight: 'normal',
      color: '#FFA500',   // match the orange color
    },

});

