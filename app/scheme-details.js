import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, StatusBar, ScrollView } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import BottomNav from './components/BottomNav';
import AppHeader from './components/AppHeader';

const schemeDetails = {
  1: {
    name: 'Pradhan Mantri Awas Yojana (PMAY)',
    icon: '🏠',
    description: 'Housing scheme to provide affordable pucca houses to urban and rural poor with amenities by a target year.',
    requirements: [
      'Age: 18 years and above',
      'Income: Less than ₹50,000 per month',
      'No existing pucca house in name of any family member',
      'Valid Aadhar Card',
      'Bank account details',
    ],
    documents: [
      'Aadhar Card',
      'PAN Card',
      'Income Certificate',
      'Bank Account Details',
      'Passport Size Photo',
      'Address Proof',
    ],
    benefits: [
      'Financial assistance up to ₹2.5 lakh',
      'Interest subsidy on home loans',
      'Affordable housing in urban and rural areas',
    ],
  },
  2: {
    name: 'Pradhan Mantri Jan Dhan Yojana (PMJDY)',
    icon: '🤝',
    description: 'Financial inclusion mission to provide no-frills bank accounts, RuPay cards, and access to financial services to all households.',
    requirements: [
      'Age: 10 years and above',
      'Valid Aadhar Card or any government ID',
      'No existing bank account (preferred)',
    ],
    documents: [
      'Aadhar Card',
      'Any Government ID',
      'Passport Size Photo',
    ],
    benefits: [
      'Zero balance account',
      'RuPay debit card',
      'Accident insurance cover of ₹2 lakh',
      'Overdraft facility up to ₹10,000',
    ],
  },
  3: {
    name: 'Ayushman Bharat– Pradhan Mantri Jan Arogya Yojana',
    icon: '🏥',
    description: 'Public health insurance scheme offering up to ₹5 lakh per family per year for secondary and tertiary care to vulnerable households.',
    requirements: [
      'Family income less than ₹30,000 per month',
      'Or having disability',
      'Valid Aadhar Card',
      'Ration card or income certificate',
    ],
    documents: [
      'Aadhar Card',
      'Ration Card',
      'Income Certificate',
      'Family Photo',
      'Bank Account Details',
    ],
    benefits: [
      'Health coverage up to ₹5 lakh per family per year',
      'Coverage for secondary and tertiary hospitalization',
      'Cashless treatment at empaneled hospitals',
    ],
  },
  4: {
    name: 'Pradhan Mantri Kisan Samman Nidhi (PM-KISAN)',
    icon: '🌱',
    description: 'Income support of ₹6,000 per year in three installments to eligible small and marginal farmers.',
    requirements: [
      'Must be a farmer',
      'Land ownership documents',
      'Valid Aadhar Card',
      'Bank account details',
    ],
    documents: [
      'Aadhar Card',
      'Land Ownership Documents',
      'Bank Account Details',
      'Passport Size Photo',
    ],
    benefits: [
      '₹6,000 per year in 3 installments',
      'Direct benefit transfer to bank account',
      'No middlemen involved',
    ],
  },
};

export default function SchemeDetailsScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const schemeId = parseInt(params.schemeId);
  const scheme = schemeDetails[schemeId];

  if (!scheme) {
    return (
      <View style={styles.container}>
        <Text>Scheme not found</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#1F2937" />
      
      {/* Header */}
      <AppHeader title="Scheme Details" />

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Scheme Header Card */}
        <View style={styles.schemeHeaderCard}>
          <View style={styles.schemeIconContainer}>
            <Text style={styles.schemeIcon}>{scheme.icon}</Text>
          </View>
          <Text style={styles.schemeName}>{scheme.name}</Text>
          <Text style={styles.schemeDescription}>{scheme.description}</Text>
        </View>

        {/* Benefits Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>✨ Benefits</Text>
          {scheme.benefits.map((benefit, index) => (
            <View key={index} style={styles.benefitItem}>
              <Text style={styles.bullet}>•</Text>
              <Text style={styles.benefitText}>{benefit}</Text>
            </View>
          ))}
        </View>

        {/* Requirements Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>📋 Eligibility Requirements</Text>
          {scheme.requirements.map((req, index) => (
            <View key={index} style={styles.requirementItem}>
              <Text style={styles.bullet}>✓</Text>
              <Text style={styles.requirementText}>{req}</Text>
            </View>
          ))}
        </View>

        {/* Documents Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>📄 Required Documents</Text>
          {scheme.documents.map((doc, index) => (
            <View key={index} style={styles.documentItem}>
              <Text style={styles.bullet}>📎</Text>
              <Text style={styles.documentText}>{doc}</Text>
            </View>
          ))}
        </View>

        {/* Apply Button */}
        <TouchableOpacity
          style={styles.applyButton}
          onPress={() => router.push({
            pathname: '/application-form',
            params: { schemeId: schemeId, schemeName: scheme.name }
          })}
        >
          <Text style={styles.applyButtonText}>Apply Now</Text>
        </TouchableOpacity>

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
  header: {
    backgroundColor: '#1F2937',
    paddingHorizontal: 20,
    paddingTop: 48,
    paddingBottom: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderBottomWidth: 1,
    borderBottomColor: '#374151',
  },
  backButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
  },
  backIcon: {
    color: '#fff',
    fontSize: 24,
  },
  headerTitle: {
    color: '#fff',
    fontSize: 20,
    fontWeight: 'bold',
    flex: 1,
    marginLeft: 8,
  },
  headerIcons: {
    flexDirection: 'row',
    gap: 12,
  },
  headerIcon: {
    width: 40,
    height: 40,
    backgroundColor: '#374151',
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerIconText: {
    fontSize: 18,
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
  },
  schemeHeaderCard: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 24,
    marginTop: 24,
    marginBottom: 16,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  schemeIconContainer: {
    width: 80,
    height: 80,
    backgroundColor: '#E0E7FF',
    borderRadius: 40,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  schemeIcon: {
    fontSize: 40,
  },
  schemeName: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1F2937',
    marginBottom: 12,
    textAlign: 'center',
  },
  schemeDescription: {
    fontSize: 14,
    color: '#6B7280',
    textAlign: 'center',
    lineHeight: 20,
  },
  section: {
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
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1F2937',
    marginBottom: 16,
  },
  benefitItem: {
    flexDirection: 'row',
    marginBottom: 12,
    alignItems: 'flex-start',
  },
  requirementItem: {
    flexDirection: 'row',
    marginBottom: 12,
    alignItems: 'flex-start',
  },
  documentItem: {
    flexDirection: 'row',
    marginBottom: 12,
    alignItems: 'flex-start',
  },
  bullet: {
    fontSize: 18,
    color: '#A78BFA',
    marginRight: 12,
    marginTop: 2,
  },
  benefitText: {
    flex: 1,
    fontSize: 15,
    color: '#1F2937',
    lineHeight: 22,
  },
  requirementText: {
    flex: 1,
    fontSize: 15,
    color: '#1F2937',
    lineHeight: 22,
  },
  documentText: {
    flex: 1,
    fontSize: 15,
    color: '#1F2937',
    lineHeight: 22,
  },
  applyButton: {
    backgroundColor: '#A78BFA',
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
    marginTop: 8,
    marginBottom: 24,
    shadowColor: '#A78BFA',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
  },
  applyButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  bottomSpacing: {
    height: 100,
  },
});

