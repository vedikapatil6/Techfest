import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, StatusBar, ScrollView, TextInput, Alert, Image } from 'react-native';
import { useRouter } from 'expo-router';
import * as DocumentPicker from 'expo-document-picker';
import * as ImagePicker from 'expo-image-picker';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { auth, db } from './config/firebase';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import BottomNav from './components/BottomNav';
import AppHeader from './components/AppHeader';

const API_URL = process.env.EXPO_PUBLIC_API_URL || 'http://localhost:5000/api';

const categories = [
  'Health',
  'Education',
  'Infrastructure',
  'Water Supply',
  'Electricity',
  'Sanitation',
  'Other',
];

export default function ComplaintsScreen() {
  const router = useRouter();
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [description, setDescription] = useState('');
  const [attachments, setAttachments] = useState([]);
  const [loading, setLoading] = useState(false);

  const pickImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      quality: 0.8,
    });

    if (!result.canceled && result.assets[0]) {
      setAttachments(prev => [...prev, {
        type: 'image',
        uri: result.assets[0].uri,
        name: result.assets[0].uri.split('/').pop(),
        mimeType: result.assets[0].mimeType || 'image/jpeg',
      }]);
    }
  };

  const pickVideo = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Videos,
      allowsEditing: true,
      quality: 0.8,
    });

    if (!result.canceled && result.assets[0]) {
      setAttachments(prev => [...prev, {
        type: 'video',
        uri: result.assets[0].uri,
        name: result.assets[0].uri.split('/').pop(),
        mimeType: result.assets[0].mimeType || 'video/mp4',
      }]);
    }
  };

  const pickDocument = async () => {
    const result = await DocumentPicker.getDocumentAsync({
      type: '*/*',
      copyToCacheDirectory: true,
    });

    if (!result.canceled && result.assets[0]) {
      setAttachments(prev => [...prev, {
        type: 'text',
        uri: result.assets[0].uri,
        name: result.assets[0].name,
        mimeType: result.assets[0].mimeType || 'application/pdf',
      }]);
    }
  };

  const removeAttachment = (index) => {
    setAttachments(prev => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async () => {
    if (!selectedCategory) {
      Alert.alert('Error', 'Please select a category');
      return;
    }

    if (!description.trim()) {
      Alert.alert('Error', 'Please enter a description');
      return;
    }

    setLoading(true);

    try {
      const token = await AsyncStorage.getItem('@auth_token');
      const profileData = await AsyncStorage.getItem('@user_profile');
      const profile = profileData ? JSON.parse(profileData) : {};
      const userName = profile.fullName || 'User';

      // Save to Firebase Firestore first
      try {
        if (auth.currentUser) {
          await addDoc(collection(db, 'complaints'), {
            userId: auth.currentUser.uid,
            userName,
            category: selectedCategory,
            description: description.trim(),
            attachments: attachments,
            status: 'Pending',
            createdAt: serverTimestamp(),
            updatedAt: serverTimestamp(),
          });
          console.log('✅ Complaint saved to Firestore');
        }
      } catch (firebaseError) {
        console.log('Firebase save error:', firebaseError);
      }

      if (!token) {
        throw new Error('Not authenticated. Please login again.');
      }

      const response = await fetch(`${API_URL}/complaints/submit`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          category: selectedCategory,
          description: description.trim(),
          attachments: attachments,
          userName,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || `Server error: ${response.status}`);
      }

      const data = await response.json();

      if (data.success) {
        Alert.alert(
          'Success',
          'Complaint submitted successfully!',
          [{ text: 'OK', onPress: () => router.push('/check-status') }]
        );
      } else {
        throw new Error(data.message || 'Failed to submit complaint');
      }
    } catch (error) {
      console.error('Submit complaint error:', error);
      Alert.alert('Error', error.message || 'Failed to submit complaint. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#1F2937" />
      
      <AppHeader title="Raise Complaint" />

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Check Status Button */}
        <TouchableOpacity 
          style={styles.checkStatusButton}
          onPress={() => router.push('/check-status')}
        >
          <Text style={styles.checkStatusText}>✓ Check Status</Text>
        </TouchableOpacity>

        {/* Raise Complaint Section */}
        <Text style={styles.sectionTitle}>Raise a Complaint</Text>

        {/* Category Selection */}
        <Text style={styles.label}>Select Category</Text>
        <View style={styles.categoriesGrid}>
          {categories.map((category) => (
            <TouchableOpacity
              key={category}
              style={[
                styles.categoryButton,
                selectedCategory === category && styles.categoryButtonSelected,
              ]}
              onPress={() => setSelectedCategory(category)}
            >
              <Text
                style={[
                  styles.categoryButtonText,
                  selectedCategory === category && styles.categoryButtonTextSelected,
                ]}
              >
                {category}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Description */}
        <Text style={styles.label}>Description</Text>
        <TextInput
          style={styles.descriptionInput}
          placeholder="Describe your complaint in detail..."
          placeholderTextColor="#9CA3AF"
          value={description}
          onChangeText={setDescription}
          multiline
          numberOfLines={6}
          textAlignVertical="top"
        />

        {/* Attachments */}
        <Text style={styles.label}>Attachments (Optional)</Text>
        <View style={styles.attachmentButtons}>
          <TouchableOpacity style={styles.attachmentButton} onPress={pickImage}>
            <Text style={styles.attachmentButtonText}>📷 Image</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.attachmentButton} onPress={pickVideo}>
            <Text style={styles.attachmentButtonText}>🎥 Video</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.attachmentButton} onPress={pickDocument}>
            <Text style={styles.attachmentButtonText}>📄 Document</Text>
          </TouchableOpacity>
        </View>

        {/* Attachments List */}
        {attachments.length > 0 && (
          <View style={styles.attachmentsList}>
            {attachments.map((attachment, index) => (
              <View key={index} style={styles.attachmentItem}>
                <Text style={styles.attachmentName} numberOfLines={1}>
                  {attachment.name || `Attachment ${index + 1}`}
                </Text>
                <TouchableOpacity onPress={() => removeAttachment(index)}>
                  <Text style={styles.removeAttachment}>✕</Text>
                </TouchableOpacity>
              </View>
            ))}
          </View>
        )}

        {/* Submit Button */}
        <TouchableOpacity
          style={[styles.submitButton, loading && styles.submitButtonDisabled]}
          onPress={handleSubmit}
          disabled={loading}
        >
          <Text style={styles.submitButtonText}>
            {loading ? 'Submitting...' : 'Submit Complaint'}
          </Text>
        </TouchableOpacity>

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
    paddingTop: 20,
  },
  checkStatusButton: {
    backgroundColor: '#A78BFA',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    marginBottom: 24,
  },
  checkStatusText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  sectionTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1F2937',
    marginBottom: 20,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 12,
    marginTop: 16,
  },
  categoriesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  categoryButton: {
    backgroundColor: '#fff',
    borderRadius: 12,
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderWidth: 2,
    borderColor: '#E5E7EB',
  },
  categoryButtonSelected: {
    backgroundColor: '#A78BFA',
    borderColor: '#A78BFA',
  },
  categoryButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1F2937',
  },
  categoryButtonTextSelected: {
    color: '#fff',
  },
  descriptionInput: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    color: '#1F2937',
    minHeight: 120,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  attachmentButtons: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 16,
  },
  attachmentButton: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 12,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    flex: 1,
    alignItems: 'center',
  },
  attachmentButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1F2937',
  },
  attachmentsList: {
    marginBottom: 20,
  },
  attachmentItem: {
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 12,
    marginBottom: 8,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  attachmentName: {
    flex: 1,
    fontSize: 14,
    color: '#1F2937',
    marginRight: 12,
  },
  removeAttachment: {
    fontSize: 18,
    color: '#EF4444',
    fontWeight: 'bold',
  },
  submitButton: {
    backgroundColor: '#A78BFA',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    marginTop: 20,
    marginBottom: 20,
  },
  submitButtonDisabled: {
    backgroundColor: '#D1D5DB',
  },
  submitButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  bottomSpacing: {
    height: 100,
  },
});
