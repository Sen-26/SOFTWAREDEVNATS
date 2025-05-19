import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  StyleSheet,
  TouchableOpacity,
  Image,
  Text,
  ActivityIndicator,
} from 'react-native';
import MapView, { PROVIDER_GOOGLE } from 'react-native-maps';
import * as Location from 'expo-location';
import { CameraView, useCameraPermissions } from 'expo-camera';
import { Ionicons, MaterialIcons, Entypo } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import * as FileSystem from 'expo-file-system';

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
];5
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
    const [region, setRegion] = useState<any>(null);
    const [mapStyle, setMapStyle] = useState(darkMapStyle);
    const [infoVisible, setInfoVisible] = useState(false);
  
    // Camera permission + ref
    const [permission, requestPermission] = useCameraPermissions();
    const cameraRef = useRef<CameraView>(null);
  
    // NEW: toggle camera view
    const [cameraVisible, setCameraVisible] = useState(false);
    const handleSnap = async () => {
      if (cameraRef.current) {
        const photo = await cameraRef.current.takePictureAsync();
        console.log('📷', photo.uri);
        setCameraVisible(false);
        await uploadPhoto(photo);
      }
    };
    const [annotatedImage, setAnnotatedImage] = useState<string | null>(null);
    const [detectionCount, setDetectionCount] = useState<number | null>(null);
    
    const uploadPhoto = async (photo: { uri: string }) => {
      const formData = new FormData();
    
      formData.append('file', {
        uri: photo.uri,
        name: 'photo.jpg',
        type: 'image/jpeg',
      } as any);
    
      try {
        const response = await fetch('http://192.168.243.10:5000/process-image', {
          method: 'POST',
          body: formData,
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        });
    
        const json = await response.json();
    
        if (json.image) {
          const base64Image = `data:image/jpeg;base64,${json.image}`;
          setAnnotatedImage(base64Image);
          setDetectionCount(json.count);
          console.log(json.count)
        } else {
          console.error('Invalid image data from server');
        }
      } catch (error) {
        console.error('❌ Upload failed:', error);
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
        />
  
        {/* Top Buttons */}
        <View style={styles.topButtons}>
          <TouchableOpacity style={styles.menuButton}>
            <Entypo name="menu" size={28} color="white" />
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.infoButton}
            onPress={() => setInfoVisible(v => !v)}
          >
            <Ionicons
              name="information-circle-outline"
              size={28}
              color="white"
            />
          </TouchableOpacity>
        </View>
  
        {/* Info Panel */}
        {infoVisible && (
          <View style={styles.infoPanel}>
            <Text style={styles.infoText}>This is some expandable info…</Text>
          </View>
        )}
  
        {/* Bottom Buttons */}
        <View style={styles.bottomButtons}>
          <TouchableOpacity
            style={styles.profileButton}
            onPress={() => router.push('/profile')}
          >
            <Image
              source={{ uri: 'https://i.pravatar.cc/100' }}
              style={styles.profileImage}
            />
          </TouchableOpacity>
  
          <TouchableOpacity
            style={styles.cameraButton}
            onPress={() => {
              if (!permission?.granted) requestPermission();
              else setCameraVisible(true);
            }}
          >
            <Ionicons name="camera" size={36} color="white" />
          </TouchableOpacity>
  
          <TouchableOpacity
            style={styles.shopButton}
            onPress={() => router.push('/shop')}
          >
            <MaterialIcons name="store" size={24} color="white" />
          </TouchableOpacity>
        </View>
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
      left: 20,
      right: 20,
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
    },
    profileButton: {
      width: 48,
      height: 48,
      borderRadius: 24,
      overflow: 'hidden',
      borderWidth: 2,
      borderColor: 'white',
    },
    profileImage: { width: '100%', height: '100%' },
  
    cameraButton: {
      backgroundColor: '#007bff',
      width: 72,
      height: 72,
      borderRadius: 36,
      justifyContent: 'center',
      alignItems: 'center',
      elevation: 6,
    },
    shopButton: {
      backgroundColor: '#28a745',
      padding: 10,
      borderRadius: 10,
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
  });