import React, { useState } from 'react';
import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  TouchableOpacity,
  TextInput,
  SafeAreaView,
  StatusBar,
  Platform,
} from 'react-native';
import { 
  Ionicons,
  MaterialCommunityIcons
} from '@expo/vector-icons';

const STATUS_DATA = [
  { 
    id: '1', 
    title: 'Ayushman Bharat',
    applicationId: 'AB2024001',
    description: 'Health insurance for poor families',
    status: 'Approved',
    date: 'Dec 10, 2024',
    type: 'Scheme'
  },
  { 
    id: '2', 
    title: 'PM-Kisan Nidhi',
    applicationId: 'PM2024052',
    description: 'Income support for farmers',
    status: 'Pending',
    date: 'Dec 15, 2024',
    type: 'Scheme'
  },
  { 
    id: '3', 
    title: 'Road Repair Complaint',
    applicationId: 'CMP2024123',
    description: 'Road damage near market area',
    status: 'In Progress',
    date: 'Dec 12, 2024',
    type: 'Complaint'
  },
  { 
    id: '4', 
    title: 'Swachh Bharat Mission',
    applicationId: 'SB2024078',
    description: 'Sanitation grant application',
    status: 'Under Review',
    date: 'Dec 8, 2024',
    type: 'Scheme'
  },
  { 
    id: '5', 
    title: 'Street Light Issue',
    applicationId: 'CMP2024145',
    description: 'Non-functional street lights',
    status: 'Rejected',
    date: 'Nov 28, 2024',
    type: 'Complaint'
  },
  { 
    id: '6', 
    title: 'Water Supply Issue',
    applicationId: 'CMP2024167',
    description: 'Irregular water supply in area',
    status: 'Pending',
    date: 'Dec 16, 2024',
    type: 'Complaint'
  },
];

const StatusScreen = ({ onBack }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState('Scheme'); // 'Scheme' | 'Complaint'

  const filteredApplications = STATUS_DATA.filter(app => {
    const matchesTab = app.type === activeTab;
    const matchesSearch =
      app.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      app.applicationId.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesTab && matchesSearch;
  });

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#1E3A8A" />
      
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerTop}>
          <TouchableOpacity onPress={onBack} style={styles.backButton}>
            <Ionicons name="arrow-back" size={24} color="#FFF" />
          </TouchableOpacity>

          <View style={styles.headerIcons}>
            <TouchableOpacity style={styles.notifCircle}>
              <Ionicons name="notifications-outline" size={20} color="#1E3A8A" />
              <View style={styles.notifBadge}>
                <Text style={styles.notifBadgeText}>1</Text>
              </View>
            </TouchableOpacity>
            <View style={styles.profileCircle} />
          </View>
        </View>
        
        <View style={styles.searchContainer}>
          <TextInput 
            placeholder="Search" 
            placeholderTextColor="#64748b"
            style={styles.searchInput}
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
          <Ionicons name="search" size={22} color="#64748b" />
        </View>
      </View>

      {/* Schemes / Complaints Tabs */}
      <View style={styles.tabContainer}>
        <TouchableOpacity 
          style={[styles.tab, activeTab === 'Scheme' && styles.tabActive]}
          onPress={() => setActiveTab('Scheme')}
        >
          <Text style={[styles.tabText, activeTab === 'Scheme' && styles.tabTextActive]}>
            Schemes
          </Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={[styles.tab, activeTab === 'Complaint' && styles.tabActive]}
          onPress={() => setActiveTab('Complaint')}
        >
          <Text style={[styles.tabText, activeTab === 'Complaint' && styles.tabTextActive]}>
            Complaints
          </Text>
        </TouchableOpacity>
      </View>

      {/* Content */}
      <ScrollView
        style={styles.mainScroll}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        <Text style={styles.sectionTitle}>Your Applications</Text>

        {filteredApplications.map(app => (
          <View key={app.id} style={styles.statusCard}>
            <View style={styles.cardBody}>
              <Text style={styles.appTitle}>{app.title}</Text>
              <Text style={styles.appDescription}>{app.description}</Text>
            </View>
            <View style={styles.cardDivider} />
            <TouchableOpacity style={styles.viewDetailsButton}>
              <Text style={styles.viewDetailsText}>View Details</Text>
            </TouchableOpacity>
          </View>
        ))}

        {filteredApplications.length === 0 && (
          <View style={styles.emptyState}>
            <MaterialCommunityIcons
              name="file-search-outline"
              size={64}
              color="#CBD5E1"
            />
            <Text style={styles.emptyText}>
              No {activeTab === 'Scheme' ? 'applications' : 'complaints'} found
            </Text>
          </View>
        )}

        <View style={{ height: 40 }} />
      </ScrollView>

      {/* Static AI Button */}
      <View style={styles.fab}>
        <View style={styles.fabInner}>
          <Text style={styles.fabAiText}>AI</Text>
          <MaterialCommunityIcons
            name="message-text-outline"
            size={22}
            color="#1E3A8A"
          />
        </View>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { 
    flex: 1, 
    backgroundColor: '#F3F4F6',
  },
  header: { 
    backgroundColor: '#1E3A8A', 
    padding: 20, 
    paddingTop: Platform.OS === 'android' ? 40 : 20,
    paddingBottom: 20,
  },
  headerTop: { 
    flexDirection: 'row', 
    justifyContent: 'space-between', 
    alignItems: 'center', 
    marginBottom: 20,
  },
  backButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
  },
  headerIcons: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 15,
  },
  notifCircle: { 
    backgroundColor: '#bfdbfe', 
    width: 44, 
    height: 44, 
    borderRadius: 22, 
    justifyContent: 'center', 
    alignItems: 'center', 
    position: 'relative',
  },
  notifBadge: { 
    position: 'absolute', 
    top: 5, 
    right: 8, 
    backgroundColor: '#EF4444', 
    width: 14, 
    height: 14, 
    borderRadius: 7, 
    justifyContent: 'center', 
    alignItems: 'center',
  },
  notifBadgeText: { 
    color: '#fff', 
    fontSize: 8, 
    fontWeight: 'bold',
  },
  profileCircle: { 
    backgroundColor: '#cbd5e1', 
    width: 44, 
    height: 44, 
    borderRadius: 22,
  },
  searchContainer: { 
    backgroundColor: '#fff', 
    borderRadius: 12, 
    flexDirection: 'row', 
    alignItems: 'center', 
    paddingHorizontal: 15, 
    height: 48,
  },
  searchInput: { 
    flex: 1, 
    fontSize: 16, 
    color: '#1a2b5d', 
    fontWeight: '500',
  },

  tabContainer: {
    backgroundColor: '#FFF',
    flexDirection: 'row',
    paddingHorizontal: 20,
    paddingVertical: 10,
    gap: 12,
  },
  tab: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 8,
    backgroundColor: '#F3F4F6',
    alignItems: 'center',
    justifyContent: 'center',
  },
  tabActive: {
    backgroundColor: '#1E3A8A',
  },
  tabText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#6B7280',
  },
  tabTextActive: {
    color: '#FFF',
  },

  mainScroll: { flex: 1 },
  scrollContent: { padding: 20 },

  sectionTitle: { 
    fontSize: 20, 
    fontWeight: 'bold', 
    color: '#1E3A8A', 
    marginBottom: 16,
  },

  statusCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  cardBody: { padding: 20 },
  appTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#111827',
    marginBottom: 6,
  },
  appDescription: {
    fontSize: 14,
    color: '#6B7280',
    lineHeight: 20,
  },
  cardDivider: {
    height: 1,
    backgroundColor: '#F3F4F6',
  },
  viewDetailsButton: {
    padding: 15,
    flexDirection: 'row',
    justifyContent: 'flex-end',
  },
  viewDetailsText: {
    color: '#1E3A8A',
    fontWeight: 'bold',
    fontSize: 14,
  },

  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 80,
  },
  emptyText: {
    color: '#374151',
    fontSize: 18,
    fontWeight: 'bold',
    marginTop: 16,
  },

  fab: { 
    position: 'absolute', 
    bottom: 20, 
    right: 20, 
    backgroundColor: '#fde047', 
    width: 60, 
    height: 60, 
    borderRadius: 30, 
    justifyContent: 'center', 
    alignItems: 'center', 
    shadowOpacity: 0.3, 
    shadowRadius: 5, 
    elevation: 8,
  },
  fabInner: { alignItems: 'center', justifyContent: 'center' },
  fabAiText: { 
    fontSize: 10, 
    fontWeight: '900', 
    color: '#1E3A8A', 
    marginBottom: -2,
  },
});

export default StatusScreen;
