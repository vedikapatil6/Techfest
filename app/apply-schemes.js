import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, StatusBar, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import BottomNav from './components/BottomNav';
import AppHeader from './components/AppHeader';

const SchemeCard = ({ icon, title, description, eligibility, onPress }) => (
  <TouchableOpacity style={styles.schemeCard} onPress={onPress}>
    <View style={styles.cardContent}>
      <View style={styles.iconContainer}>
        <Text style={styles.schemeIcon}>{icon}</Text>
      </View>
      <View style={styles.textContainer}>
        <Text style={styles.schemeTitle}>{title}</Text>
        <Text style={styles.schemeDescription}>{description}</Text>
        <View style={styles.eligibilityContainer}>
          <Text style={styles.eligibilityLabel}>Eligibility:</Text>
          <Text style={styles.eligibilityText}>{eligibility}</Text>
        </View>
      </View>
      <TouchableOpacity style={styles.applyButton} onPress={onPress}>
        <Text style={styles.applyButtonText}>Apply</Text>
      </TouchableOpacity>
    </View>
  </TouchableOpacity>
);

export default function ApplySchemesScreen() {
  const router = useRouter();
  const [userName, setUserName] = useState('User');
  const [userProfile, setUserProfile] = useState(null);

  useEffect(() => {
    loadUserData();
  }, []);

  const loadUserData = async () => {
    try {
      const profileData = await AsyncStorage.getItem('@user_profile');
      if (profileData) {
        const profile = JSON.parse(profileData);
        setUserProfile(profile);
        if (profile.fullName) {
          const firstName = profile.fullName.split(' ')[0].toLowerCase();
          setUserName(firstName);
        }
      }
    } catch (error) {
      console.error('Error loading user data:', error);
    }
  };

  // Eligibility checking function
  const isEligible = (scheme) => {
    if (!userProfile) return false;
    
    switch (scheme.id) {
      case 1: // PMAY - Housing
        return parseInt(userProfile.income || 0) < 50000 || (userProfile.location || '').toLowerCase().includes('rural');
      case 2: // PMJDY - Financial inclusion
        return true;
      case 3: // Ayushman Bharat - Health
        return parseInt(userProfile.income || 0) < 30000 || userProfile.disability === 'Yes';
      case 4: // PM-KISAN - Agriculture
        return (userProfile.occupation || '').toLowerCase().includes('farmer') || 
               (userProfile.occupation || '').toLowerCase().includes('agriculture');
      case 5: // Women schemes
        return userProfile.gender === 'Female';
      case 6: // Education
        return parseInt(userProfile.age || 0) < 25;
      default:
        return true;
    }
  };

  const getEligibilityText = (scheme) => {
    switch (scheme.id) {
      case 1:
        return 'Below poverty line';
      case 2:
        return 'All citizens';
      case 3:
        return 'Economically weaker sections';
      case 4:
        return 'Small and marginal farmers';
      case 5:
        return 'Girl child';
      case 6:
        return 'Students below 25 years';
      default:
        return 'Check eligibility';
    }
  };

  const schemes = [
    {
      id: 1,
      icon: '🏠',
      title: 'Pradhan Mantri Awas Yojana (PMAY)',
      description: 'Housing scheme to provide affordable pucca houses to urban and rural poor with amenities by a target year.',
    },
    {
      id: 2,
      icon: '🤝',
      title: 'Pradhan Mantri Jan Dhan Yojana (PMJDY)',
      description: 'Financial inclusion mission to provide no-frills bank accounts, RuPay cards, and access to financial services to all households.',
    },
    {
      id: 3,
      icon: '🏥',
      title: 'Ayushman Bharat– Pradhan Mantri Jan Arogya Yojana',
      description: 'Public health insurance scheme offering up to ₹5 lakh per family per year for secondary and tertiary care to vulnerable households.',
    },
    {
      id: 4,
      icon: '🌱',
      title: 'Pradhan Mantri Kisan Samman Nidhi (PM-KISAN)',
      description: 'Income support of ₹6,000 per year in three installments to eligible small and marginal farmers.',
    },
    {
      id: 5,
      icon: '👩',
      title: 'Beti Bachao Beti Padhao',
      description: 'Save and educate the girl child scheme providing financial support for girls\' education and welfare.',
    },
    {
      id: 6,
      icon: '🎓',
      title: 'Scholarship for Higher Education',
      description: 'Financial aid for meritorious students pursuing higher education in recognized institutions.',
    },
  ];

  const eligibleSchemes = schemes.filter(scheme => isEligible(scheme));

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#1F2937" />
      
      {/* Header */}
      <AppHeader title="Eligible Schemes" />

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Available Schemes Heading */}
        <Text style={styles.sectionTitle}>Available Schemes</Text>

        {eligibleSchemes.length > 0 ? (
          eligibleSchemes.map((scheme) => (
            <SchemeCard
              key={scheme.id}
              icon={scheme.icon}
              title={scheme.title}
              description={scheme.description}
              eligibility={getEligibilityText(scheme)}
              onPress={() => router.push({
                pathname: '/scheme-details',
                params: { schemeId: scheme.id, schemeName: scheme.title }
              })}
            />
          ))
        ) : (
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyIcon}>📋</Text>
            <Text style={styles.emptyText}>No eligible schemes found</Text>
            <Text style={styles.emptySubtext}>Complete your profile to see more schemes</Text>
          </View>
        )}

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
    paddingTop: 20,
  },
  sectionTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1F2937',
    marginBottom: 20,
  },
  schemeCard: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  cardContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  iconContainer: {
    width: 56,
    height: 56,
    backgroundColor: '#F3F4F6',
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
  schemeIcon: {
    fontSize: 28,
  },
  textContainer: {
    flex: 1,
    marginRight: 12,
  },
  schemeTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1F2937',
    marginBottom: 6,
    lineHeight: 22,
  },
  schemeDescription: {
    fontSize: 14,
    color: '#6B7280',
    marginBottom: 8,
    lineHeight: 20,
  },
  eligibilityContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  eligibilityLabel: {
    fontSize: 14,
    color: '#6B7280',
    marginRight: 4,
  },
  eligibilityText: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#1F2937',
  },
  applyButton: {
    backgroundColor: '#A78BFA',
    borderRadius: 20,
    paddingHorizontal: 20,
    paddingVertical: 10,
    minWidth: 80,
    alignItems: 'center',
  },
  applyButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: 'bold',
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
  },
  emptyIcon: {
    fontSize: 64,
    marginBottom: 16,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1F2937',
    marginBottom: 8,
  },
  emptySubtext: {
    fontSize: 14,
    color: '#6B7280',
    textAlign: 'center',
  },
  bottomSpacing: {
    height: 100,
  },
});
