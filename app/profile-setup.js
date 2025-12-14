import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, StatusBar, ScrollView, TextInput, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Speech from 'expo-speech';

const STORAGE_KEYS = {
  USER_PROFILE: '@user_profile',
  USER_PROFILE_COMPLETE: '@user_profile_complete',
  LANGUAGE: '@user_language',
};

const steps = [
  { 
    id: 1, field: 'fullName', label: 'Full Name', 
    questionEn: 'Please tell me your full name. What is your complete name?', 
    questionHi: 'कृपया अपना पूरा नाम बताएं। आपका पूरा नाम क्या है?',
    placeholderEn: 'Enter your full name',
    placeholderHi: 'अपना पूरा नाम दर्ज करें'
  },
  { 
    id: 2, field: 'age', label: 'Age', 
    questionEn: 'How old are you? Please tell me your age in years.', 
    questionHi: 'आपकी उम्र क्या है? कृपया अपनी उम्र सालों में बताएं।',
    placeholderEn: 'Enter your age',
    placeholderHi: 'अपनी उम्र दर्ज करें'
  },
  { 
    id: 3, field: 'gender', label: 'Gender', 
    questionEn: 'What is your gender? Are you male, female, or other?', 
    questionHi: 'आपका लिंग क्या है? क्या आप पुरुष, महिला या अन्य हैं?',
    placeholderEn: 'Select gender',
    placeholderHi: 'लिंग चुनें'
  },
  { 
    id: 4, field: 'location', label: 'Location', 
    questionEn: 'Where do you live? Please tell me your city or area name.', 
    questionHi: 'आप कहाँ रहते हैं? कृपया अपने शहर या क्षेत्र का नाम बताएं।',
    placeholderEn: 'Enter your location',
    placeholderHi: 'अपना स्थान दर्ज करें'
  },
  { 
    id: 5, field: 'occupation', label: 'Occupation', 
    questionEn: 'What work do you do? What is your job or profession?', 
    questionHi: 'आप क्या काम करते हैं? आपका काम या पेशा क्या है?',
    placeholderEn: 'Enter your occupation',
    placeholderHi: 'अपना व्यवसाय दर्ज करें'
  },
  { 
    id: 6, field: 'income', label: 'Monthly Income', 
    questionEn: 'What is your monthly income? Please tell me the amount in rupees.', 
    questionHi: 'आपकी मासिक आय क्या है? कृपया रुपये में राशि बताएं।',
    placeholderEn: 'Enter monthly income',
    placeholderHi: 'मासिक आय दर्ज करें'
  },
  { 
    id: 7, field: 'disability', label: 'Disability', 
    questionEn: 'Do you have any disability? Please say yes or no.', 
    questionHi: 'क्या आपको कोई विकलांगता है? कृपया हाँ या नहीं कहें।',
    placeholderEn: 'Select option',
    placeholderHi: 'विकल्प चुनें'
  },
];

export default function ProfileSetupScreen() {
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState(0);
  const [formData, setFormData] = useState({
    fullName: '',
    age: '',
    gender: '',
    location: '',
    occupation: '',
    income: '',
    disability: '',
  });
  const [voiceEnabled, setVoiceEnabled] = useState(true);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [language, setLanguage] = useState('en');

  useEffect(() => {
    loadLanguage();
  }, []);

  useEffect(() => {
    // Speak the first question when component mounts or language changes
    if (voiceEnabled && currentStep < steps.length) {
      const question = language === 'hi' ? steps[currentStep].questionHi : steps[currentStep].questionEn;
      speakQuestion(question);
    }
  }, [language]);

  const loadLanguage = async () => {
    try {
      const lang = await AsyncStorage.getItem(STORAGE_KEYS.LANGUAGE) || 'en';
      setLanguage(lang);
    } catch (error) {
      console.error('Error loading language:', error);
    }
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
    const currentField = steps[currentStep].field;
    const value = formData[currentField];

    if (!value || value.trim() === '') {
      Alert.alert('Required', `Please fill ${steps[currentStep].label}`);
      return;
    }

    if (currentStep < steps.length - 1) {
      const nextStep = currentStep + 1;
      setCurrentStep(nextStep);
      if (voiceEnabled) {
        const question = language === 'hi' ? steps[nextStep].questionHi : steps[nextStep].questionEn;
        speakQuestion(question);
      }
    } else {
      handleSubmit();
    }
  };

  const handlePrevious = () => {
    if (currentStep > 0) {
      const prevStep = currentStep - 1;
      setCurrentStep(prevStep);
      if (voiceEnabled) {
        const question = language === 'hi' ? steps[prevStep].questionHi : steps[prevStep].questionEn;
        speakQuestion(question);
      }
    }
  };

  const toggleLanguage = async () => {
    const newLang = language === 'en' ? 'hi' : 'en';
    setLanguage(newLang);
    await AsyncStorage.setItem(STORAGE_KEYS.LANGUAGE, newLang);
    if (voiceEnabled && currentStep < steps.length) {
      const question = newLang === 'hi' ? steps[currentStep].questionHi : steps[currentStep].questionEn;
      speakQuestion(question);
    }
  };

  const handleSubmit = async () => {
    try {
      // Save locally first
      await AsyncStorage.setItem(STORAGE_KEYS.USER_PROFILE, JSON.stringify(formData));
      await AsyncStorage.setItem(STORAGE_KEYS.USER_PROFILE_COMPLETE, 'true');
      
      // Save to Firebase Firestore
      try {
        if (auth.currentUser) {
          const userRef = doc(db, 'users', auth.currentUser.uid);
          await setDoc(userRef, {
            profile: formData,
            language: language,
            updatedAt: serverTimestamp(),
          }, { merge: true });
          console.log('✅ Profile saved to Firestore');
        }
      } catch (firebaseError) {
        console.log('Firebase save error:', firebaseError);
      }
      
      // Also save to backend API
      try {
        const token = await AsyncStorage.getItem('@auth_token');
        if (token) {
          const API_URL = process.env.EXPO_PUBLIC_API_URL || 'http://localhost:5000/api';
          await fetch(`${API_URL}/auth/register`, {
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${token}`,
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              profile: formData,
              language: language,
            }),
          });
        }
      } catch (backendError) {
        console.log('Backend save error (non-critical):', backendError);
      }
      
      router.replace('/(tabs)');
    } catch (error) {
      console.error('Save profile error:', error);
      Alert.alert('Error', 'Failed to save profile');
    }
  };

  const toggleVoice = () => {
    if (isSpeaking) {
      Speech.stop();
      setIsSpeaking(false);
    }
    setVoiceEnabled(!voiceEnabled);
    if (!voiceEnabled && currentStep < steps.length) {
      speakQuestion(steps[currentStep].question);
    }
  };

  const currentStepData = steps[currentStep];
  const progress = ((currentStep + 1) / steps.length) * 100;

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#1F2937" />
      
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Profile Setup</Text>
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
          Step {currentStep + 1} of {steps.length}
        </Text>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Voice Assistant Message */}
        {voiceEnabled && (
          <View style={styles.voiceMessage}>
            <Text style={styles.voiceMessageIcon}>🎤</Text>
            <Text style={styles.voiceMessageText}>
              {language === 'hi' ? currentStepData.questionHi : currentStepData.questionEn}
            </Text>
          </View>
        )}

        {/* Form Field */}
        <View style={styles.formContainer}>
          <Text style={styles.fieldLabel}>{currentStepData.label}</Text>
          
          {currentStepData.field === 'gender' ? (
            <View style={styles.pickerContainer}>
              <TouchableOpacity
                style={[styles.optionButton, formData.gender === 'Male' && styles.optionButtonSelected]}
                onPress={() => setFormData({ ...formData, gender: 'Male' })}
              >
                <Text style={[styles.optionText, formData.gender === 'Male' && styles.optionTextSelected]}>Male</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.optionButton, formData.gender === 'Female' && styles.optionButtonSelected]}
                onPress={() => setFormData({ ...formData, gender: 'Female' })}
              >
                <Text style={[styles.optionText, formData.gender === 'Female' && styles.optionTextSelected]}>Female</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.optionButton, formData.gender === 'Other' && styles.optionButtonSelected]}
                onPress={() => setFormData({ ...formData, gender: 'Other' })}
              >
                <Text style={[styles.optionText, formData.gender === 'Other' && styles.optionTextSelected]}>Other</Text>
              </TouchableOpacity>
            </View>
          ) : currentStepData.field === 'disability' ? (
            <View style={styles.pickerContainer}>
              <TouchableOpacity
                style={[styles.optionButton, formData.disability === 'Yes' && styles.optionButtonSelected]}
                onPress={() => setFormData({ ...formData, disability: 'Yes' })}
              >
                <Text style={[styles.optionText, formData.disability === 'Yes' && styles.optionTextSelected]}>Yes</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.optionButton, formData.disability === 'No' && styles.optionButtonSelected]}
                onPress={() => setFormData({ ...formData, disability: 'No' })}
              >
                <Text style={[styles.optionText, formData.disability === 'No' && styles.optionTextSelected]}>No</Text>
              </TouchableOpacity>
            </View>
          ) : (
            <TextInput
              style={styles.input}
              placeholder={language === 'hi' ? currentStepData.placeholderHi : currentStepData.placeholderEn}
              placeholderTextColor="#9CA3AF"
              value={formData[currentStepData.field]}
              onChangeText={(text) => setFormData({ ...formData, [currentStepData.field]: text })}
              keyboardType={currentStepData.field === 'age' || currentStepData.field === 'income' ? 'numeric' : 'default'}
            />
          )}

          {/* Navigation Buttons */}
          <View style={styles.buttonContainer}>
            {currentStep > 0 && (
              <TouchableOpacity
                style={[styles.button, styles.secondaryButton]}
                onPress={handlePrevious}
              >
                <Text style={styles.secondaryButtonText}>Previous</Text>
              </TouchableOpacity>
            )}
            
            <TouchableOpacity
              style={[styles.button, styles.primaryButton, { flex: 1 }]}
              onPress={handleNext}
            >
              <Text style={styles.buttonText}>
                {currentStep === steps.length - 1 ? 'Complete' : 'Next'}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
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
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  headerTitle: {
    color: '#fff',
    fontSize: 20,
    fontWeight: 'bold',
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
  voiceMessage: {
    backgroundColor: '#DBEAFE',
    borderRadius: 16,
    padding: 16,
    marginTop: 20,
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
  pickerContainer: {
    marginBottom: 24,
    gap: 12,
  },
  optionButton: {
    backgroundColor: '#F3F4F6',
    borderRadius: 12,
    paddingVertical: 16,
    paddingHorizontal: 20,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#E5E7EB',
  },
  optionButtonSelected: {
    backgroundColor: '#E0E7FF',
    borderColor: '#A78BFA',
  },
  optionText: {
    fontSize: 16,
    color: '#1F2937',
    fontWeight: '500',
  },
  optionTextSelected: {
    color: '#6366F1',
    fontWeight: 'bold',
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
});

