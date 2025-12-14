import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, StatusBar, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import BottomNav from './components/BottomNav';
import AppHeader from './components/AppHeader';

export default function SchemesScreen() {
  const router = useRouter();
  const [userName, setUserName] = useState('User');

  useEffect(() => {
    loadUserName();
  }, []);

  const loadUserName = async () => {
    try {
      const profileData = await AsyncStorage.getItem('@user_profile');
      if (profileData) {
        const profile = JSON.parse(profileData);
        if (profile.fullName) {
          const firstName = profile.fullName.split(' ')[0].toLowerCase();
          setUserName(firstName);
        }
      }
    } catch (error) {
      console.error('Error loading user name:', error);
    }
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#1F2937" />
      
      {/* Header */}
      <AppHeader title="My Schemes" />

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Greeting */}
        <Text style={styles.greeting}>hello, {userName}</Text>

        {/* Hero Card */}
        <View style={styles.heroCard}>
          <View style={styles.emojiContainer}>
            <Text style={styles.heroEmoji}>🙌</Text>
            <View style={styles.badge}>
              <Text style={styles.badgeEmoji}>🎯</Text>
            </View>
          </View>
          <View style={styles.dots}>
            <View style={[styles.dot, styles.activeDot]} />
            <View style={styles.dot} />
            <View style={styles.dot} />
          </View>
        </View>

        {/* Check Status Button */}
        <TouchableOpacity 
          style={styles.actionButton}
          onPress={() => router.push('/check-status')}
        >
          <View style={styles.buttonIconContainer}>
            <Text style={styles.buttonIcon}>✓</Text>
          </View>
          <Text style={styles.buttonText}>Check Status</Text>
        </TouchableOpacity>

        {/* Apply Now Button */}
        <TouchableOpacity 
          style={styles.actionButton}
          onPress={() => router.push('/apply-schemes')}
        >
          <View style={styles.buttonIconContainer}>
            <Text style={styles.buttonIcon}>📝</Text>
          </View>
          <Text style={styles.buttonText}>Apply Now</Text>
        </TouchableOpacity>

        {/* Explore Schemes Button */}
        <TouchableOpacity 
          style={styles.actionButton}
          onPress={() => router.push('/explore-schemes')}
        >
          <View style={styles.buttonIconContainer}>
            <Text style={styles.buttonIcon}>🔍</Text>
          </View>
          <Text style={styles.buttonText}>Explore Schemes</Text>
        </TouchableOpacity>

        <View style={styles.bottomSpacing} />
      </ScrollView>

      {/* Bottom Navigation */}
      <BottomNav />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
  },
  greeting: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1F2937',
    marginTop: 24,
    marginBottom: 20,
  },
  heroCard: {
    backgroundColor: '#FEF3C7',
    borderRadius: 24,
    padding: 32,
    marginBottom: 24,
    alignItems: 'center',
    minHeight: 200,
  },
  emojiContainer: {
    position: 'relative',
    alignItems: 'center',
    justifyContent: 'center',
    flex: 1,
  },
  heroEmoji: {
    fontSize: 80,
  },
  badge: {
    position: 'absolute',
    top: -10,
    left: -10,
    width: 50,
    height: 50,
    backgroundColor: '#fff',
    borderRadius: 25,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 3,
    borderColor: '#FEF3C7',
  },
  badgeEmoji: {
    fontSize: 24,
  },
  dots: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 16,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#D1D5DB',
  },
  activeDot: {
    backgroundColor: '#1F2937',
  },
  actionButton: {
    backgroundColor: '#F3F4F6',
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#1F2937',
  },
  buttonIconContainer: {
    width: 56,
    height: 56,
    backgroundColor: '#fff',
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
    borderWidth: 2,
    borderColor: '#1F2937',
  },
  buttonIcon: {
    fontSize: 28,
  },
  buttonText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1F2937',
    flex: 1,
  },
  bottomSpacing: {
    height: 100,
  },
});