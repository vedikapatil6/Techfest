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
const SchemeCategory = {
  ALL: 'All',
  GOVERNMENT: 'Government',
  PRIVATE: 'Private'
};



const SCHEMES = [
  {
    id: '1',
    title: 'Anganwadi Helper',
    department: 'Women and Child Development',
    qualification: '8th and above',
    location: 'Village Level',
    salary: '₹ 8000 - 10,000 per month',
    lastDate: '31 March 2026',
    category: SchemeCategory.GOVERNMENT,
  },
  {
    id: '2',
    title: 'Asha Worker',
    department: 'Health and Family Welfare',
    qualification: '10th and above',
    location: 'Panchayat Level',
    salary: '₹ 5000 - 7,000 + incentives',
    lastDate: '15 June 2025',
    category: SchemeCategory.GOVERNMENT,
  },
  {
    id: '3',
    title: 'Private Security Guard',
    department: 'G4S Security Solutions',
    qualification: 'No formal requirement',
    location: 'City Hubs',
    salary: '₹ 12,000 - 15,000 per month',
    lastDate: 'Ongoing',
    category: SchemeCategory.PRIVATE,
  },
  {
    id: '4',
    title: 'Gram Rozgar Sevak',
    department: 'Rural Development',
    qualification: '12th Pass',
    location: 'Block Level',
    salary: '₹ 10,000 - 12,000 per month',
    lastDate: '12 Jan 2026',
    category: SchemeCategory.GOVERNMENT,
  }
];



// --- Main Component ---
function JobUpdateScreen({ onBack }) {
  const [activeFilter, setActiveFilter] = useState(SchemeCategory.ALL);
  const [searchQuery, setSearchQuery] = useState('');


  // Filter by category first, then by search query
  const filteredSchemes = SCHEMES.filter(scheme => {
    const matchesCategory = activeFilter === SchemeCategory.ALL || scheme.category === activeFilter;
    const matchesSearch = 
      scheme.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      scheme.department.toLowerCase().includes(searchQuery.toLowerCase()) ||
      scheme.qualification.toLowerCase().includes(searchQuery.toLowerCase()) ||
      scheme.location.toLowerCase().includes(searchQuery.toLowerCase());
    
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


          <Text style={styles.headerTitle}>Job Updates</Text>


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
            placeholder="Search schemes..." 
            placeholderTextColor="#94a3b8"
            style={styles.searchInput}
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
          <Ionicons name="search" size={20} color="#94a3b8" />
        </View>
      </View>


      <ScrollView 
        style={styles.content}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 20 }}
      >
        {/* Filter Tabs */}
        <ScrollView 
          horizontal 
          showsHorizontalScrollIndicator={false} 
          style={styles.filterBar}
          contentContainerStyle={{ paddingRight: 20 }}
        >
          {Object.values(SchemeCategory).map((cat) => (
            <TouchableOpacity 
              key={cat}
              onPress={() => setActiveFilter(cat)}
              style={[
                styles.filterTab, 
                activeFilter === cat && styles.filterTabActive
              ]}
            >
              <Text style={[
                styles.filterTabText,
                activeFilter === cat && styles.filterTabTextActive
              ]}>
                {cat}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>


        {/* Scheme Cards */}
        {filteredSchemes.length > 0 ? (
          filteredSchemes.map(scheme => (
            <View key={scheme.id} style={styles.card}>
              <View style={styles.cardHeader}>
                <View style={styles.cardTitleSection}>
                  <Text style={styles.cardTitle}>{scheme.title}</Text>
                  <Text style={styles.cardDept}>{scheme.department}</Text>
                </View>
                <View style={styles.cardLogo}>
                  <View style={styles.cardLogoInner}>
                     <Text style={styles.cardLogoText}>GOVT</Text>
                  </View>
                </View>
              </View>


              <View style={styles.cardInfo}>
                <View style={styles.infoRow}>
                  <MaterialCommunityIcons name="school-outline" size={18} color="#94a3b8" />
                  <Text style={styles.infoText}>{scheme.qualification}</Text>
                </View>
                <View style={styles.infoRow}>
                  <MaterialCommunityIcons name="map-marker-outline" size={18} color="#94a3b8" />
                  <Text style={styles.infoText}>{scheme.location}</Text>
                </View>
                <View style={styles.infoRow}>
                  <MaterialCommunityIcons name="cash" size={18} color="#94a3b8" />
                  <Text style={styles.infoText}>{scheme.salary}</Text>
                </View>
              </View>


              <View style={styles.cardFooter}>
                <View>
                  <Text style={styles.lastDateLabel}>Last Date</Text>
                  <Text style={styles.lastDateValue}>{scheme.lastDate}</Text>
                </View>
                <TouchableOpacity style={styles.categoryButton}>
                  <Text style={styles.categoryButtonText}>{scheme.category}</Text>
                </TouchableOpacity>
              </View>
            </View>
          ))
        ) : (
          <View style={styles.emptyState}>
            <MaterialCommunityIcons name="briefcase-search-outline" size={64} color="#CBD5E1" />
            <Text style={styles.emptyText}>No job schemes found</Text>
            <Text style={styles.emptySubText}>Try adjusting your search or filter</Text>
          </View>
        )}
      </ScrollView>


      {/* Static AI Button (No functionality) */}
      <View style={styles.aiButton}>
        <View style={styles.aiButtonContent}>
          <Text style={styles.aiButtonText}>AI</Text>
          <MaterialCommunityIcons name="message-text-outline" size={20} color="#1E3A8A" />
        </View>
      </View>
    </SafeAreaView>
  );
}



const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  header: {
    backgroundColor: '#1E3A8A',
    paddingHorizontal: 20,
    paddingTop: Platform.OS === 'android' ? 40 : 20,
    paddingBottom: 15,
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
  },
  headerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
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
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 12,
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
    color: '#1e293b',
    fontWeight: '500',
  },
  content: {
    padding: 20,
  },
  filterBar: {
    flexDirection: 'row',
    marginBottom: 20,
  },
  filterTab: {
    backgroundColor: '#fff',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#e2e8f0',
    marginRight: 10,
    minWidth: 100,
    alignItems: 'center',
  },
  filterTabActive: {
    backgroundColor: '#1E3A8A',
    borderColor: '#1E3A8A',
  },
  filterTabText: {
    color: '#64748b',
    fontWeight: '700',
    fontSize: 14,
  },
  filterTabTextActive: {
    color: '#fff',
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 16,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
    borderWidth: 1,
    borderColor: '#f1f5f9',
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  cardTitleSection: {
    flex: 1,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#0f172a',
  },
  cardDept: {
    fontSize: 13,
    color: '#64748b',
    marginTop: 2,
  },
  cardLogo: {
    width: 48,
    height: 48,
    backgroundColor: '#f1f5f9',
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  cardLogoInner: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#dbeafe',
    justifyContent: 'center',
    alignItems: 'center',
  },
  cardLogoText: {
    fontSize: 8,
    fontWeight: '900',
    color: '#1d4ed8',
  },
  cardInfo: {
    gap: 10,
    marginBottom: 20,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  infoText: {
    color: '#475569',
    fontSize: 14,
    fontWeight: '500',
  },
  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: '#f1f5f9',
    paddingTop: 16,
  },
  lastDateLabel: {
    fontSize: 12,
    color: '#94a3b8',
  },
  lastDateValue: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#334155',
  },
  categoryButton: {
    backgroundColor: '#1E3A8A',
    paddingVertical: 8,
    paddingHorizontal: 20,
    borderRadius: 8,
  },
  categoryButtonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 12,
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
  aiButton: {
    position: 'absolute',
    bottom: 20,
    right: 20,
    width: 64,
    height: 64,
    backgroundColor: '#fde047',
    borderRadius: 32,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
    elevation: 8,
  },
  aiButtonContent: {
    alignItems: 'center',
  },
  aiButtonText: {
    fontSize: 12,
    fontWeight: '900',
    color: '#1E3A8A',
  },
});



export default JobUpdateScreen;
