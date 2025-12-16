import React, { useState } from 'react';
import { Alert, Linking, ScrollView, StatusBar, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import AppHeader from './components/AppHeader';
import BottomNav from './components/BottomNav';

const helplines = [
  {
    id: 1,
    category: 'Emergency Services',
    icon: '🚨',
    color: '#93a8f2ff',
    numbers: [
      { name: 'Police Emergency', number: '100', description: '24x7 Police helpline' },
      { name: 'Fire Brigade', number: '101', description: 'Fire emergency services' },
      { name: 'Ambulance', number: '102', description: 'Medical emergency services' },
      { name: 'Disaster Management', number: '108', description: 'National emergency number' },
    ]
  },
  {
    id: 2,
    category: 'Women & Child Helpline',
    icon: '👩‍👧',
    color: '#93a8f2ff',
    numbers: [
      { name: 'Women Helpline', number: '1091', description: 'Women in distress' },
      { name: 'Child Helpline', number: '1098', description: 'Child protection services' },
      { name: 'National Commission for Women', number: '7827170170', description: 'Women rights & support' },
    ]
  },
  {
    id: 3,
    category: 'Health Services',
    icon: '🏥',
    color: '#93a8f2ff',
    numbers: [
      { name: 'COVID-19 Helpline', number: '1075', description: 'COVID-19 information' },
      { name: 'Mental Health', number: '08046110007', description: 'NIMHANS mental health helpline' },
      { name: 'National Health Helpline', number: '1800-180-1104', description: 'General health queries' },
      { name: 'Ayushman Bharat', number: '14555', description: 'Health scheme information' },
    ]
  },
  {
    id: 4,
    category: 'Senior Citizens',
    icon: '👴',
    color: '#93a8f2ff',
    numbers: [
      { name: 'Elder Helpline', number: '14567', description: 'Senior citizen support' },
      { name: 'Senior Citizen Security', number: '1291', description: 'Safety & security for elderly' },
    ]
  },
  {
    id: 5,
    category: 'Government Services',
    icon: '🏛️',
    color: '#93a8f2ff',
    numbers: [
      { name: 'Kisan Call Center', number: '1800-180-1551', description: 'Farmer support services' },
      { name: 'Railway Enquiry', number: '139', description: 'Railway information' },
      { name: 'Income Tax Helpline', number: '1800-180-1961', description: 'Income tax queries' },
      { name: 'LPG Booking', number: '1906', description: 'Gas cylinder booking' },
      { name: 'Passport Seva', number: '1800-258-1800', description: 'Passport related queries' },
    ]
  },
  {
    id: 6,
    category: 'Consumer & Cyber',
    icon: '🛡️',
    color: '#93a8f2ff',
    numbers: [
      { name: 'Consumer Helpline', number: '1915', description: 'Consumer complaints' },
      { name: 'Cyber Crime', number: '1930', description: 'Report cyber crimes' },
      { name: 'Anti-Corruption', number: '1031', description: 'Report corruption' },
    ]
  },
  {
    id: 7,
    category: 'Other Important Services',
    icon: '📞',
    color: '#93a8f2ff',
    numbers: [
      { name: 'Road Accident Emergency', number: '1073', description: 'Road accident assistance' },
      { name: 'Railway Security', number: '182', description: 'Railway protection force' },
      { name: 'Electricity Complaint', number: '1912', description: 'Power supply issues' },
      { name: 'Student Helpline', number: '1800-180-5522', description: 'Educational support' },
    ]
  },
];

const HelplineCard = ({ category, icon, color, numbers }) => {
  const [expanded, setExpanded] = useState(false);

  const makeCall = (number) => {
    // Remove spaces and special characters from number
    const cleanNumber = number.replace(/[^0-9]/g, '');
    
    Alert.alert(
      'Call Helpline',
      `Do you want to call ${number}?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Call',
          onPress: () => {
            Linking.openURL(`tel:${cleanNumber}`).catch(err => {
              Alert.alert('Error', 'Unable to make a call');
              console.error('Call error:', err);
            });
          }
        }
      ]
    );
  };

  return (
    <View style={styles.categoryCard}>
      <TouchableOpacity 
        style={styles.categoryHeader}
        onPress={() => setExpanded(!expanded)}
      >
        <View style={styles.categoryTitleContainer}>
          <View style={[styles.iconContainer, { backgroundColor: color + '20' }]}>
            <Text style={styles.categoryIcon}>{icon}</Text>
          </View>
          <Text style={styles.categoryTitle}>{category}</Text>
        </View>
        <Text style={styles.expandIcon}>{expanded ? '▼' : '▶'}</Text>
      </TouchableOpacity>

      {expanded && (
        <View style={styles.numbersContainer}>
          {numbers.map((helpline, index) => (
            <TouchableOpacity
              key={index}
              style={styles.helplineItem}
              onPress={() => makeCall(helpline.number)}
            >
              <View style={styles.helplineInfo}>
                <Text style={styles.helplineName}>{helpline.name}</Text>
                <Text style={styles.helplineNumber}>📞 {helpline.number}</Text>
                <Text style={styles.helplineDescription}>{helpline.description}</Text>
              </View>
              <View style={[styles.callButton, { backgroundColor: color }]}>
                <Text style={styles.callButtonText}>Call</Text>
              </View>
            </TouchableOpacity>
          ))}
        </View>
      )}
    </View>
  );
};

export default function HelplineScreen() {
  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#1F2937" />
      
      <AppHeader title="Emergency Helplines" />

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Info Banner */}
        <View style={styles.infoBanner}>
          <Text style={styles.infoBannerIcon}>ℹ️</Text>
          <Text style={styles.infoBannerText}>
            Tap on any category to expand and view helpline numbers. Click 'Call' to dial directly.
          </Text>
        </View>

        {/* Emergency Quick Access */}
        <View style={styles.emergencySection}>
          <Text style={styles.sectionTitle}>🚨 Quick Emergency Access</Text>
          <View style={styles.quickAccessGrid}>
            <TouchableOpacity
              style={[styles.quickAccessButton, { backgroundColor: '#93a8f2ff' }]}
              onPress={() => Linking.openURL('tel:100')}
            >
              <Text style={styles.quickAccessIcon}>👮</Text>
              <Text style={styles.quickAccessNumber}>100</Text>
              <Text style={styles.quickAccessLabel}>Police</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.quickAccessButton, { backgroundColor: '#93a8f2ff' }]}
              onPress={() => Linking.openURL('tel:101')}
            >
              <Text style={styles.quickAccessIcon}>🚒</Text>
              <Text style={styles.quickAccessNumber}>101</Text>
              <Text style={styles.quickAccessLabel}>Fire</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.quickAccessButton, { backgroundColor: '#93a8f2ff' }]}
              onPress={() => Linking.openURL('tel:102')}
            >
              <Text style={styles.quickAccessIcon}>🚑</Text>
              <Text style={styles.quickAccessNumber}>102</Text>
              <Text style={styles.quickAccessLabel}>Ambulance</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.quickAccessButton, { backgroundColor: '#93a8f2ff'}]}
              onPress={() => Linking.openURL('tel:1091')}
            >
              <Text style={styles.quickAccessIcon}>👩</Text>
              <Text style={styles.quickAccessNumber}>1091</Text>
              <Text style={styles.quickAccessLabel}>Women</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* All Helplines */}
        <Text style={styles.sectionTitle}>📋 All Helplines</Text>
        {helplines.map((category) => (
          <HelplineCard
            key={category.id}
            category={category.category}
            icon={category.icon}
            color={category.color}
            numbers={category.numbers}
          />
        ))}

        <View style={styles.bottomSpacing} />
      </ScrollView>

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
  infoBanner: {
    backgroundColor: '#DBEAFE',
    borderRadius: 12,
    padding: 16,
    marginTop: 20,
    marginBottom: 16,
    flexDirection: 'row',
    alignItems: 'center',
    borderLeftWidth: 4,
    borderLeftColor: '#3B82F6',
  },
  infoBannerIcon: {
    fontSize: 24,
    marginRight: 12,
  },
  infoBannerText: {
    flex: 1,
    fontSize: 14,
    color: '#1F2937',
    lineHeight: 20,
  },
  emergencySection: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1F2937',
    marginBottom: 16,
  },
  quickAccessGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  quickAccessButton: {
    flex: 1,
    minWidth: '45%',
    borderRadius: 16,
    padding: 20,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  quickAccessIcon: {
    fontSize: 32,
    marginBottom: 8,
  },
  quickAccessNumber: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 4,
  },
  quickAccessLabel: {
    fontSize: 14,
    color: '#fff',
    fontWeight: '600',
  },
  categoryCard: {
    backgroundColor: '#fff',
    borderRadius: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    overflow: 'hidden',
  },
  categoryHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
  },
  categoryTitleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  categoryIcon: {
    fontSize: 24,
  },
  categoryTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1F2937',
    flex: 1,
  },
  expandIcon: {
    fontSize: 16,
    color: '#6B7280',
  },
  numbersContainer: {
    paddingHorizontal: 20,
    paddingBottom: 20,
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
  },
  helplineItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  helplineInfo: {
    flex: 1,
    marginRight: 12,
  },
  helplineName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 4,
  },
  helplineNumber: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#3B82F6',
    marginBottom: 4,
  },
  helplineDescription: {
    fontSize: 13,
    color: '#6B7280',
  },
  callButton: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 20,
  },
  callButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: 'bold',
  },
  bottomSpacing: {
    height: 100,
  },
});