import React, { useState, useEffect } from 'react';
import * as SplashScreen from 'expo-splash-screen';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Slot, useRouter } from 'expo-router';
import { useSegments } from 'expo-router';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { View, TouchableOpacity, StyleSheet, Text } from 'react-native';
import { Entypo } from '@expo/vector-icons';
import { Ionicons } from '@expo/vector-icons';

// -- Authentication Context --
interface AuthContextValue {
  token: string | null;
  login: (newToken: string) => void;
  logout: () => void;
}
const AuthContext = React.createContext<AuthContextValue>({
  token: null,
  login: () => {},
  logout: () => {},
});
export const useAuth = () => React.useContext(AuthContext);

const TOKEN_KEY = '@auth_token';

SplashScreen.preventAutoHideAsync().catch(() => {});

export default function RootLayout() {
    const [token, setToken] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [authError, setAuthError] = useState<string | null>(null);
    const [menuVisible, setMenuVisible] = useState(false);

    // Auth actions
    const login = async (newToken: string) => {
      await AsyncStorage.setItem(TOKEN_KEY, newToken);
      setToken(newToken);
    };
    const logout = async () => {
      await AsyncStorage.removeItem(TOKEN_KEY);
      setToken(null);
      router.replace('/login');
    };

    const toggleMenu = () => {
      setMenuVisible(v => !v);
    };

    const router = useRouter();

    useEffect(() => {
      (async () => {
        try {
          const t = await AsyncStorage.getItem(TOKEN_KEY);
          setToken(t);
        } catch (err) {
          console.error('Auth load error:', err);
          setAuthError('Failed to load authentication.');
        } finally {
          setIsLoading(false);
          SplashScreen.hideAsync().catch(() => {});
        }
      })();
    }, []);

    const segments = useSegments();
    const isAuthRoute = segments.includes('login') || segments.includes('register');
    // Redirect to login if no token after loading
    useEffect(() => {
      if (!isLoading && !token) {
        router.replace('/login');
      }
    }, [isLoading, token]);

    if (isLoading) {
      return null; // keep splash visible
    }

    if (authError) {
      return (
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>{authError}</Text>
        </View>
      );
    }
    
    return (
      <AuthContext.Provider value={{ token, login, logout }}>
        <SafeAreaProvider>
          <Slot />
          {!isAuthRoute && (
            <>
              <View style={styles.menuButtonContainer}>
                <TouchableOpacity style={styles.menuButton} onPress={toggleMenu}>
                  <Entypo name="menu" size={28} color="white" />
                </TouchableOpacity>
              </View>
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
                    onPress={() => { toggleMenu(); /* optionally navigate to settings */ }}
                  >
                    <Ionicons name="settings-outline" size={20} color="#333" style={styles.dropdownIcon} />
                    <Text style={styles.dropdownText}>Settings</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={styles.dropdownItem}
                    onPress={logout}
                  >
                    <Ionicons
                      name="log-out-outline"
                      size={20}
                      color="#333"
                      style={styles.dropdownIcon}
                    />
                    <Text style={styles.dropdownText}>Logout</Text>
                  </TouchableOpacity>
                </View>
              )}
            </>
          )}
        </SafeAreaProvider>
      </AuthContext.Provider>
    );


}

const styles = StyleSheet.create({
    menuButtonContainer: {
      position: 'absolute',
      top: 40,
      left: 20,
      zIndex: 20,
    },
    menuButton: {
      backgroundColor: 'rgba(0,0,0,0.6)',
      padding: 8,
      borderRadius: 20,
    },
    dropdownMenu: {
      position: 'absolute',
      top: 80,
      left: 20,
      width: 180,
      backgroundColor: '#fff',
      borderRadius: 8,
      paddingVertical: 8,
      zIndex: 20,
      // iOS shadow
      shadowColor: '#000',
      shadowOpacity: 0.1,
      shadowOffset: { width: 0, height: 2 },
      shadowRadius: 8,
      // Android
      elevation: 5,
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
    loaderContainer: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      backgroundColor: '#F9FAFB',
    },
    errorContainer: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      padding: 20,
      backgroundColor: '#FDEDED',
    },
    errorText: {
      color: '#B91C1C',
      fontSize: 16,
      textAlign: 'center',
    },
  });