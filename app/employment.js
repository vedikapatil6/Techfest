// app/employment.js
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, Alert, RefreshControl, ScrollView, StatusBar, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import AppHeader from './components/AppHeader';
import BottomNav from './components/BottomNav';

// Local fallback data
const localEmploymentData = {
  "opportunities": [
    {
      "id": 1,
      "title": "Anganwadi Helper",
      "department": "Women & Child Development",
      "type": "Government",
      "location": "Village Level",
      "eligibility": "8th pass or above",
      "salary": "₹8,000 – ₹10,000 per month",
      "lastDate": "2025-03-31",
      "contact": "Local Anganwadi Office",
      "description": "Assist Anganwadi worker in nutrition, childcare and record maintenance."
    },
    {
      "id": 2,
      "title": "Data Entry Operator",
      "department": "District Office",
      "type": "Contract",
      "location": "Taluk Office",
      "eligibility": "12th pass, basic computer knowledge",
      "salary": "₹12,000 per month",
      "lastDate": "2025-04-10",
      "contact": "district.admin@gov.in",
      "description": "Entry of citizen records and scheme-related data."
    },
    {
      "id": 3,
      "title": "ASHA Health Worker",
      "department": "Health Department",
      "type": "Government",
      "location": "Rural Area",
      "eligibility": "10th pass, female candidate preferred",
      "salary": "Incentive based",
      "lastDate": "2025-05-01",
      "contact": "Primary Health Centre",
      "description": "Support maternal health, vaccination awareness and community outreach."
    },
    {
      "id": 4,
      "title": "Tailoring & Stitching Work",
      "department": "Self Employment",
      "type": "Skill-Based",
      "location": "Home Based",
      "eligibility": "Basic tailoring skills",
      "salary": "₹500 – ₹700 per day",
      "lastDate": "Open",
      "contact": "Self Help Group (SHG)",
      "description": "Stitching school uniforms and garments under SHG initiative."
    },
    {
      "id": 5,
      "title": "Security Guard (Female)",
      "department": "Private Agency",
      "type": "Private",
      "location": "Nearby Town",
      "eligibility": "10th pass, physically fit",
      "salary": "₹14,000 per month",
      "lastDate": "2025-04-20",
      "contact": "9876543210",
      "description": "Day shift security work at offices and schools."
    },
    {
      "id": 6,
      "title": "Mid-Day Meal Cook",
      "department": "Education Department",
      "type": "Government",
      "location": "Government School",
      "eligibility": "Basic cooking experience",
      "salary": "₹9,000 per month",
      "lastDate": "2025-03-28",
      "contact": "School Head Master",
      "description": "Preparation of mid-day meals for school children."
    }
  ]
};

const API_URL = process.env.EXPO_PUBLIC_API_URL || 'http://localhost:5000/api';

const levelLabels = {
  'local': 'Local',
  'state': 'State',
  'central': 'Central',
};

const educationLabels = {
  '10th': '10th Pass',
  '12th': '12th Pass',
  'graduate': 'Graduate',
  'postgraduate': 'Post Graduate',
  'diploma': 'Diploma',
  'iti': 'ITI',
  'any': 'Any',
};

const OpportunityCard = ({ opportunity, onPress }) => {
  const formatDate = (dateString) => {
    if (dateString === 'Open') return 'Open';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    });
  };

  const getDaysLeft = (lastDate) => {
    if (lastDate === 'Open') return null;
    const today = new Date();
    const deadline = new Date(lastDate);
    const diffTime = deadline - today;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  const daysLeft = getDaysLeft(opportunity.lastDate);

  // Map your JSON structure to expected structure
  const displayLevel = opportunity.level || 'local';
  const displayType = opportunity.type || 'Government';

  return (
    <TouchableOpacity style={styles.opportunityCard} onPress={onPress} activeOpacity={0.7}>
      <View style={styles.cardHeader}>
        <View style={styles.levelBadge}>
          <Text style={styles.levelText}>{displayType}</Text>
        </View>
        {daysLeft !== null && daysLeft <= 7 && daysLeft > 0 && (
          <View style={styles.urgentBadge}>
            <Text style={styles.urgentText}>⏰ {daysLeft}d left</Text>
          </View>
        )}
      </View>

      <Text style={styles.jobTitle}>{opportunity.title}</Text>
      <Text style={styles.department}>{opportunity.department}</Text>

      <View style={styles.detailsRow}>
        <View style={styles.detailItem}>
          <Text style={styles.detailIcon}>🎓</Text>
          <Text style={styles.detailText}>{opportunity.eligibility || educationLabels[opportunity.education] || 'Not specified'}</Text>
        </View>
      </View>

      <View style={styles.detailsRow}>
        <View style={styles.detailItem}>
          <Text style={styles.detailIcon}>📍</Text>
          <Text style={styles.detailText} numberOfLines={1}>{opportunity.location}</Text>
        </View>
      </View>

      {opportunity.salary && (
        <View style={styles.detailsRow}>
          <View style={styles.detailItem}>
            <Text style={styles.detailIcon}>💰</Text>
            <Text style={styles.detailText}>{opportunity.salary}</Text>
          </View>
        </View>
      )}

      <View style={styles.cardFooter}>
        <Text style={styles.lastDateLabel}>Last Date:</Text>
        <Text style={styles.lastDate}>{formatDate(opportunity.lastDate)}</Text>
      </View>
    </TouchableOpacity>
  );
};

export default function EmploymentScreen() {
  const router = useRouter();
  const [opportunities, setOpportunities] = useState([]);
  const [filteredOpportunities, setFilteredOpportunities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState('all');

  useEffect(() => {
    loadOpportunities();
  }, []);

  useEffect(() => {
    filterOpportunities();
  }, [selectedCategory, opportunities]);

  const loadOpportunities = async () => {
    try {
      console.log('📤 Fetching opportunities from API...');
      const response = await fetch(`${API_URL}/employment`, {
        timeout: 5000
      });
      const data = await response.json();

      console.log('📥 Opportunities response:', data);

      if (data.success && data.opportunities && data.opportunities.length > 0) {
        setOpportunities(data.opportunities);
        console.log('✅ Loaded from API');
      } else {
        throw new Error('No opportunities from API');
      }
    } catch (error) {
      console.log('⚠️ API failed, loading local data');
      console.log('Error:', error.message);
      setOpportunities(localEmploymentData.opportunities);
      console.log('✅ Loaded local data:', localEmploymentData.opportunities.length, 'opportunities');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const filterOpportunities = () => {
    if (selectedCategory === 'all') {
      setFilteredOpportunities(opportunities);
    } else if (selectedCategory === 'government') {
      setFilteredOpportunities(opportunities.filter(item => 
        item.type?.toLowerCase().includes('government')
      ));
    } else if (selectedCategory === 'private') {
      setFilteredOpportunities(opportunities.filter(item => 
        item.type?.toLowerCase().includes('private') || 
        item.type?.toLowerCase().includes('contract')
      ));
    } else {
      setFilteredOpportunities(opportunities.filter(item => 
        item.level === selectedCategory || item.type?.toLowerCase() === selectedCategory
      ));
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    loadOpportunities();
  };

  const viewOpportunityDetails = (opportunity) => {
    const details = `${opportunity.description}

📋 Details:
• Eligibility: ${opportunity.eligibility || educationLabels[opportunity.education] || 'Not specified'}
• Location: ${opportunity.location}
• Type: ${opportunity.type || 'Government'}
${opportunity.salary ? `• Salary: ${opportunity.salary}` : ''}

📝 Required Documents:
${opportunity.documents || 'Check official notification'}

🔗 How to Apply:
${opportunity.howToApply || 'Contact the department for application details'}

📞 Contact: ${opportunity.contact || 'See official website'}

⚠️ Last Date: ${opportunity.lastDate === 'Open' ? 'Open' : new Date(opportunity.lastDate).toLocaleDateString('en-IN', { 
      day: 'numeric', 
      month: 'long', 
      year: 'numeric' 
    })}`;

    Alert.alert(
      opportunity.title,
      details,
      [
        { text: 'Close', style: 'cancel' },
        { text: 'Contact', onPress: () => {
          if (opportunity.applyLink) {
            Alert.alert('Opening Link', 'This would open: ' + opportunity.applyLink);
          } else {
            Alert.alert('Contact', opportunity.contact);
          }
        }}
      ]
    );
  };

  const categories = [
    { key: 'all', label: 'All' },
    { key: 'government', label: 'Government' },
    { key: 'private', label: 'Private' },
  ];

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#1F2937" />
      
      <AppHeader title="Employment Opportunities" />

      {/* Filter Tabs */}
      <View style={styles.filterContainer}>
        <ScrollView 
          horizontal 
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.filterContent}
        >
          {categories.map((category) => (
            <TouchableOpacity
              key={category.key}
              style={[
                styles.filterButton,
                selectedCategory === category.key && styles.filterButtonActive
              ]}
              onPress={() => setSelectedCategory(category.key)}
              activeOpacity={0.7}
            >
              <Text style={[
                styles.filterText,
                selectedCategory === category.key && styles.filterTextActive
              ]}>
                {category.label}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#3B82F6" />
          <Text style={styles.loadingText}>Loading opportunities...</Text>
        </View>
      ) : (
        <ScrollView 
          style={styles.content}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl 
              refreshing={refreshing} 
              onRefresh={onRefresh}
              tintColor="#3B82F6"
              colors={['#3B82F6']}
            />
          }
        >
          {filteredOpportunities.length === 0 ? (
            <View style={styles.emptyContainer}>
              <View style={styles.emptyIconContainer}>
                <Text style={styles.emptyIcon}>💼</Text>
              </View>
              <Text style={styles.emptyText}>No Opportunities</Text>
              <Text style={styles.emptySubtext}>
                {selectedCategory === 'all' 
                  ? 'Check back later for new job opportunities'
                  : `No ${selectedCategory} opportunities available`}
              </Text>
            </View>
          ) : (
            <>
              <View style={styles.countContainer}>
                <Text style={styles.countText}>
                  {filteredOpportunities.length} Opportunit{filteredOpportunities.length !== 1 ? 'ies' : 'y'}
                </Text>
              </View>
              {filteredOpportunities.map((opportunity) => (
                <OpportunityCard
                  key={opportunity._id || opportunity.id}
                  opportunity={opportunity}
                  onPress={() => viewOpportunityDetails(opportunity)}
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
    backgroundColor: '#F9FAFB',
  },
  filterContainer: {
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
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
    backgroundColor: '#F3F4F6',
    marginRight: 8,
  },
  filterButtonActive: {
    backgroundColor: '#3B82F6',
  },
  filterText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#6B7280',
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
  loadingText: {
    marginTop: 12,
    fontSize: 14,
    color: '#6B7280',
  },
  countContainer: {
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 12,
  },
  countText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#6B7280',
    letterSpacing: 0.5,
  },
  opportunityCard: {
    backgroundColor: '#fff',
    marginHorizontal: 20,
    marginBottom: 12,
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderLeftWidth: 4,
    borderLeftColor: '#3B82F6',
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  levelBadge: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
    backgroundColor: '#DBEAFE',
  },
  levelText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#1D4ED8',
    letterSpacing: 0.3,
  },
  urgentBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    backgroundColor: '#FEF3C7',
  },
  urgentText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#D97706',
  },
  jobTitle: {
    fontSize: 17,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 6,
    lineHeight: 24,
  },
  department: {
    fontSize: 14,
    color: '#6B7280',
    marginBottom: 12,
    fontWeight: '500',
  },
  detailsRow: {
    flexDirection: 'row',
    marginBottom: 8,
    gap: 12,
  },
  detailItem: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  detailIcon: {
    fontSize: 14,
    marginRight: 6,
  },
  detailText: {
    fontSize: 13,
    color: '#4B5563',
    fontWeight: '500',
    flex: 1,
  },
  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 12,
    marginTop: 8,
    borderTopWidth: 1,
    borderTopColor: '#F3F4F6',
  },
  lastDateLabel: {
    fontSize: 12,
    color: '#9CA3AF',
    fontWeight: '500',
  },
  lastDate: {
    fontSize: 13,
    color: '#DC2626',
    fontWeight: '600',
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
    backgroundColor: '#EFF6FF',
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
    color: '#111827',
    marginBottom: 8,
  },
  emptySubtext: {
    fontSize: 14,
    color: '#6B7280',
    textAlign: 'center',
    lineHeight: 20,
  },
  bottomSpacing: {
    height: 100,
  },
});