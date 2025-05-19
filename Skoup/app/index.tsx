// app/index.tsx
import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  StyleSheet,
  TouchableOpacity,
  Image,
  Text,
  ActivityIndicator,
  Modal,
} from 'react-native';
import MapView, { PROVIDER_GOOGLE } from 'react-native-maps';
import * as Location from 'expo-location';
import { Camera } from 'expo-camera';
import { Ionicons, MaterialIcons, Entypo } from '@expo/vector-icons';
import { useRouter } from 'expo-router';

const darkMapStyle = [
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
];
const lightMapStyle = [
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
];

export default function HomePage() {
  const router = useRouter();

  // Map state
  const [region, setRegion] = useState(null);
  const [mapStyle, setMapStyle] = useState(darkMapStyle);
  const [infoVisible, setInfoVisible] = useState(false);

  // Camera state
  const [hasCameraPermission, setHasCameraPermission] = useState(false);
  const [cameraVisible, setCameraVisible] = useState(false);
  const cameraRef = useRef<Camera>(null);

  useEffect(() => {
    // location permission + region
    (async () => {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status === 'granted') {
        const loc = await Location.getCurrentPositionAsync({});
        setRegion({
          latitude: loc.coords.latitude,
          longitude: loc.coords.longitude,
          latitudeDelta: 0.05,
          longitudeDelta: 0.05,
        });
      }
    })();
    // camera permission
    (async () => {
      const { status } = await Camera.requestCameraPermissionsAsync();
      setHasCameraPermission(status === 'granted');
    })();
  }, []);

  const handleSnap = async () => {
    if (cameraRef.current) {
      const photo = await cameraRef.current.takePictureAsync();
      console.log('📷', photo.uri);
      setCameraVisible(false);
      // TODO: send photo.uri to detection service
    }
  };

  if (!region) {
    return (
      <View style={styles.loading}>
        <ActivityIndicator size="large" color="#007bff" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <MapView
        style={StyleSheet.absoluteFillObject}
        provider={PROVIDER_GOOGLE}
        showsUserLocation
        followsUserLocation
        region={region}
        customMapStyle={mapStyle}
      />

      {/* top row */}
      <View style={styles.topButtons}>
        <TouchableOpacity style={styles.menuButton} onPress={() => {/* open menu */}}>
          <Entypo name="menu" size={28} color="white" />
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.infoButton}
          onPress={() => setInfoVisible(v => !v)}
        >
          <Ionicons name="information-circle-outline" size={28} color="white" />
        </TouchableOpacity>
      </View>

      {infoVisible && (
        <View style={styles.infoPanel}>
          <Text style={styles.infoText}>This is some expandable info…</Text>
        </View>
      )}

      {/* bottom row */}
      <View style={styles.bottomButtons}>
        {/* profile → /profile */}
        <TouchableOpacity
          style={styles.profileButton}
          onPress={() => router.push('/profile')}
        >
          <Image
            source={{ uri: 'https://i.pravatar.cc/100' }}
            style={styles.profileImage}
          />
        </TouchableOpacity>

        {/* camera */}
        <TouchableOpacity
          style={styles.cameraButton}
          onPress={() => hasCameraPermission && setCameraVisible(true)}
        >
          <Ionicons name="camera" size={36} color="white" />
        </TouchableOpacity>

        {/* shop → /shop */}
        <TouchableOpacity
          style={styles.shopButton}
          onPress={() => router.push('/shop')}
        >
          <MaterialIcons name="store" size={24} color="white" />
        </TouchableOpacity>
      </View>

      {/* camera modal */}
      <Modal visible={cameraVisible} animationType="slide">
        <Camera style={styles.cameraView} ref={cameraRef} ratio="16:9">
          <View style={styles.snapContainer}>
            <TouchableOpacity style={styles.snapButton} onPress={handleSnap}>
              <Ionicons name="ellipse" size={64} color="white" />
            </TouchableOpacity>
          </View>
        </Camera>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  loading: { flex: 1, justifyContent: 'center', alignItems: 'center' },

  topButtons: {
    position: 'absolute',
    top: 40,
    left: 20,
    right: 20,
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  menuButton: { backgroundColor: 'rgba(0,0,0,0.6)', borderRadius: 20, padding: 8 },
  infoButton: { backgroundColor: 'rgba(0,0,0,0.6)', borderRadius: 20, padding: 8 },

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
    left: 20,
    right: 20,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  profileButton: {
    width: 48, height: 48, borderRadius: 24,
    overflow: 'hidden', borderWidth: 2, borderColor: 'white',
  },
  profileImage: { width: '100%', height: '100%' },

  cameraButton: {
    backgroundColor: '#007bff',
    width: 72, height: 72, borderRadius: 36,
    justifyContent: 'center', alignItems: 'center', elevation: 6,
  },

  shopButton: {
    backgroundColor: '#28a745', padding: 10, borderRadius: 10,
  },

  cameraView: { flex: 1 },
  snapContainer: {
    flex: 1, backgroundColor: 'transparent',
    justifyContent: 'flex-end', alignItems: 'center', paddingBottom: 20,
  },
  snapButton: { alignSelf: 'center' },
});