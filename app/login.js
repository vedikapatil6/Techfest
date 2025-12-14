import React, { useState, useRef } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, StatusBar, TextInput, Alert, ActivityIndicator, Platform } from 'react-native';
import { useRouter } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { FirebaseRecaptchaVerifierModal } from 'expo-firebase-recaptcha';
import { auth, db } from '../src/config/firebase';
import app from '../src/config/firebase';
import { 
  PhoneAuthProvider, 
  signInWithCredential
} from 'firebase/auth';
import { doc, setDoc, getDoc, serverTimestamp } from 'firebase/firestore';

const STORAGE_KEYS = {
  IS_LOGGED_IN: '@is_logged_in',
  USER_PHONE: '@user_phone',
  USER_PROFILE_COMPLETE: '@user_profile_complete',
};

const API_URL = process.env.EXPO_PUBLIC_API_URL || 'http://localhost:5000/api';

export default function LoginScreen() {
  const router = useRouter();
  const recaptchaVerifier = useRef(null);
  const [phoneNumber, setPhoneNumber] = useState('');
  const [otp, setOtp] = useState('');
  const [showOtpInput, setShowOtpInput] = useState(false);
  const [loading, setLoading] = useState(false);
  const [verificationId, setVerificationId] = useState(null);

  const validatePhoneNumber = (phone) => {
    const phoneRegex = /^[6-9]\d{9}$/;
    return phoneRegex.test(phone);
  };

  const handleSendOtp = async () => {
    if (!phoneNumber.trim()) {
      Alert.alert('Error', 'Please enter your phone number');
      return;
    }

    if (!validatePhoneNumber(phoneNumber)) {
      Alert.alert('Error', 'Please enter a valid 10-digit phone number starting with 6-9');
      return;
    }

    setLoading(true);
    
    try {
      if (!auth) {
        throw new Error('Firebase Auth not initialized');
      }

      const fullPhoneNumber = `+91${phoneNumber}`;
      console.log('📱 Sending OTP to:', fullPhoneNumber);
      
      // Create phone auth provider
      const phoneProvider = new PhoneAuthProvider(auth);
      
      // Send verification code
      const verificationId = await phoneProvider.verifyPhoneNumber(
        fullPhoneNumber,
        recaptchaVerifier.current
      );
      
      console.log('✅ OTP sent successfully');
      setVerificationId(verificationId);
      setShowOtpInput(true);
      setLoading(false);
      
      Alert.alert('OTP Sent!', `Verification code has been sent to +91 ${phoneNumber}`);
    } catch (error) {
      console.error('Send OTP error:', error);
      setLoading(false);
      
      let errorMessage = 'Failed to send OTP. Please try again.';
      
      switch (error.code) {
        case 'auth/invalid-phone-number':
          errorMessage = 'Invalid phone number format. Please enter a valid 10-digit number.';
          break;
        case 'auth/missing-phone-number':
          errorMessage = 'Phone number is required.';
          break;
        case 'auth/quota-exceeded':
          errorMessage = 'SMS quota exceeded. Please try again later.';
          break;
        case 'auth/too-many-requests':
          errorMessage = 'Too many attempts. Please try again later.';
          break;
        case 'auth/user-disabled':
          errorMessage = 'This account has been disabled.';
          break;
        default:
          if (error.message) {
            errorMessage = error.message;
          }
      }
      
      Alert.alert('Error', errorMessage);
    }
  };

  const handleVerifyOtp = async () => {
    if (!otp.trim() || otp.length !== 6) {
      Alert.alert('Error', 'Please enter a valid 6-digit OTP');
      return;
    }

    if (!verificationId) {
      Alert.alert('Error', 'Please request OTP first');
      return;
    }

    setLoading(true);
    
    try {
      console.log('Verifying OTP...');
      
      // Create credential with verification ID and OTP
      const credential = PhoneAuthProvider.credential(verificationId, otp);
      
      // Sign in with credential
      const userCredential = await signInWithCredential(auth, credential);
      const user = userCredential.user;
      
      console.log('✅ Firebase user authenticated:', user.uid);

      // Get Firebase ID token
      const idToken = await user.getIdToken();

      // Check if user profile exists in Firestore
      const userRef = doc(db, 'users', user.uid);
      const userDoc = await getDoc(userRef);
      
      const userData = {
        phone: user.phoneNumber || `+91${phoneNumber}`,
        firebaseUid: user.uid,
        isVerified: true,
        updatedAt: serverTimestamp(),
      };

      let isNewUser = false;

      if (!userDoc.exists()) {
        // New user - create profile
        userData.createdAt = serverTimestamp();
        await setDoc(userRef, userData);
        console.log('✅ New user created in Firestore');
        isNewUser = true;
      } else {
        // Existing user - update login time
        await setDoc(userRef, userData, { merge: true });
        console.log('✅ Existing user updated in Firestore');
        
        // Check if profile is complete
        const existingData = userDoc.data();
        if (existingData.name && existingData.email) {
          isNewUser = false;
        } else {
          isNewUser = true;
        }
      }

      // Try to verify with backend
      try {
        const response = await fetch(`${API_URL}/auth/verify-otp`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            phone: `+91${phoneNumber}`,
            idToken: idToken,
          }),
        });

        const data = await response.json();

        if (data.success && data.token) {
          await AsyncStorage.setItem('@auth_token', data.token);
          console.log('✅ Backend JWT token saved');
        }
      } catch (backendError) {
        console.log('⚠️ Backend verification skipped:', backendError.message);
        // Continue with Firebase token
      }

      // Save authentication data locally
      await AsyncStorage.setItem(STORAGE_KEYS.IS_LOGGED_IN, 'true');
      await AsyncStorage.setItem(STORAGE_KEYS.USER_PHONE, phoneNumber);
      await AsyncStorage.setItem('@firebase_uid', user.uid);
      
      if (!isNewUser) {
        await AsyncStorage.setItem(STORAGE_KEYS.USER_PROFILE_COMPLETE, 'true');
      }

      setLoading(false);
      
      // Navigate based on profile completion
      if (isNewUser) {
        Alert.alert('Welcome!', 'Please complete your profile', [
          {
            text: 'OK',
            onPress: () => router.replace('/profile-setup')
          }
        ]);
      } else {
        Alert.alert('Welcome Back!', 'Login successful', [
          {
            text: 'OK',
            onPress: () => router.replace('/(tabs)')
          }
        ]);
      }
      
    } catch (error) {
      console.error('Verify OTP error:', error);
      setLoading(false);
      
      let errorMessage = 'Invalid OTP. Please try again.';
      
      switch (error.code) {
        case 'auth/invalid-verification-code':
          errorMessage = 'Invalid OTP code. Please check and try again.';
          break;
        case 'auth/code-expired':
          errorMessage = 'OTP has expired. Please request a new one.';
          break;
        case 'auth/invalid-verification-id':
          errorMessage = 'Invalid verification session. Please try again.';
          break;
        default:
          if (error.message) {
            errorMessage = error.message;
          }
      }
      
      Alert.alert('Error', errorMessage);
    }
  };

  const handleResendOtp = () => {
    setShowOtpInput(false);
    setOtp('');
    setVerificationId(null);
    Alert.alert('Info', 'Please enter your phone number again to receive a new OTP');
  };

  const handleGoogleSignIn = () => {
    Alert.alert(
      'Coming Soon',
      'Google Sign-In will be available in the next update. Please use Phone authentication for now.',
      [{ text: 'OK' }]
    );
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#1F2937" />
      
      <FirebaseRecaptchaVerifierModal
        ref={recaptchaVerifier}
        firebaseConfig={app.options}
        attemptInvisibleVerification={true}
      />

      <View style={styles.content}>
        <View style={styles.logoContainer}>
          <View style={styles.logo}>
            <Text style={styles.logoText}>🏛️</Text>
          </View>
          <Text style={styles.appName}>Niti Nidhi</Text>
          <Text style={styles.tagline}>Government Schemes Made Easy</Text>
        </View>

        <View style={styles.formContainer}>
          {!showOtpInput ? (
            <>
              <Text style={styles.label}>Enter Your Phone Number</Text>
              <View style={styles.phoneInputContainer}>
                <Text style={styles.countryCode}>+91</Text>
                <TextInput
                  style={styles.phoneInput}
                  placeholder="9876543210"
                  placeholderTextColor="#9CA3AF"
                  value={phoneNumber}
                  onChangeText={setPhoneNumber}
                  keyboardType="phone-pad"
                  maxLength={10}
                  editable={!loading}
                />
              </View>
              <Text style={styles.hint}>Enter 10-digit mobile number</Text>
              
              <TouchableOpacity
                style={[styles.button, loading && styles.buttonDisabled]}
                onPress={handleSendOtp}
                disabled={loading}
              >
                {loading ? (
                  <ActivityIndicator color="#fff" />
                ) : (
                  <Text style={styles.buttonText}>Send OTP</Text>
                )}
              </TouchableOpacity>
            </>
          ) : (
            <>
              <Text style={styles.label}>Enter OTP</Text>
              <Text style={styles.subLabel}>Code sent to +91 {phoneNumber}</Text>
              <TextInput
                style={styles.otpInput}
                placeholder="● ● ● ● ● ●"
                placeholderTextColor="#9CA3AF"
                value={otp}
                onChangeText={setOtp}
                keyboardType="number-pad"
                maxLength={6}
                editable={!loading}
                autoFocus
              />
              
              <TouchableOpacity
                style={[styles.button, loading && styles.buttonDisabled]}
                onPress={handleVerifyOtp}
                disabled={loading}
              >
                {loading ? (
                  <ActivityIndicator color="#fff" />
                ) : (
                  <Text style={styles.buttonText}>Verify OTP</Text>
                )}
              </TouchableOpacity>
              
              <View style={styles.resendContainer}>
                <Text style={styles.resendLabel}>Didn't receive code?</Text>
                <TouchableOpacity onPress={handleResendOtp} disabled={loading}>
                  <Text style={styles.resendText}>Resend OTP</Text>
                </TouchableOpacity>
              </View>

              <TouchableOpacity
                style={styles.changeNumberButton}
                onPress={handleResendOtp}
                disabled={loading}
              >
                <Text style={styles.changeNumberText}>Change Phone Number</Text>
              </TouchableOpacity>
            </>
          )}

          <View style={styles.divider}>
            <View style={styles.dividerLine} />
            <Text style={styles.dividerText}>OR</Text>
            <View style={styles.dividerLine} />
          </View>

          <TouchableOpacity
            style={[styles.googleButton, loading && styles.buttonDisabled]}
            onPress={handleGoogleSignIn}
            disabled={loading}
          >
            <Text style={styles.googleIcon}>G</Text>
            <Text style={styles.googleButtonText}>Sign in with Google</Text>
          </TouchableOpacity>
        </View>

        <Text style={styles.footer}>
          By continuing, you agree to our Terms of Service and Privacy Policy
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1F2937',
  },
  content: {
    flex: 1,
    paddingHorizontal: 24,
    paddingTop: 60,
    justifyContent: 'center',
  },
  logoContainer: {
    alignItems: 'center',
    marginBottom: 48,
  },
  logo: {
    width: 100,
    height: 100,
    backgroundColor: '#A78BFA',
    borderRadius: 50,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
    shadowColor: '#A78BFA',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  logoText: {
    fontSize: 50,
  },
  appName: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 8,
  },
  tagline: {
    fontSize: 16,
    color: '#9CA3AF',
    textAlign: 'center',
  },
  formContainer: {
    backgroundColor: '#374151',
    borderRadius: 24,
    padding: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
    marginBottom: 12,
  },
  subLabel: {
    fontSize: 14,
    color: '#9CA3AF',
    marginBottom: 16,
  },
  phoneInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1F2937',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#4B5563',
    marginBottom: 8,
  },
  countryCode: {
    fontSize: 16,
    color: '#fff',
    paddingLeft: 16,
    paddingRight: 8,
    fontWeight: '600',
  },
  phoneInput: {
    flex: 1,
    padding: 16,
    fontSize: 16,
    color: '#fff',
  },
  hint: {
    fontSize: 12,
    color: '#9CA3AF',
    marginBottom: 20,
  },
  otpInput: {
    backgroundColor: '#1F2937',
    borderRadius: 12,
    padding: 16,
    fontSize: 24,
    color: '#fff',
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#4B5563',
    textAlign: 'center',
    letterSpacing: 8,
  },
  button: {
    backgroundColor: '#A78BFA',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    marginBottom: 16,
    shadowColor: '#A78BFA',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 4,
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  resendContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
    gap: 8,
  },
  resendLabel: {
    color: '#9CA3AF',
    fontSize: 14,
  },
  resendText: {
    color: '#A78BFA',
    fontSize: 14,
    fontWeight: '600',
  },
  changeNumberButton: {
    alignItems: 'center',
    padding: 12,
  },
  changeNumberText: {
    color: '#A78BFA',
    fontSize: 14,
    fontWeight: '600',
  },
  divider: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 24,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: '#4B5563',
  },
  dividerText: {
    color: '#9CA3AF',
    paddingHorizontal: 16,
    fontSize: 14,
    fontWeight: '600',
  },
  googleButton: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#4B5563',
    gap: 12,
  },
  googleIcon: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1F2937',
  },
  googleButtonText: {
    color: '#1F2937',
    fontSize: 16,
    fontWeight: '600',
  },
  footer: {
    color: '#9CA3AF',
    fontSize: 12,
    textAlign: 'center',
    marginTop: 24,
    lineHeight: 18,
  },
});