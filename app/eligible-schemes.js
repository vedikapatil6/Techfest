import React, { useState } from 'react';
import {
  StyleSheet,
  View,
  Text,
  ScrollView,
  TextInput,
  SafeAreaView,
  StatusBar,
  TouchableOpacity,
  Platform,
} from 'react-native';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';

const SCHEMES = [
  {
    id: '1',
    title: 'Ayushman Bharat',
    subtitle: 'Health insurance for poor families',
    eligibility: 'Below poverty line',
    iconType: 'health',
  },
  {
    id: '2',
    title: 'Pradhan Mantri Jan Dhan Yojana',
    subtitle: 'Free health insurance',
    eligibility: 'Economically weaker sections',
    iconType: 'finance',
  },
  {
    id: '3',
    title: 'Pradhan Mantri Awas Yojana',
    subtitle: 'Housing scheme',
    eligibility: 'Economically weaker sections',
    iconType: 'housing',
  },
];

// --- Eligible Schemes Screen Component ---
const EligibleSchemesScreen = ({ onBack }) => {
  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#1e3a8a" />
      
      {/* Header Section */}
      <Header onBack={onBack} />

      {/* Main Content List */}
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {SCHEMES.map((scheme) => (
          <SchemeCard key={scheme.id} data={scheme} />
        ))}
        <View style={{ height: 100 }} />
      </ScrollView>

      {/* AI Floating Button */}
      <AIFloatingButton />
    </SafeAreaView>
  );
};

// --- Sub Components ---

const Header = ({ onBack }) => {
  return (
    <View style={styles.headerContainer}>
      <View style={styles.headerTop}>
        {/* Logo */}
        <TouchableOpacity style={styles.logoBox} onPress={onBack}>
          <MaterialCommunityIcons name="bank" size={24} color="#1e3a8a" />
        </TouchableOpacity>

        {/* Right Actions */}
        <View style={styles.headerActions}>
          <TouchableOpacity style={styles.bellButton}>
            <Ionicons name="notifications-outline" size={24} color="white" />
            <View style={styles.bellBadge}>
              <Text style={styles.bellBadgeText}>1</Text>
            </View>
          </TouchableOpacity>
          <View style={styles.profileCircle} />
        </View>
      </View>

      {/* Search Bar */}
      <View style={styles.searchBarWrapper}>
        <TextInput
          placeholder="Search"
          placeholderTextColor="#4b5563"
          style={styles.searchInput}
        />
        <Ionicons name="search" size={20} color="#6b7280" style={styles.searchIcon} />
      </View>
    </View>
  );
};

const SchemeCard = ({ data }) => {
  const getIcon = () => {
    switch (data.iconType) {
      case 'health':
        return (
          <View style={[styles.cardIconBox, { backgroundColor: '#e5e7eb' }]}>
            <Ionicons name="add" size={32} color="#ef4444" strokeWidth={4} />
          </View>
        );
      case 'finance':
        return (
          <View style={[styles.cardIconBox, { backgroundColor: 'transparent' }]}>
            <MaterialCommunityIcons name="gold" size={40} color="#fbbf24" />
          </View>
        );
      case 'housing':
        return (
          <View style={[styles.cardIconBox, { backgroundColor: 'transparent' }]}>
            <Ionicons name="home" size={40} color="#f97316" />
          </View>
        );
      default:
        return null;
    }
  };

  return (
    <View style={styles.cardContainer}>
      <View style={styles.cardContent}>
        {/* Top Row: Icon + Texts */}
        <View style={styles.cardHeader}>
          <View style={styles.iconContainer}>
            {getIcon()}
          </View>
          <View style={styles.textContainer}>
            <Text style={styles.cardTitle}>{data.title}</Text>
            <Text style={styles.cardSubtitle}>{data.subtitle}</Text>
          </View>
        </View>

        {/* Divider */}
        <View style={styles.cardDivider} />

        {/* Bottom Row: Eligibility + Button */}
        <View style={styles.cardFooter}>
          <View style={{ flex: 1 }}>
            <Text style={styles.eligibilityLabel}>Eligibility:</Text>
            <Text style={styles.eligibilityValue}>{data.eligibility}</Text>
          </View>
          <TouchableOpacity style={styles.applyButton}>
            <Text style={styles.applyButtonText}>Apply</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
};

const AIFloatingButton = () => {
  return (
    <View style={styles.fabContainer}>
      <TouchableOpacity style={styles.fab} activeOpacity={0.9}>
        <View style={styles.fabIconBadge}>
          <MaterialCommunityIcons name="message-text-outline" size={14} color="#3b82f6" />
        </View>
        <Text style={styles.fabText}>AI</Text>
      </TouchableOpacity>
    </View>
  );
};

// --- Styles ---

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f3f4f6',
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 20,
  },

  // Header
  headerContainer: {
    backgroundColor: '#1e3a8a',
    paddingTop: Platform.OS === 'android' ? 40 : 60,
    paddingBottom: 24,
    paddingHorizontal: 20,
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
  },
  headerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 24,
  },
  logoBox: {
    width: 48,
    height: 48,
    backgroundColor: '#dbeafe',
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: '#fff',
  },
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  bellButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#60a5fa',
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  bellBadge: {
    position: 'absolute',
    top: 8,
    right: 10,
    width: 14,
    height: 14,
    backgroundColor: 'white',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 7,
  },
  bellBadgeText: {
    fontSize: 10,
    fontWeight: 'bold',
    color: '#1e3a8a',
  },
  profileCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#d1d5db',
  },
  searchBarWrapper: {
    position: 'relative',
    justifyContent: 'center',
  },
  searchInput: {
    backgroundColor: 'white',
    borderRadius: 8,
    paddingVertical: 10,
    paddingHorizontal: 16,
    paddingRight: 40,
    fontSize: 16,
    color: '#1f2937',
    fontWeight: '500',
  },
  searchIcon: {
    position: 'absolute',
    right: 12,
  },

  // Cards
  cardContainer: {
    backgroundColor: 'white',
    borderRadius: 8,
    padding: 16,
    marginBottom: 16,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  cardContent: {
    flexDirection: 'column',
  },
  cardHeader: {
    flexDirection: 'row',
    marginBottom: 12,
  },
  iconContainer: {
    marginRight: 16,
    justifyContent: 'center',
  },
  cardIconBox: {
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
  },
  textContainer: {
    flex: 1,
    justifyContent: 'center',
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#000',
    marginBottom: 4,
  },
  cardSubtitle: {
    fontSize: 14,
    color: '#6b7280',
    lineHeight: 20,
  },
  cardDivider: {
    height: 1,
    backgroundColor: '#e5e7eb',
    marginVertical: 12,
  },
  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  eligibilityLabel: {
    fontSize: 10,
    color: '#9ca3af',
    marginBottom: 2,
  },
  eligibilityValue: {
    fontSize: 12,
    color: '#4b5563',
    fontWeight: '500',
  },
  applyButton: {
    backgroundColor: '#1e3a8a',
    paddingVertical: 8,
    paddingHorizontal: 20,
    borderRadius: 6,
  },
  applyButtonText: {
    color: 'white',
    fontWeight: '600',
    fontSize: 14,
  },

  // FAB
  fabContainer: {
    position: 'absolute',
    bottom: 20,
    right: 20,
    zIndex: 50,
  },
  fab: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: '#fde047',
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 6,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    borderWidth: 4,
    borderColor: 'rgba(255,255,255,0.3)',
  },
  fabIconBadge: {
    position: 'absolute',
    top: 10,
    right: 10,
    backgroundColor: '#bfdbfe',
    borderRadius: 10,
    padding: 3,
  },
  fabText: {
    color: '#b45309',
    fontWeight: 'bold',
    fontSize: 16,
    marginTop: 8,
  },
});

export default EligibleSchemesScreen;
