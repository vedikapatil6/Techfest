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



// --- Constants ---
const UPDATES = [
  {
    id: '1',
    source: 'Gram Panchayat',
    isImportant: true,
    type: 'ALERT',
    title: 'Cyclone Warning in Coastal Maharashtra',
    description: 'Heavy rainfall expected in next 48 hours. Please take necessary precautions and stay indoors.',
    location: 'Shivaji Nagar Gram Panchayat',
    date: '15 Dec',
    category: 'Panchayat'
  },
  {
    id: '2',
    source: 'Gram Panchayat',
    isImportant: true,
    type: 'INFO',
    title: 'New Water Supply Schemes Approved',
    description: 'The gram panchayat has approved a new water supply scheme that will benefit over 500 households in the region.',
    location: 'Shivaji Nagar Gram Panchayat',
    date: '15 Dec',
    category: 'Panchayat'
  },
  {
    id: '3',
    source: 'District Administration',
    isImportant: false,
    type: 'INFO',
    title: 'Health Camp Registration Open',
    description: 'Free health checkup camp for seniors starting next Monday at the District General Hospital.',
    location: 'District Health Dept',
    date: '14 Dec',
    category: 'District'
  },
  {
    id: '4',
    source: 'Gram Panchayat',
    isImportant: false,
    type: 'INFO',
    title: 'Road Construction Updates',
    description: 'New road construction work will begin from next week connecting main village to nearby towns.',
    location: 'Shivaji Nagar Gram Panchayat',
    date: '13 Dec',
    category: 'Panchayat'
  }
];



// --- Main Component ---
function NewsScreen({ onBack }) {
  const [activeFilter, setActiveFilter] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');


  // Filter by category first, then by search query
  const filteredUpdates = UPDATES.filter(update => {
    const matchesCategory = activeFilter === 'All' || update.category === activeFilter;
    const matchesSearch = 
      update.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      update.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      update.location.toLowerCase().includes(searchQuery.toLowerCase());
    
    return matchesCategory && matchesSearch;
  });


  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#1E3A8A" />
      
      {/* Header Section */}
      <View style={styles.header}>
        <View style={styles.headerTop}>
          <TouchableOpacity onPress={onBack} style={styles.backButton}>
            <Ionicons name="arrow-back" size={24} color="#FFF" />
          </TouchableOpacity>


          <Text style={styles.headerTitle}>News & Updates</Text>


          <View style={styles.headerIcons}>
            <TouchableOpacity style={styles.iconButton}>
              <Ionicons name="notifications-outline" size={20} color="#FFF" />
              <View style={styles.badge}>
                <Text style={styles.badgeText}>1</Text>
              </View>
            </TouchableOpacity>
          </View>
        </View>
        
        <View style={styles.searchBar}>
          <TextInput 
            placeholder="Search updates..." 
            placeholderTextColor="#94a3b8"
            style={styles.searchInput}
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
          <Ionicons name="search" size={20} color="#94a3b8" />
        </View>
      </View>


      <ScrollView style={styles.mainScroll} showsVerticalScrollIndicator={false}>
        {/* Filters */}
        <View style={styles.filterRow}>
          {['All', 'Panchayat', 'District'].map((f) => (
            <TouchableOpacity 
              key={f}
              onPress={() => setActiveFilter(f)}
              style={[styles.filterBtn, activeFilter === f && styles.filterBtnActive]}
            >
              <Text style={[styles.filterBtnText, activeFilter === f && styles.filterBtnTextActive]}>
                {f}
              </Text>
            </TouchableOpacity>
          ))}
        </View>


        <Text style={styles.updateCounter}>{filteredUpdates.length} Updates</Text>


        {/* Update Cards */}
        {filteredUpdates.length > 0 ? (
          filteredUpdates.map((item) => (
            <View key={item.id} style={styles.card}>
              <View style={styles.cardHeader}>
                <View style={styles.sourceRow}>
                  <View style={styles.blueDot} />
                  <Text style={styles.sourceText}>{item.source}</Text>
                </View>
                {item.isImportant && (
                  <View style={styles.importantBadge}>
                    <Text style={styles.importantText}>Important</Text>
                  </View>
                )}
              </View>


              <View style={styles.cardBody}>
                {item.type === 'ALERT' && (
                  <View style={styles.alertRow}>
                    <MaterialCommunityIcons name="alert" size={18} color="#ef4444" />
                    <Text style={styles.alertTitle}> ALERT</Text>
                  </View>
                )}
                <Text style={styles.updateTitle}>{item.title}</Text>
                <Text style={styles.updateDesc} numberOfLines={2}>{item.description}</Text>
              </View>


              <View style={styles.cardInnerDivider} />


              <View style={styles.cardFooter}>
                <Text style={styles.footerLocation}>{item.location}</Text>
                <Text style={styles.footerDate}>{item.date}</Text>
              </View>
            </View>
          ))
        ) : (
          <View style={styles.emptyState}>
            <MaterialCommunityIcons name="newspaper-variant-outline" size={64} color="#CBD5E1" />
            <Text style={styles.emptyText}>No updates found</Text>
            <Text style={styles.emptySubText}>Try adjusting your search or filter</Text>
          </View>
        )}
      </ScrollView>


      {/* Static AI Button (No functionality) */}
      <View style={styles.fab}>
        <Text style={styles.fabAiText}>AI</Text>
        <MaterialCommunityIcons name="message-text-outline" size={22} color="#1E3A8A" />
      </View>
    </SafeAreaView>
  );
}



const styles = StyleSheet.create({
  container: { 
    flex: 1, 
    backgroundColor: '#f3f4f6' 
  },
  header: { 
    backgroundColor: '#1E3A8A', 
    padding: 20,
    paddingTop: Platform.OS === 'android' ? 40 : 20,
    paddingBottom: 20,
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
  },
  headerTop: { 
    flexDirection: 'row', 
    justifyContent: 'space-between', 
    alignItems: 'center', 
    marginBottom: 16 
  },
  backButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    color: '#FFF',
    fontSize: 18,
    fontWeight: 'bold',
    flex: 1,
    textAlign: 'center',
  },
  headerIcons: {
    flexDirection: 'row',
    width: 40,
    justifyContent: 'flex-end',
  },
  iconButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  badge: {
    position: 'absolute',
    top: 8,
    right: 8,
    backgroundColor: '#EF4444',
    width: 14,
    height: 14,
    borderRadius: 7,
    justifyContent: 'center',
    alignItems: 'center',
  },
  badgeText: {
    color: '#fff',
    fontSize: 8,
    fontWeight: 'bold',
  },
  searchBar: { 
    backgroundColor: '#fff', 
    borderRadius: 12, 
    flexDirection: 'row', 
    alignItems: 'center', 
    paddingHorizontal: 15, 
    height: 48,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  searchInput: { 
    flex: 1, 
    fontSize: 16, 
    color: '#1a2b5d', 
    fontWeight: '500' 
  },
  mainScroll: { 
    flex: 1, 
    padding: 20 
  },
  filterRow: { 
    flexDirection: 'row', 
    gap: 10, 
    marginBottom: 15 
  },
  filterBtn: { 
    paddingVertical: 10, 
    paddingHorizontal: 20, 
    borderRadius: 8, 
    borderWidth: 2, 
    borderColor: '#1E3A8A', 
    backgroundColor: '#fff' 
  },
  filterBtnActive: { 
    backgroundColor: '#1E3A8A' 
  },
  filterBtnText: { 
    color: '#1E3A8A', 
    fontWeight: 'bold',
    fontSize: 14,
  },
  filterBtnTextActive: { 
    color: '#fff' 
  },
  updateCounter: { 
    color: '#64748b', 
    fontSize: 13, 
    marginBottom: 15, 
    fontWeight: '500' 
  },
  card: { 
    backgroundColor: '#fff', 
    borderRadius: 12, 
    padding: 15, 
    marginBottom: 15, 
    shadowColor: '#000', 
    shadowOpacity: 0.1, 
    shadowRadius: 4, 
    elevation: 3, 
    borderWidth: 1, 
    borderColor: '#e2e8f0' 
  },
  cardHeader: { 
    flexDirection: 'row', 
    justifyContent: 'space-between', 
    alignItems: 'center', 
    marginBottom: 10 
  },
  sourceRow: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    gap: 8 
  },
  blueDot: { 
    width: 6, 
    height: 6, 
    borderRadius: 3, 
    backgroundColor: '#1d4ed8' 
  },
  sourceText: { 
    color: '#1E3A8A', 
    fontWeight: '700', 
    fontSize: 14 
  },
  importantBadge: { 
    backgroundColor: '#fee2e2', 
    paddingVertical: 4, 
    paddingHorizontal: 8, 
    borderRadius: 4 
  },
  importantText: { 
    color: '#ef4444', 
    fontSize: 10, 
    fontWeight: 'bold' 
  },
  cardBody: { 
    marginBottom: 15 
  },
  alertRow: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    marginBottom: 8 
  },
  alertTitle: { 
    color: '#ef4444', 
    fontWeight: '900', 
    fontSize: 16 
  },
  updateTitle: { 
    fontSize: 16, 
    fontWeight: 'bold', 
    color: '#000', 
    marginBottom: 6 
  },
  updateDesc: { 
    color: '#64748b', 
    fontSize: 14, 
    lineHeight: 20 
  },
  cardInnerDivider: { 
    height: 1, 
    backgroundColor: '#f1f5f9', 
    marginVertical: 10 
  },
  cardFooter: { 
    flexDirection: 'row', 
    justifyContent: 'space-between' 
  },
  footerLocation: { 
    color: '#94a3b8', 
    fontSize: 12, 
    fontWeight: '500' 
  },
  footerDate: { 
    color: '#94a3b8', 
    fontSize: 12 
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
  emptySubText: {
    color: '#6B7280',
    fontSize: 14,
    marginTop: 8,
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
    elevation: 8 
  },
  fabAiText: { 
    fontSize: 10, 
    fontWeight: '900', 
    color: '#1E3A8A', 
    marginBottom: -2 
  },
});



export default NewsScreen;
