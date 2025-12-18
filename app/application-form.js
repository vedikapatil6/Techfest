import AsyncStorage from '@react-native-async-storage/async-storage';
import { useLocalSearchParams, useRouter } from 'expo-router';
import * as Speech from 'expo-speech';
import React, { useEffect, useState } from 'react';
import { Alert, ScrollView, StatusBar, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import BottomNav from './components/BottomNav';
import { checkRequiredDocuments } from './utils/documentChecker';

const STORAGE_KEYS = {
  USER_PROFILE: '@user_profile',
  USER_DOCUMENTS: '@documents_list',
  LANGUAGE: '@user_language',
};

const formFields = [
  { id: 1, field: 'fullName', label: 'Full Name', questionEn: 'Please enter your full name as per your Aadhar card.', questionHi: 'कृपया अपना पूरा नाम आधार कार्ड के अनुसार दर्ज करें।' },
  { id: 2, field: 'fatherName', label: "Father's Name", questionEn: 'Please enter your father\'s name.', questionHi: 'कृपया अपने पिता का नाम दर्ज करें।' },
  { id: 3, field: 'motherName', label: "Mother's Name", questionEn: 'Please enter your mother\'s name.', questionHi: 'कृपया अपनी माता का नाम दर्ज करें।' },
  { id: 4, field: 'address', label: 'Address', questionEn: 'Please enter your complete address.', questionHi: 'कृपया अपना पूरा पता दर्ज करें।' },
  { id: 5, field: 'pincode', label: 'Pincode', questionEn: 'Please enter your area pincode.', questionHi: 'कृपया अपना क्षेत्र पिनकोड दर्ज करें।' },
  { id: 6, field: 'bankAccount', label: 'Bank Account Number', questionEn: 'Please enter your bank account number.', questionHi: 'कृपया अपना बैंक खाता संख्या दर्ज करें।' },
  { id: 7, field: 'ifscCode', label: 'IFSC Code', questionEn: 'Please enter your bank IFSC code.', questionHi: 'कृपया अपना बैंक IFSC कोड दर्ज करें।' },
];

export default function ApplicationFormScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const schemeId = params.schemeId;
  const schemeName = params.schemeName;

  const [currentStep, setCurrentStep] = useState(0);
  const [formData, setFormData] = useState({});
  const [userProfile, setUserProfile] = useState(null);
  const [userDocuments, setUserDocuments] = useState([]);
  const [language, setLanguage] = useState('en');
  const [voiceEnabled, setVoiceEnabled] = useState(true);
  const [isSpeaking, setIsSpeaking] = useState(false);

  useEffect(() => {
    loadUserData();
  }, []);

  useEffect(() => {
    if (voiceEnabled && currentStep < formFields.length && formFields[currentStep]) {
      const question = language === 'hi' ? formFields[currentStep].questionHi : formFields[currentStep].questionEn;
      speakQuestion(question);
    }
  }, [currentStep, language, voiceEnabled]);

  const loadUserData = async () => {
    try {
      const profileData = await AsyncStorage.getItem(STORAGE_KEYS.USER_PROFILE);
      const documentsData = await AsyncStorage.getItem(STORAGE_KEYS.USER_DOCUMENTS);
      const lang = await AsyncStorage.getItem(STORAGE_KEYS.LANGUAGE) || 'en';

      if (profileData) {
        const profile = JSON.parse(profileData);
        setUserProfile(profile);
        // Pre-fill form data from profile
        setFormData({
          fullName: profile.fullName || '',
          address: profile.location || '',
          age: profile.age || '',
          // Add more pre-filled fields
        });
      }

      if (documentsData) {
        const docs = JSON.parse(documentsData);
        setUserDocuments(docs);
        
        // Check if required documents exist for this scheme
        if (schemeId) {
          checkRequiredDocumentsForScheme(docs, parseInt(schemeId));
        }
      }

      setLanguage(lang);
    } catch (error) {
      console.error('Error loading user data:', error);
    }
  };

  const checkRequiredDocumentsForScheme = (docs, schemeId) => {
    // Get required documents based on scheme
    const schemeDocuments = {
      1: ['Aadhar Card', 'PAN Card', 'Income Certificate', 'Bank Account Details', 'Passport Size Photo', 'Address Proof'],
      2: ['Aadhar Card', 'Any Government ID', 'Passport Size Photo'],
      3: ['Aadhar Card', 'Ration Card', 'Income Certificate', 'Family Photo', 'Bank Account Details'],
      4: ['Aadhar Card', 'Land Ownership Documents', 'Bank Account Details', 'Passport Size Photo'],
    };

    const requiredDocs = schemeDocuments[schemeId] || ['Aadhar Card', 'PAN Card'];
    const result = checkRequiredDocuments(docs, requiredDocs);

    if (result.missing.length > 0) {
      Alert.alert(
        'Missing Documents',
        `Please upload the following documents: ${result.missing.join(', ')}\n\nYou can upload them from the Documents section.`,
        [
          { text: 'Upload Now', onPress: () => router.push('/documents') },
          { text: 'Continue Anyway', style: 'cancel' },
        ]
      );
    }

    return result;
  };

  const speakQuestion = (text) => {
    if (voiceEnabled && !isSpeaking) {
      setIsSpeaking(true);
      Speech.speak(text, {
        language: language === 'hi' ? 'hi-IN' : 'en-US',
        pitch: 1.0,
        rate: 0.9,
        onDone: () => setIsSpeaking(false),
        onStopped: () => setIsSpeaking(false),
        onError: () => setIsSpeaking(false),
      });
    }
  };

  const handleNext = () => {
    const currentField = formFields[currentStep].field;
    const value = formData[currentField];

    if (!value || value.trim() === '') {
      const message = language === 'hi' 
        ? `कृपया ${formFields[currentStep].label} भरें` 
        : `Please fill ${formFields[currentStep].label}`;
      Alert.alert('Required', message);
      return;
    }

    if (currentStep < formFields.length - 1) {
      const nextStep = currentStep + 1;
      setCurrentStep(nextStep);
    } else {
      handleSubmit();
    }
  };

  const handlePrevious = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleSubmit = async () => {
    try {
      const token = await AsyncStorage.getItem('@auth_token');
      const documentsData = await AsyncStorage.getItem(STORAGE_KEYS.USER_DOCUMENTS);
      
      // Prepare documents for submission
      const submittedDocuments = documentsData ? JSON.parse(documentsData).map(doc => ({
        type: doc.name,
        uri: doc.uri,
        name: doc.name,
      })) : [];

      const applicationData = {
        schemeId: parseInt(schemeId),
        schemeName,
        formData,
        documents: submittedDocuments,
      };

      // Send to backend API
      const API_URL = process.env.EXPO_PUBLIC_API_URL || 'http://localhost:5000/api';
      
      // Get or create device ID for unauthenticated users
      let deviceId = await AsyncStorage.getItem('@device_id');
      if (!deviceId) {
        deviceId = `device_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
        await AsyncStorage.setItem('@device_id', deviceId);
      }
      
      // Authentication is optional - allow submission without token
      const headers = {
        'Content-Type': 'application/json',
      };
      
      // Add token if available, but don't require it
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }

      // Add deviceId to application data
      applicationData.deviceId = deviceId;

      console.log('Submitting application to:', `${API_URL}/applications/submit`);
      console.log('Application data:', JSON.stringify(applicationData, null, 2));

      const response = await fetch(`${API_URL}/applications/submit`, {
        method: 'POST',
        headers: headers,
        body: JSON.stringify(applicationData),
      });

      console.log('Response status:', response.status);

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || `Server error: ${response.status}`);
      }

      const data = await response.json();
      console.log('Response data:', data);

      if (data.success) {
        Alert.alert(
          language === 'hi' ? 'सफल' : 'Success',
          language === 'hi' 
            ? 'आवेदन सफलतापूर्वक जमा हो गया है!' 
            : 'Application submitted successfully!',
          [{ text: 'OK', onPress: () => router.back() }]
        );
      } else {
        throw new Error(data.message || 'Failed to submit');
      }
    } catch (error) {
      console.error('Submit error:', error);
      console.error('Error stack:', error.stack);
      Alert.alert(
        'Error', 
        error.message || 'Failed to submit application. Please check your internet connection and try again.'
      );
    }
  };

  const toggleVoice = () => {
    if (isSpeaking) {
      Speech.stop();
      setIsSpeaking(false);
    }
    setVoiceEnabled(!voiceEnabled);
  };

  const toggleLanguage = async () => {
    const newLang = language === 'en' ? 'hi' : 'en';
    setLanguage(newLang);
    await AsyncStorage.setItem(STORAGE_KEYS.LANGUAGE, newLang);
    if (voiceEnabled && formFields[currentStep]) {
      const question = newLang === 'hi' ? formFields[currentStep].questionHi : formFields[currentStep].questionEn;
      speakQuestion(question);
    }
  };

  const currentField = formFields[currentStep];
  const progress = ((currentStep + 1) / formFields.length) * 100;

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#1F2937" />
      
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Text style={styles.backIcon}>←</Text>
        </TouchableOpacity>
        <View style={styles.logoContainer}>
          <View style={styles.logo}>
            <Text style={styles.logoText}>🏛️</Text>
          </View>
          <Text style={styles.appName}>Niti Nidhi</Text>
        </View>
        <Text style={styles.headerTitle}>Application Form</Text>
        <View style={styles.headerIcons}>
          <TouchableOpacity onPress={toggleLanguage} style={styles.langButton}>
            <Text style={styles.langText}>{language === 'en' ? 'हिं' : 'EN'}</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={toggleVoice} style={styles.voiceButton}>
            <Text style={styles.voiceIcon}>{voiceEnabled ? '🔊' : '🔇'}</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Progress Bar */}
      <View style={styles.progressContainer}>
        <View style={styles.progressBar}>
          <View style={[styles.progressFill, { width: `${progress}%` }]} />
        </View>
        <Text style={styles.progressText}>
          {language === 'hi' ? 'चरण' : 'Step'} {currentStep + 1} {language === 'hi' ? 'का' : 'of'} {formFields.length}
        </Text>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Scheme Info */}
        <View style={styles.schemeInfo}>
          <Text style={styles.schemeName}>{schemeName}</Text>
        </View>

        {/* Voice Assistant Message */}
        {voiceEnabled && currentField && (
          <View style={styles.voiceMessage}>
            <Text style={styles.voiceMessageIcon}>🎤</Text>
            <Text style={styles.voiceMessageText}>
              {language === 'hi' ? currentField.questionHi : currentField.questionEn}
            </Text>
          </View>
        )}

        {/* Form Field */}
        {currentField && (
          <View style={styles.formContainer}>
            <Text style={styles.fieldLabel}>{currentField.label}</Text>
            
            <TextInput
              style={styles.input}
              placeholder={language === 'hi' ? `दर्ज करें ${currentField.label}` : `Enter ${currentField.label}`}
              placeholderTextColor="#9CA3AF"
              value={formData[currentField.field] || ''}
              onChangeText={(text) => setFormData({ ...formData, [currentField.field]: text })}
              keyboardType={currentField.field === 'pincode' || currentField.field === 'bankAccount' ? 'numeric' : 'default'}
            />

            {/* Navigation Buttons */}
            <View style={styles.buttonContainer}>
              {currentStep > 0 && (
                <TouchableOpacity
                  style={[styles.button, styles.secondaryButton]}
                  onPress={handlePrevious}
                >
                  <Text style={styles.secondaryButtonText}>
                    {language === 'hi' ? 'पिछला' : 'Previous'}
                  </Text>
                </TouchableOpacity>
              )}
              
              <TouchableOpacity
                style={[styles.button, styles.primaryButton, { flex: 1 }]}
                onPress={handleNext}
              >
                <Text style={styles.buttonText}>
                  {currentStep === formFields.length - 1 
                    ? (language === 'hi' ? 'जमा करें' : 'Submit')
                    : (language === 'hi' ? 'अगला' : 'Next')}
                </Text>
              </TouchableOpacity>
            </View>
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
    marginRight: 8,
  },
  backIcon: {
    color: '#fff',
    fontSize: 24,
  },
  logoContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 8,
  },
  logo: {
    width: 32,
    height: 32,
    backgroundColor: '#A78BFA',
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 8,
  },
  logoText: {
    fontSize: 18,
  },
  appName: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  headerTitle: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
    flex: 1,
    marginLeft: 8,
  },
  headerIcons: {
    flexDirection: 'row',
    gap: 12,
  },
  langButton: {
    width: 40,
    height: 40,
    backgroundColor: '#374151',
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  langText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: 'bold',
  },
  voiceButton: {
    width: 40,
    height: 40,
    backgroundColor: '#374151',
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  voiceIcon: {
    fontSize: 20,
  },
  progressContainer: {
    backgroundColor: '#fff',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  progressBar: {
    height: 8,
    backgroundColor: '#E5E7EB',
    borderRadius: 4,
    marginBottom: 8,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#A78BFA',
    borderRadius: 4,
  },
  progressText: {
    fontSize: 12,
    color: '#6B7280',
    textAlign: 'center',
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
  },
  schemeInfo: {
    backgroundColor: '#E0E7FF',
    borderRadius: 12,
    padding: 16,
    marginTop: 20,
    marginBottom: 16,
  },
  schemeName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1F2937',
  },
  voiceMessage: {
    backgroundColor: '#DBEAFE',
    borderRadius: 16,
    padding: 16,
    marginBottom: 24,
    flexDirection: 'row',
    alignItems: 'center',
  },
  voiceMessageIcon: {
    fontSize: 24,
    marginRight: 12,
  },
  voiceMessageText: {
    flex: 1,
    fontSize: 16,
    color: '#1F2937',
    lineHeight: 22,
  },
  formContainer: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 24,
    marginBottom: 24,
  },
  fieldLabel: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1F2937',
    marginBottom: 16,
  },
  input: {
    backgroundColor: '#F3F4F6',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 16,
    color: '#1F2937',
    marginBottom: 24,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  buttonContainer: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 8,
  },
  button: {
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  primaryButton: {
    backgroundColor: '#A78BFA',
  },
  secondaryButton: {
    backgroundColor: '#E5E7EB',
    paddingHorizontal: 24,
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  secondaryButtonText: {
    color: '#1F2937',
    fontSize: 16,
    fontWeight: '600',
  },
  bottomSpacing: {
    height: 100,
  },
});
