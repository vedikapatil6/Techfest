import AsyncStorage from '@react-native-async-storage/async-storage';
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import { ActivityIndicator, Alert, StatusBar, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';

const STORAGE_KEYS = {
  IS_LOGGED_IN: '@is_logged_in',
  USER_PHONE: '@user_phone',
  USER_PROFILE_COMPLETE: '@user_profile_complete',
};

export default function LoginScreen() {
  const router = useRouter();
  const [phoneNumber, setPhoneNumber] = useState('');
  const [otp, setOtp] = useState('');
  const [showOtpInput, setShowOtpInput] = useState(false);
  const [loading, setLoading] = useState(false);

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
    
    // Simulate OTP sending
    setTimeout(() => {
      setShowOtpInput(true);
      setLoading(false);
      Alert.alert('OTP Sent!', `Use OTP: 000000 for testing`);
    }, 1000);
  };

  const handleVerifyOtp = async () => {
    if (!otp.trim()) {
      Alert.alert('Error', 'Please enter OTP');
      return;
    }

    if (otp !== '000000') {
      Alert.alert('Error', 'Invalid OTP. Please use 000000 for testing');
      return;
    }

    setLoading(true);

    try {
      // Save login state
      await AsyncStorage.setItem(STORAGE_KEYS.IS_LOGGED_IN, 'true');
      await AsyncStorage.setItem(STORAGE_KEYS.USER_PHONE, phoneNumber);
      
      // Check if profile exists
      const profileComplete = await AsyncStorage.getItem(STORAGE_KEYS.USER_PROFILE_COMPLETE);
      
      setLoading(false);
      
      if (profileComplete === 'true') {
        router.replace('/(tabs)');
      } else {
        router.replace('/profile-setup');
      }
    } catch (error) {
      console.error('Login error:', error);
      setLoading(false);
      Alert.alert('Error', 'Failed to login. Please try again.');
    }
  };

  const handleResendOtp = () => {
    setShowOtpInput(false);
    setOtp('');
    Alert.alert('Info', 'Please enter your phone number again to receive a new OTP');
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#1F2937" />

      <View style={styles.content}>
        <View style={styles.logoContainer}>
          <View style={styles.logo}>
            <Text style={styles.logoText}>🏛️</Text>
          </View>
          <Text style={styles.appName}>Niti Nidhi</Text>
          <Text style={styles.tagline}>Your Gateway to Government Schemes</Text>
        </View>

        {!showOtpInput ? (
          <>
            <View style={styles.inputContainer}>
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
            </View>
          </>
        ) : (
          <>
            <View style={styles.inputContainer}>
              <Text style={styles.label}>Enter OTP</Text>
              <Text style={styles.subLabel}>Code sent to +91 {phoneNumber}</Text>
              <Text style={styles.otpHint}>Use OTP: 000000 for testing</Text>
              <TextInput
                style={styles.otpInput}
                placeholder="000000"
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
            </View>
          </>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0F172A',
  },
  content: {
    flex: 1,
    paddingHorizontal: 24,
    paddingTop: 80,
    justifyContent: 'center',
  },
  logoContainer: {
    alignItems: 'center',
    marginBottom: 48,
  },
  logo: {
    width: 80,
    height: 80,
    backgroundColor: '#6366F1',
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
    shadowColor: '#6366F1',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 16,
    elevation: 8,
  },
  logoText: {
    fontSize: 40,
  },
  appName: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 8,
  },
  tagline: {
    fontSize: 16,
    color: '#94A3B8',
    textAlign: 'center',
  },
  inputContainer: {
    backgroundColor: '#1E293B',
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
    color: '#fff',
    fontWeight: '600',
    marginBottom: 16,
  },
  subLabel: {
    fontSize: 14,
    color: '#94A3B8',
    marginBottom: 8,
  },
  phoneInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#0F172A',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#334155',
    marginBottom: 8,
  },
  countryCode: {
    fontSize: 16,
    color: '#fff',
    paddingLeft: 16,
    paddingRight: 12,
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
    color: '#64748B',
    marginBottom: 24,
  },
  otpHint: {
    fontSize: 14,
    color: '#6366F1',
    marginBottom: 12,
    fontWeight: '600',
  },
  otpInput: {
    backgroundColor: '#0F172A',
    borderRadius: 12,
    padding: 16,
    fontSize: 24,
    color: '#fff',
    marginBottom: 24,
    borderWidth: 1,
    borderColor: '#334155',
    textAlign: 'center',
    letterSpacing: 8,
  },
  button: {
    backgroundColor: '#6366F1',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
    shadowColor: '#6366F1',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
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
    color: '#94A3B8',
    fontSize: 14,
  },
  resendText: {
    color: '#6366F1',
    fontSize: 14,
    fontWeight: '600',
  },
  changeNumberButton: {
    alignItems: 'center',
    padding: 12,
  },
  changeNumberText: {
    color: '#6366F1',
    fontSize: 14,
    fontWeight: '600',
  },
});
