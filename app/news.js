import AsyncStorage from '@react-native-async-storage/async-storage';
import { useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, Alert, RefreshControl, ScrollView, StatusBar, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import AppHeader from './components/AppHeader';
import BottomNav from './components/BottomNav';

const API_URL = process.env.EXPO_PUBLIC_API_URL || 'http://localhost:5000/api';

const levelLabels = {
  'gram_panchayat': 'Gram Panchayat',
  'zilla_parishad': 'Zilla Parishad',
  'district': 'District',
  'state': 'State',
  'national': 'National',
};

const NewsCard = ({ news, onPress }) => {
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now - date);
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays === 0) {
      const diffHours = Math.floor(diffTime / (1000 * 60 * 60));
      if (diffHours === 0) {
        const diffMins = Math.floor(diffTime / (1000 * 60));
        return `${diffMins}m ago`;
      }
      return `${diffHours}h ago`;
    } else if (diffDays === 1) {
      return 'Yesterday';
    } else if (diffDays < 7) {
      return `${diffDays}d ago`;
    } else {
      return date.toLocaleDateString('en-IN', {
        day: 'numeric',
        month: 'short',
      });
    }
  };

  return (
    <TouchableOpacity style={styles.newsCard} onPress={onPress} activeOpacity={0.7}>
      <View style={styles.cardHeader}>
        <View style={styles.levelBadge}>
          <View style={styles.levelDot} />
          <Text style={styles.levelText}>{levelLabels[news.level]}</Text>
        </View>
        {news.priority === 'high' && (
          <View style={styles.priorityBadge}>
            <Text style={styles.priorityText}>Important</Text>
          </View>
        )}
      </View>

      <Text style={styles.newsTitle}>{news.title}</Text>
      <Text style={styles.newsDescription} numberOfLines={2}>
        {news.description}
      </Text>

      <View style={styles.cardFooter}>
        {news.location && (
          <Text style={styles.locationText} numberOfLines={1}>
            {news.location}
          </Text>
        )}
        <Text style={styles.newsDate}>{formatDate(news.publishedAt)}</Text>
      </View>
    </TouchableOpacity>
  );
};

export default function NewsScreen() {
  const router = useRouter();
  const [news, setNews] = useState([]);
  const [filteredNews, setFilteredNews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedLevel, setSelectedLevel] = useState('all');

  useEffect(() => {
    loadNews();
  }, []);

  useEffect(() => {
    filterNews();
  }, [selectedLevel, news]);

  const loadNews = async () => {
    try {
      console.log('📤 Fetching news from:', `${API_URL}/news`);
      
      const response = await fetch(`${API_URL}/news`);
      const data = await response.json();
      
      console.log('📥 News response:', data);

      if (data.success) {
        const sortedNews = (data.news || []).sort((a, b) => {
          if (a.priority === 'high' && b.priority !== 'high') return -1;
          if (a.priority !== 'high' && b.priority === 'high') return 1;
          return new Date(b.publishedAt) - new Date(a.publishedAt);
        });
        
        setNews(sortedNews);
        console.log(`✅ Loaded ${sortedNews.length} news items`);
      } else {
        console.error('❌ Failed to load news:', data.message);
      }
    } catch (error) {
      console.error('❌ Error loading news:', error);
      Alert.alert('Error', 'Failed to load news. Please check your connection.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const filterNews = () => {
    if (selectedLevel === 'all') {
      setFilteredNews(news);
    } else {
      setFilteredNews(news.filter(item => item.level === selectedLevel));
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    loadNews();
  };

  const viewNewsDetails = (newsItem) => {
    Alert.alert(
      newsItem.title,
      `${newsItem.description}\n\n${newsItem.location ? `📍 ${newsItem.location}\n` : ''}📅 ${new Date(newsItem.publishedAt).toLocaleString('en-IN')}${newsItem.contact ? `\n📞 ${newsItem.contact}` : ''}`,
      [{ text: 'Close', style: 'cancel' }]
    );
  };

  const levels = [
    { key: 'all', label: 'All' },
    { key: 'gram_panchayat', label: 'Panchayat' },
    { key: 'zilla_parishad', label: 'Zilla' },
    { key: 'district', label: 'District' },
    { key: 'state', label: 'State' },
    { key: 'national', label: 'National' },
  ];

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#1F2937" />
      
      <AppHeader title="News & Updates" />

      {/* Filter Tabs */}
      <View style={styles.filterContainer}>
        <ScrollView 
          horizontal 
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.filterContent}
        >
          {levels.map((level) => (
            <TouchableOpacity
              key={level.key}
              style={[
                styles.filterButton,
                selectedLevel === level.key && styles.filterButtonActive
              ]}
              onPress={() => setSelectedLevel(level.key)}
              activeOpacity={0.7}
            >
              <Text style={[
                styles.filterText,
                selectedLevel === level.key && styles.filterTextActive
              ]}>
                {level.label}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#8B5CF6" />
        </View>
      ) : (
        <ScrollView 
          style={styles.content}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl 
              refreshing={refreshing} 
              onRefresh={onRefresh}
              tintColor="#8B5CF6"
              colors={['#8B5CF6']}
            />
          }
        >
          {filteredNews.length === 0 ? (
            <View style={styles.emptyContainer}>
              <View style={styles.emptyIconContainer}>
                <Text style={styles.emptyIcon}>📰</Text>
              </View>
              <Text style={styles.emptyText}>No Updates</Text>
              <Text style={styles.emptySubtext}>
                {selectedLevel === 'all' 
                  ? 'Check back later for new updates'
                  : `No ${levelLabels[selectedLevel]} updates`}
              </Text>
            </View>
          ) : (
            <>
              <View style={styles.countContainer}>
                <Text style={styles.countText}>{filteredNews.length} Update{filteredNews.length !== 1 ? 's' : ''}</Text>
              </View>
              {filteredNews.map((newsItem) => (
                <NewsCard
                  key={newsItem._id || newsItem.id}
                  news={newsItem}
                  onPress={() => viewNewsDetails(newsItem)}
                />
              ))}
            </>
          )}

          <View style={styles.bottomSpacing} />
        </ScrollView>
      )}

      <BottomNav />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FAFAFA',
  },
  filterContainer: {
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  filterContent: {
    paddingHorizontal: 20,
    paddingVertical: 16,
    gap: 10,
  },
  filterButton: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 20,
    backgroundColor: '#F5F5F5',
    marginRight: 8,
  },
  filterButtonActive: {
    backgroundColor: '#8B5CF6',
  },
  filterText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#666',
  },
  filterTextActive: {
    color: '#fff',
  },
  content: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  countContainer: {
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 12,
  },
  countText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#999',
    letterSpacing: 0.5,
  },
  newsCard: {
    backgroundColor: '#fff',
    marginHorizontal: 20,
    marginBottom: 12,
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: '#F0F0F0',
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  levelBadge: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  levelDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#8B5CF6',
    marginRight: 8,
  },
  levelText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#8B5CF6',
    letterSpacing: 0.3,
  },
  priorityBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 4,
    backgroundColor: '#FEF3F2',
  },
  priorityText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#DC2626',
    letterSpacing: 0.3,
  },
  newsTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1A1A1A',
    marginBottom: 8,
    lineHeight: 22,
  },
  newsDescription: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
    marginBottom: 12,
  },
  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#F5F5F5',
  },
  locationText: {
    fontSize: 12,
    color: '#999',
    flex: 1,
    marginRight: 12,
  },
  newsDate: {
    fontSize: 12,
    color: '#999',
    fontWeight: '500',
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 100,
    paddingHorizontal: 40,
  },
  emptyIconContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#F5F3FF',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
  },
  emptyIcon: {
    fontSize: 40,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1A1A1A',
    marginBottom: 8,
  },
  emptySubtext: {
    fontSize: 14,
    color: '#999',
    textAlign: 'center',
    lineHeight: 20,
  },
  bottomSpacing: {
    height: 100,
  },
});