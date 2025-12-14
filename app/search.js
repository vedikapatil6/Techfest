import AsyncStorage from '@react-native-async-storage/async-storage';
import { useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { FlatList, ScrollView, StatusBar, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import AppHeader from './components/AppHeader';
import BottomNav from './components/BottomNav';

const API_URL = process.env.EXPO_PUBLIC_API_URL || 'http://localhost:5000/api';

export default function SearchScreen() {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState({
    schemes: [],
    documents: [],
    complaints: [],
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (searchQuery.trim().length > 2) {
      performSearch(searchQuery);
    } else {
      setSearchResults({ schemes: [], documents: [], complaints: [] });
    }
  }, [searchQuery]);

  const performSearch = async (query) => {
    setLoading(true);
    try {
      // Search documents from AsyncStorage
      const documentsData = await AsyncStorage.getItem('@documents_list');
      const documents = documentsData ? JSON.parse(documentsData) : [];
      const filteredDocuments = documents.filter(doc =>
        doc.name?.toLowerCase().includes(query.toLowerCase())
      );

      // Search schemes (static list for now)
      const schemes = [
        { id: 1, name: 'Ayushman Bharat', category: 'Health', description: 'Health insurance for poor families' },
        { id: 2, name: 'Pradhan Mantri Jan Arogya Yojana', category: 'Health', description: 'Free health insurance' },
        { id: 3, name: 'National Health Mission', category: 'Health', description: 'Healthcare services in rural areas' },
        { id: 4, name: 'Pradhan Mantri Awas Yojana', category: 'Housing', description: 'Affordable housing scheme' },
        { id: 5, name: 'Pradhan Mantri Kisan Samman Nidhi', category: 'Agriculture', description: 'Income support for farmers' },
        { id: 6, name: 'Beti Bachao Beti Padhao', category: 'Women', description: 'Save and educate the girl child' },
      ];
      const filteredSchemes = schemes.filter(scheme =>
        scheme.name.toLowerCase().includes(query.toLowerCase()) ||
        scheme.description.toLowerCase().includes(query.toLowerCase()) ||
        scheme.category.toLowerCase().includes(query.toLowerCase())
      );

      // Search complaints from backend
      let filteredComplaints = [];
      try {
        const deviceId = await AsyncStorage.getItem('@device_id');
        if (deviceId) {
          const response = await fetch(`${API_URL}/complaints/my-complaints?deviceId=${deviceId}`);
          const data = await response.json();
          if (data.success) {
            filteredComplaints = data.complaints.filter(complaint =>
              complaint.category?.toLowerCase().includes(query.toLowerCase()) ||
              complaint.description?.toLowerCase().includes(query.toLowerCase())
            );
          }
        }
      } catch (error) {
        console.error('Error searching complaints:', error);
      }

      setSearchResults({
        schemes: filteredSchemes,
        documents: filteredDocuments,
        complaints: filteredComplaints,
      });
    } catch (error) {
      console.error('Search error:', error);
    } finally {
      setLoading(false);
    }
  };

  const renderSchemeItem = ({ item }) => (
    <TouchableOpacity
      style={styles.resultCard}
      onPress={() => router.push({
        pathname: '/scheme-details',
        params: { schemeId: item.id, schemeName: item.name }
      })}
    >
      <View style={styles.resultIcon}>
        <Text style={styles.resultIconText}>📋</Text>
      </View>
      <View style={styles.resultContent}>
        <Text style={styles.resultTitle}>{item.name}</Text>
        <Text style={styles.resultSubtitle}>{item.category} • {item.description}</Text>
      </View>
      <Text style={styles.resultArrow}>›</Text>
    </TouchableOpacity>
  );

  const renderDocumentItem = ({ item }) => (
    <TouchableOpacity style={styles.resultCard} onPress={() => router.push('/documents')}>
      <View style={styles.resultIcon}>
        <Text style={styles.resultIconText}>📄</Text>
      </View>
      <View style={styles.resultContent}>
        <Text style={styles.resultTitle}>{item.name || 'Document'}</Text>
        <Text style={styles.resultSubtitle}>Document</Text>
      </View>
      <Text style={styles.resultArrow}>›</Text>
    </TouchableOpacity>
  );

  const renderComplaintItem = ({ item }) => (
    <TouchableOpacity style={styles.resultCard} onPress={() => router.push('/check-status')}>
      <View style={styles.resultIcon}>
        <Text style={styles.resultIconText}>📢</Text>
      </View>
      <View style={styles.resultContent}>
        <Text style={styles.resultTitle}>{item.category}</Text>
        <Text style={styles.resultSubtitle} numberOfLines={2}>{item.description}</Text>
      </View>
      <Text style={styles.resultArrow}>›</Text>
    </TouchableOpacity>
  );

  const totalResults = searchResults.schemes.length + searchResults.documents.length + searchResults.complaints.length;

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#fff" />
      
      <AppHeader title="Search" />

      <View style={styles.searchContainer}>
        <TextInput
          style={styles.searchInput}
          placeholder="Search Schemes, Documents, Complaints..."
          placeholderTextColor="#9CA3AF"
          value={searchQuery}
          onChangeText={setSearchQuery}
          autoFocus
        />
        <TouchableOpacity style={styles.searchIcon}>
          <Text style={styles.searchIconText}>🔍</Text>
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {searchQuery.trim().length === 0 ? (
          <View style={styles.emptyState}>
            <Text style={styles.emptyIcon}>🔍</Text>
            <Text style={styles.emptyText}>Search for schemes, documents, or complaints</Text>
            <Text style={styles.emptySubtext}>Type at least 3 characters to start searching</Text>
          </View>
        ) : loading ? (
          <View style={styles.emptyState}>
            <Text style={styles.emptyText}>Searching...</Text>
          </View>
        ) : totalResults === 0 ? (
          <View style={styles.emptyState}>
            <Text style={styles.emptyIcon}>🔍</Text>
            <Text style={styles.emptyText}>No results found</Text>
            <Text style={styles.emptySubtext}>Try different keywords</Text>
          </View>
        ) : (
          <>
            {searchResults.schemes.length > 0 && (
              <>
                <Text style={styles.sectionTitle}>Schemes ({searchResults.schemes.length})</Text>
                <FlatList
                  data={searchResults.schemes}
                  renderItem={renderSchemeItem}
                  keyExtractor={(item) => `scheme-${item.id}`}
                  scrollEnabled={false}
                />
              </>
            )}

            {searchResults.documents.length > 0 && (
              <>
                <Text style={styles.sectionTitle}>Documents ({searchResults.documents.length})</Text>
                <FlatList
                  data={searchResults.documents}
                  renderItem={renderDocumentItem}
                  keyExtractor={(item, index) => `doc-${index}`}
                  scrollEnabled={false}
                />
              </>
            )}

            {searchResults.complaints.length > 0 && (
              <>
                <Text style={styles.sectionTitle}>Complaints ({searchResults.complaints.length})</Text>
                <FlatList
                  data={searchResults.complaints}
                  renderItem={renderComplaintItem}
                  keyExtractor={(item) => `complaint-${item._id || item.id}`}
                  scrollEnabled={false}
                />
              </>
            )}
          </>
        )}

        <View style={styles.bottomSpacing} />
      </ScrollView>

      <BottomNav />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F3F4F6',
    borderRadius: 16,
    paddingHorizontal: 16,
    paddingVertical: 12,
    marginHorizontal: 20,
    marginTop: 16,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  searchInput: {
    flex: 1,
    fontSize: 15,
    color: '#1F2937',
    paddingVertical: 4,
  },
  searchIcon: {
    width: 32,
    height: 32,
    alignItems: 'center',
    justifyContent: 'center',
  },
  searchIconText: {
    fontSize: 18,
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
    marginTop: 40,
  },
  emptyIcon: {
    fontSize: 64,
    marginBottom: 16,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 8,
  },
  emptySubtext: {
    fontSize: 14,
    color: '#6B7280',
    textAlign: 'center',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1F2937',
    marginTop: 24,
    marginBottom: 12,
  },
  resultCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  resultIcon: {
    width: 48,
    height: 48,
    backgroundColor: '#F3F4F6',
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  resultIconText: {
    fontSize: 24,
  },
  resultContent: {
    flex: 1,
  },
  resultTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 4,
  },
  resultSubtitle: {
    fontSize: 14,
    color: '#6B7280',
  },
  resultArrow: {
    fontSize: 24,
    color: '#9CA3AF',
    marginLeft: 8,
  },
  bottomSpacing: {
    height: 100,
  },
});



