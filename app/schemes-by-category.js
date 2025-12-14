import { useLocalSearchParams, useRouter } from 'expo-router';
import React from 'react';
import { ScrollView, StatusBar, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import AppHeader from './components/AppHeader';
import BottomNav from './components/BottomNav';

// Sample schemes data organized by category
const schemesByCategory = {
  1: [ // Agriculture
    { id: 1, name: 'Pradhan Mantri Kisan Samman Nidhi', description: 'Direct income support to farmers', eligibility: 'All farmers' },
    { id: 2, name: 'Kisan Credit Card', description: 'Credit facility for farmers', eligibility: 'Farmers with land' },
    { id: 3, name: 'Pradhan Mantri Fasal Bima Yojana', description: 'Crop insurance scheme', eligibility: 'All farmers' },
  ],
  2: [ // Health
    { id: 4, name: 'Ayushman Bharat', description: 'Health insurance for poor families', eligibility: 'Below poverty line' },
    { id: 5, name: 'Pradhan Mantri Jan Arogya Yojana', description: 'Free health insurance', eligibility: 'Economically weaker sections' },
    { id: 6, name: 'National Health Mission', description: 'Healthcare services in rural areas', eligibility: 'All citizens' },
  ],
  3: [ // Business
    { id: 7, name: 'Pradhan Mantri Mudra Yojana', description: 'Micro finance for small businesses', eligibility: 'Small business owners' },
    { id: 8, name: 'Stand Up India', description: 'Bank loans for SC/ST and women entrepreneurs', eligibility: 'SC/ST/Women entrepreneurs' },
    { id: 9, name: 'Startup India', description: 'Support for startups', eligibility: 'Registered startups' },
  ],
  4: [ // Education
    { id: 10, name: 'Sarva Shiksha Abhiyan', description: 'Universal elementary education', eligibility: 'Children 6-14 years' },
    { id: 11, name: 'Mid-Day Meal Scheme', description: 'Free meals in schools', eligibility: 'School children' },
    { id: 12, name: 'Scholarship for Higher Education', description: 'Financial aid for higher studies', eligibility: 'Meritorious students' },
  ],
  5: [ // Women
    { id: 13, name: 'Beti Bachao Beti Padhao', description: 'Save and educate the girl child', eligibility: 'Girls and their families' },
    { id: 14, name: 'Pradhan Mantri Matru Vandana Yojana', description: 'Maternity benefit scheme', eligibility: 'Pregnant and lactating mothers' },
    { id: 15, name: 'Ujjwala Yojana', description: 'Free LPG connections', eligibility: 'Women from BPL families' },
  ],
  6: [ // Housing
    { id: 16, name: 'Pradhan Mantri Awas Yojana', description: 'Affordable housing for all', eligibility: 'Economically weaker sections' },
    { id: 17, name: 'Housing for All', description: 'Housing scheme for urban poor', eligibility: 'Urban poor families' },
    { id: 18, name: 'Rural Housing Scheme', description: 'Housing in rural areas', eligibility: 'Rural families' },
  ],
  7: [ // Sports
    { id: 19, name: 'Khelo India', description: 'National program for development of sports', eligibility: 'Athletes and sports persons' },
    { id: 20, name: 'Sports Scholarship', description: 'Financial support for athletes', eligibility: 'Meritorious athletes' },
    { id: 21, name: 'Infrastructure Development', description: 'Sports infrastructure development', eligibility: 'Sports organizations' },
  ],
  8: [ // Science
    { id: 22, name: 'Research Fellowship', description: 'Support for research scholars', eligibility: 'Research students' },
    { id: 23, name: 'Innovation Grant', description: 'Funding for scientific innovation', eligibility: 'Scientists and researchers' },
    { id: 24, name: 'Science Education Program', description: 'Promoting science education', eligibility: 'Students and teachers' },
  ],
  9: [ // Public Safety
    { id: 25, name: 'Emergency Response System', description: 'Quick emergency response', eligibility: 'All citizens' },
    { id: 26, name: 'Safety Awareness Program', description: 'Public safety education', eligibility: 'All citizens' },
    { id: 27, name: 'Disaster Management', description: 'Disaster preparedness and relief', eligibility: 'Affected communities' },
  ],
};

const categoryNames = {
  1: 'Agriculture',
  2: 'Health',
  3: 'Business',
  4: 'Education',
  5: 'Women',
  6: 'Housing',
  7: 'Sports',
  8: 'Science',
  9: 'Public Safety',
};

export default function SchemesByCategoryScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const categoryId = parseInt(params.categoryId);
  const categoryName = params.categoryName || categoryNames[categoryId] || 'Category';

  const schemes = schemesByCategory[categoryId] || [];

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#fff" />
      
      {/* Header */}
      <AppHeader title={`${categoryName} Schemes`} />

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {schemes.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>No schemes available for this category</Text>
          </View>
        ) : (
          <>
            <Text style={styles.sectionTitle}>Available Schemes</Text>
            {schemes.map((scheme) => (
              <TouchableOpacity
                key={scheme.id}
                style={styles.schemeCard}
                onPress={() => {
                  router.push({
                    pathname: '/scheme-details',
                    params: { schemeId: scheme.id, schemeName: scheme.name }
                  });
                }}
              >
                <View style={styles.schemeHeader}>
                  <View style={styles.schemeIconContainer}>
                    <Text style={styles.schemeIcon}>📋</Text>
                  </View>
                  <View style={styles.schemeInfo}>
                    <Text style={styles.schemeName}>{scheme.name}</Text>
                    <Text style={styles.schemeDescription}>{scheme.description}</Text>
                  </View>
                </View>
                <View style={styles.schemeFooter}>
                  <View style={styles.eligibilityContainer}>
                    <Text style={styles.eligibilityLabel}>Eligibility:</Text>
                    <Text style={styles.eligibilityText}>{scheme.eligibility}</Text>
                  </View>
                  <TouchableOpacity 
                    style={styles.applyButton}
                    onPress={() => {
                      router.push({
                        pathname: '/scheme-details',
                        params: { schemeId: scheme.id, schemeName: scheme.name }
                      });
                    }}
                  >
                    <Text style={styles.applyButtonText}>Apply</Text>
                  </TouchableOpacity>
                </View>
              </TouchableOpacity>
            ))}
          </>
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
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1F2937',
    marginTop: 24,
    marginBottom: 16,
  },
  schemeCard: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  schemeHeader: {
    flexDirection: 'row',
    marginBottom: 16,
  },
  schemeIconContainer: {
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
  schemeInfo: {
    flex: 1,
  },
  schemeName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1F2937',
    marginBottom: 8,
  },
  schemeDescription: {
    fontSize: 14,
    color: '#6B7280',
    lineHeight: 20,
  },
  schemeFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
  },
  eligibilityContainer: {
    flex: 1,
  },
  eligibilityLabel: {
    fontSize: 12,
    color: '#9CA3AF',
    marginBottom: 4,
  },
  eligibilityText: {
    fontSize: 14,
    color: '#1F2937',
    fontWeight: '500',
  },
  applyButton: {
    backgroundColor: '#A78BFA',
    borderRadius: 8,
    paddingHorizontal: 20,
    paddingVertical: 10,
    marginLeft: 16,
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
  emptyText: {
    fontSize: 16,
    color: '#6B7280',
  },
  bottomSpacing: {
    height: 100,
  },
});

