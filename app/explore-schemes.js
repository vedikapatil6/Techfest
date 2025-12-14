import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, StatusBar, ScrollView, TextInput } from 'react-native';
import { useRouter } from 'expo-router';
import BottomNav from './components/BottomNav';
import AppHeader from './components/AppHeader';

const categories = [
  { id: 1, name: 'Agriculture', icon: '🌾', color: '#E8F5E9' },
  { id: 2, name: 'Health', icon: '🏥', color: '#F3E5F5' },
  { id: 3, name: 'Business', icon: '💼', color: '#FFF3E0' },
  { id: 4, name: 'Education', icon: '🎓', color: '#E3F2FD' },
  { id: 5, name: 'Women', icon: '👩', color: '#FCE4EC' },
  { id: 6, name: 'Housing', icon: '🏠', color: '#FFF8E1' },
  { id: 7, name: 'Sports', icon: '⚽', color: '#E0F2F1' },
  { id: 8, name: 'Science', icon: '🔬', color: '#F1F8E9' },
  { id: 9, name: 'Public Safety', icon: '🛡️', color: '#E8EAF6' },
];

export default function ExploreSchemesScreen() {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState(null);

  const filteredCategories = categories.filter(category =>
    category.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleCategorySelect = (category) => {
    router.push({
      pathname: '/schemes-by-category',
      params: { categoryId: category.id, categoryName: category.name }
    });
  };

  const handleReset = () => {
    setSearchQuery('');
    setSelectedCategory(null);
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#1F2937" />
      
      {/* Header */}
      <AppHeader title="Categories" />

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Sub Header */}
        <View style={styles.subHeader}>
          <Text style={styles.subHeaderTitle}>Choose Category</Text>
          <TouchableOpacity onPress={handleReset}>
            <Text style={styles.resetText}>Reset</Text>
          </TouchableOpacity>
        </View>

        {/* Search Bar */}
        <View style={styles.searchContainer}>
          <TextInput
            style={styles.searchInput}
            placeholder="Search"
            value={searchQuery}
            onChangeText={setSearchQuery}
            placeholderTextColor="#9CA3AF"
          />
          <TouchableOpacity style={styles.filterButton}>
            <Text style={styles.filterIcon}>🔽</Text>
          </TouchableOpacity>
        </View>

        {/* Categories Grid */}
        <View style={styles.categoriesGrid}>
          {filteredCategories.map((category) => (
            <TouchableOpacity
              key={category.id}
              style={[
                styles.categoryCard,
                selectedCategory === category.id && styles.selectedCategoryCard
              ]}
              onPress={() => handleCategorySelect(category)}
            >
              <View style={[styles.categoryIconContainer, { backgroundColor: category.color }]}>
                <Text style={styles.categoryIcon}>{category.icon}</Text>
              </View>
              <Text style={styles.categoryName}>{category.name}</Text>
            </TouchableOpacity>
          ))}
        </View>

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
    backgroundColor: '#F3F4F6',
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
  },
  subHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 24,
    marginBottom: 16,
  },
  subHeaderTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1F2937',
  },
  resetText: {
    fontSize: 14,
    color: '#6B7280',
    fontWeight: '500',
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 24,
    gap: 12,
  },
  searchInput: {
    flex: 1,
    backgroundColor: '#fff',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    color: '#1F2937',
  },
  filterButton: {
    width: 48,
    height: 48,
    backgroundColor: '#fff',
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  filterIcon: {
    fontSize: 20,
  },
  categoriesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    gap: 12,
  },
  categoryCard: {
    width: '30%',
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 16,
    alignItems: 'center',
    marginBottom: 16,
    minHeight: 120,
    justifyContent: 'center',
  },
  selectedCategoryCard: {
    backgroundColor: '#E0E7FF',
    borderWidth: 2,
    borderColor: '#6366F1',
  },
  categoryIconContainer: {
    width: 64,
    height: 64,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  categoryIcon: {
    fontSize: 32,
  },
  categoryName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1F2937',
    textAlign: 'center',
  },
  bottomSpacing: {
    height: 100,
  },
});

