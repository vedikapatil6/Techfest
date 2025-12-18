import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TextInput,
  SafeAreaView,
  StatusBar,
  TouchableOpacity,
  Platform,
} from 'react-native';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import SchemeDetailsScreen from './SchemeDetailsScreen';


const SCHEMES = [
  {
    id: '1',
    title: 'Ayushman Bharat',
    subtitle: 'Health insurance for poor families',
    eligibility: 'Below poverty line',
    iconType: 'health',
    description: 'Ayushman Bharat provides health insurance coverage of up to ₹5 lakh per family per year for secondary and tertiary care hospitalization.',
    benefits: [
      'Free treatment at empanelled hospitals',
      'Coverage up to ₹5 lakh per family per year',
      'Covers pre and post hospitalization expenses',
      'No cap on family size and age'
    ],
    documents: [
      'Aadhaar Card',
      'Ration Card',
      'Income Certificate',
      'Caste Certificate (if applicable)'
    ]
  },
  {
    id: '2',
    title: 'Pradhan Mantri Jan Dhan Yojana',
    subtitle: 'Free health insurance',
    eligibility: 'Economically weaker sections',
    iconType: 'finance',
    description: 'A National Mission for Financial Inclusion to ensure access to financial services, namely, banking/savings & deposit accounts, remittance, credit, insurance, pension.',
    benefits: [
      'Zero balance account',
      'Accidental insurance cover of ₹1 lakh',
      'Life insurance cover of ₹30,000',
      'Overdraft facility up to ₹10,000'
    ],
    documents: [
      'Aadhaar Card',
      'PAN Card',
      'Voter ID',
      'Passport size photograph'
    ]
  },
  {
    id: '3',
    title: 'Pradhan Mantri Awas Yojana',
    subtitle: 'Housing scheme',
    eligibility: 'Economically weaker sections',
    iconType: 'housing',
    description: 'PMAY aims to provide affordable housing to the urban poor with a target of building 20 million affordable houses by 2022.',
    benefits: [
      'Interest subsidy on home loans',
      'Credit linked subsidy up to ₹2.67 lakh',
      'Affordable housing for EWS/LIG/MIG',
      'Pucca house with basic amenities'
    ],
    documents: [
      'Aadhaar Card',
      'Income Certificate',
      'Property Documents',
      'Bank Account Details',
      'Passport size photograph'
    ]
  },
];


const EligibleSchemesScreen = ({ onBack }) => {
  const [currentScreen, setCurrentScreen] = useState('list');
  const [selectedScheme, setSelectedScheme] = useState(null);


  const handleNavigateToSchemeDetails = (scheme) => {
    setSelectedScheme(scheme);
    setCurrentScreen('details');
  };


  const handleBackToList = () => {
    setCurrentScreen('list');
  };


  const handleApplyNow = () => {
    alert('Application process started!');
  };


  if (currentScreen === 'details' && selectedScheme) {
    return (
      <SchemeDetailsScreen
        scheme={selectedScheme}
        onBack={handleBackToList}
        onApplyNow={handleApplyNow}
      />
    );
  }


  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#f3f4f6' }}>
      <StatusBar barStyle="light-content" backgroundColor="#1E3A8A" />
      
      <Header onBack={onBack} />


      <ScrollView
        contentContainerStyle={{ padding: 16, paddingBottom: 20 }}
        showsVerticalScrollIndicator={false}
      >
        {SCHEMES.map((scheme) => (
          <SchemeCard 
            key={scheme.id} 
            data={scheme}
            onApply={() => handleNavigateToSchemeDetails(scheme)}
          />
        ))}
        <View style={{ height: 100 }} />
      </ScrollView>


      <AIFloatingButton />
    </SafeAreaView>
  );
};


const Header = ({ onBack }) => {
  return (
    <View style={{
      backgroundColor: '#1E3A8A',
      padding: 20,
      paddingTop: Platform.OS === 'android' ? 40 : 20,
      paddingBottom: 20,
      borderBottomLeftRadius: 20,
      borderBottomRightRadius: 20,
    }}>
      <View style={{
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 16,
      }}>
        <TouchableOpacity onPress={onBack} style={{
          width: 40,
          height: 40,
          justifyContent: 'center',
          alignItems: 'center',
        }}>
          <Ionicons name="arrow-back" size={24} color="#FFF" />
        </TouchableOpacity>

        <Text style={{
          color: '#FFF',
          fontSize: 18,
          fontWeight: 'bold',
          flex: 1,
          textAlign: 'center',
        }}>
          Eligible Schemes
        </Text>

        <View style={{
          flexDirection: 'row',
          width: 40,
          justifyContent: 'flex-end',
        }}>
          <TouchableOpacity style={{
            width: 40,
            height: 40,
            justifyContent: 'center',
            alignItems: 'center',
            position: 'relative',
          }}>
            <Ionicons name="notifications-outline" size={20} color="#FFF" />
            <View style={{
              position: 'absolute',
              top: 8,
              right: 8,
              backgroundColor: '#EF4444',
              width: 14,
              height: 14,
              borderRadius: 7,
              justifyContent: 'center',
              alignItems: 'center',
            }}>
              <Text style={{ color: '#fff', fontSize: 8, fontWeight: 'bold' }}>1</Text>
            </View>
          </TouchableOpacity>
        </View>
      </View>

      <View style={{
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
      }}>
        <TextInput
          placeholder="Search schemes..."
          placeholderTextColor="#94a3b8"
          style={{
            flex: 1,
            fontSize: 16,
            color: '#1a2b5d',
            fontWeight: '500',
          }}
        />
        <Ionicons name="search" size={20} color="#94a3b8" />
      </View>
    </View>
  );
};


const SchemeCard = ({ data, onApply }) => {
  const getIcon = () => {
    switch (data.iconType) {
      case 'health':
        return (
          <View style={{
            width: 56,
            height: 56,
            borderRadius: 28,
            backgroundColor: '#e5e7eb',
            alignItems: 'center',
            justifyContent: 'center',
          }}>
            <Ionicons name="add" size={32} color="#ef4444" />
          </View>
        );
      case 'finance':
        return (
          <View style={{
            width: 56,
            height: 56,
            borderRadius: 28,
            alignItems: 'center',
            justifyContent: 'center',
          }}>
            <MaterialCommunityIcons name="gold" size={40} color="#fbbf24" />
          </View>
        );
      case 'housing':
        return (
          <View style={{
            width: 56,
            height: 56,
            borderRadius: 28,
            alignItems: 'center',
            justifyContent: 'center',
          }}>
            <Ionicons name="home" size={40} color="#f97316" />
          </View>
        );
      default:
        return null;
    }
  };


  return (
    <View style={{
      backgroundColor: 'white',
      borderRadius: 12,
      padding: 16,
      marginBottom: 16,
      borderWidth: 1,
      borderColor: '#e5e7eb',
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.05,
      shadowRadius: 4,
      elevation: 2,
    }}>
      <View style={{ flexDirection: 'row', marginBottom: 12 }}>
        <View style={{ marginRight: 16, justifyContent: 'center' }}>
          {getIcon()}
        </View>
        <View style={{ flex: 1, justifyContent: 'center' }}>
          <Text style={{ fontSize: 16, fontWeight: '700', color: '#000', marginBottom: 4 }}>
            {data.title}
          </Text>
          <Text style={{ fontSize: 14, color: '#6b7280', lineHeight: 20 }}>
            {data.subtitle}
          </Text>
        </View>
      </View>


      <View style={{ height: 1, backgroundColor: '#e5e7eb', marginVertical: 12 }} />


      <View style={{
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
      }}>
        <View style={{ flex: 1 }}>
          <Text style={{ fontSize: 10, color: '#9ca3af', marginBottom: 2 }}>
            Eligibility:
          </Text>
          <Text style={{ fontSize: 12, color: '#4b5563', fontWeight: '500' }}>
            {data.eligibility}
          </Text>
        </View>
        <TouchableOpacity 
          style={{
            backgroundColor: '#1E3A8A',
            paddingVertical: 8,
            paddingHorizontal: 20,
            borderRadius: 6,
          }}
          onPress={onApply}
        >
          <Text style={{ color: 'white', fontWeight: '600', fontSize: 14 }}>
            Apply
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};


const AIFloatingButton = () => {
  return (
    <View style={{
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
      elevation: 8,
    }}>
      <View style={{ alignItems: 'center', justifyContent: 'center' }}>
        <Text style={{ fontSize: 10, fontWeight: '900', color: '#1E3A8A', marginBottom: -2 }}>
          AI
        </Text>
        <MaterialCommunityIcons name="message-text-outline" size={22} color="#1E3A8A" />
      </View>
    </View>
  );
};


export default EligibleSchemesScreen;
