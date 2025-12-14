import { useEffect, useState } from 'react';
import { View, ActivityIndicator, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';

const STORAGE_KEYS = {
  IS_LOGGED_IN: '@is_logged_in',
  USER_PROFILE_COMPLETE: '@user_profile_complete',
};

export default function Index() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    checkAuthStatus();
  }, []);

  const checkAuthStatus = async () => {
    try {
      const isLoggedIn = await AsyncStorage.getItem(STORAGE_KEYS.IS_LOGGED_IN);
      const profileComplete = await AsyncStorage.getItem(STORAGE_KEYS.USER_PROFILE_COMPLETE);

      if (isLoggedIn === 'true') {
        if (profileComplete === 'true') {
          router.replace('/(tabs)');
        } else {
          router.replace('/profile-setup');
        }
      } else {
        router.replace('/login');
      }
    } catch (error) {
      console.error('Error checking auth status:', error);
      router.replace('/login');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" color="#A78BFA" />
      </View>
    );
  }

  return null;
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#1F2937',
  },
});
