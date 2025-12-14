import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { useRouter, usePathname } from 'expo-router';

export default function BottomNav() {
  const router = useRouter();
  const pathname = usePathname();

  const isActive = (path) => {
    if (path === '/' && pathname === '/(tabs)') return true;
    return pathname === path;
  };

  return (
    <View style={styles.bottomNav}>
      <TouchableOpacity 
        style={styles.navItem} 
        onPress={() => router.push('/(tabs)')}
      >
        <View style={styles.navIconContainer}>
          <Text style={styles.navIcon}>🏠</Text>
        </View>
        <Text style={[styles.navText, isActive('/(tabs)') && styles.activeNavText]}>Home</Text>
      </TouchableOpacity>
      
      <TouchableOpacity style={styles.navItem}>
        <View style={styles.navIconContainer}>
          <Text style={styles.navIcon}>🔍</Text>
        </View>
        <Text style={styles.navText}>Search</Text>
      </TouchableOpacity>
      
      <TouchableOpacity 
        style={styles.navItem}
        onPress={() => router.push('/menu')}
      >
        <View style={styles.navIconContainer}>
          <Text style={styles.navIcon}>☰</Text>
        </View>
        <Text style={[styles.navText, isActive('/menu') && styles.activeNavText]}>Menu</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  bottomNav: {
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 20,
    paddingBottom: 20,
    paddingTop: 12,
  },
  navItem: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  navIconContainer: {
    width: 48,
    height: 48,
    alignItems: 'center',
    justifyContent: 'center',
  },
  navIcon: {
    fontSize: 28,
  },
  navText: {
    fontSize: 12,
    color: '#6B7280',
    marginTop: 2,
  },
  activeNavText: {
    color: '#2563EB',
    fontWeight: '600',
  },
});



