import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';

export default function AppHeader({ title, showBack = true, onBackPress }) {
  const router = useRouter();

  const handleBack = () => {
    if (onBackPress) {
      onBackPress();
    } else {
      router.back();
    }
  };

  return (
    <View style={styles.header}>
      {showBack && (
        <TouchableOpacity onPress={handleBack} style={styles.backButton}>
          <Text style={styles.backIcon}>←</Text>
        </TouchableOpacity>
      )}
      
      {/* Show Logo/App Name if no title, otherwise show title */}
      {!title ? (
        <View style={styles.logoContainer}>
          <View style={styles.logo}>
            <Text style={styles.logoText}>🏛️</Text>
          </View>
          <Text style={styles.appName}>Niti Nidhi</Text>
        </View>
      ) : (
        <Text style={styles.headerTitle} numberOfLines={1}>{title}</Text>
      )}
      
      <View style={styles.headerIcons}>
        <TouchableOpacity style={styles.headerIcon}>
          <Text style={styles.headerIconText}>💬</Text>
        </TouchableOpacity>
        <TouchableOpacity style={[styles.headerIcon, { backgroundColor: '#BFDBFE' }]}>
          <Text style={styles.headerIconText}>🔔</Text>
        </TouchableOpacity>
        <TouchableOpacity style={[styles.headerIcon, { backgroundColor: '#93C5FD' }]}>
          <Text style={styles.headerIconText}>👤</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    backgroundColor: '#1F2937',
    paddingHorizontal: 20,
    paddingTop: 48,
    paddingBottom: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderBottomWidth: 1,
    borderBottomColor: '#374151',
  },
  backButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    marginRight: 8,
  },
  backIcon: {
    color: '#fff',
    fontSize: 24,
  },
  logoContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  logo: {
    width: 36,
    height: 36,
    backgroundColor: '#A78BFA',
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 8,
  },
  logoText: {
    fontSize: 20,
  },
  appName: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  headerTitle: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
    flex: 1,
    marginLeft: 8,
    marginRight: 8,
  },
  headerIcons: {
    flexDirection: 'row',
    gap: 12,
  },
  headerIcon: {
    width: 40,
    height: 40,
    backgroundColor: '#374151',
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerIconText: {
    fontSize: 18,
  },
});

