import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, Alert, ScrollView, StatusBar, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import AppHeader from './components/AppHeader';
import BottomNav from './components/BottomNav';

const API_URL = process.env.EXPO_PUBLIC_API_URL || 'http://localhost:5000/api';

const statusColors = {
  Pending: '#F59E0B',
  'Under Review': '#3B82F6',
  Approved: '#10B981',
  Rejected: '#EF4444',
};

const statusIcons = {
  Pending: '⏳',
  'Under Review': '🔍',
  Approved: '✅',
  Rejected: '❌',
};

export default function ApplicationDetailsScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const applicationId = params.applicationId;

  const [application, setApplication] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadApplicationDetails();
  }, []);

  const loadApplicationDetails = async () => {
    try {
      console.log('📤 Fetching application details for:', applicationId);
      
      const response = await fetch(`${API_URL}/applications/${applicationId}`);
      const data = await response.json();
      
      console.log('📥 Application details response:', data);

      if (data.success) {
        setApplication(data.application);
      } else {
        Alert.alert('Error', data.message || 'Failed to load application details');
      }
    } catch (error) {
      console.error('❌ Error loading application details:', error);
      Alert.alert('Error', 'Failed to load application details');
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  if (loading) {
    return (
      <View style={styles.container}>
        <StatusBar barStyle="light-content" backgroundColor="#1F2937" />
        <AppHeader title="Application Details" />
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#A78BFA" />
          <Text style={styles.loadingText}>Loading details...</Text>
        </View>
        <BottomNav />
      </View>
    );
  }

  if (!application) {
    return (
      <View style={styles.container}>
        <StatusBar barStyle="light-content" backgroundColor="#1F2937" />
        <AppHeader title="Application Details" />
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyIcon}>📋</Text>
          <Text style={styles.emptyText}>Application Not Found</Text>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => router.back()}
          >
            <Text style={styles.backButtonText}>Go Back</Text>
          </TouchableOpacity>
        </View>
        <BottomNav />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#1F2937" />
      
      <AppHeader title="Application Details" />

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Status Card */}
        <View style={styles.statusCard}>
          <View style={styles.statusIconContainer}>
            <Text style={styles.statusIcon}>
              {statusIcons[application.status] || '📄'}
            </Text>
          </View>
          <Text style={styles.statusTitle}>{application.status || 'Pending'}</Text>
          <View style={[styles.statusBadge, { backgroundColor: statusColors[application.status] || statusColors.Pending }]}>
            <Text style={styles.statusBadgeText}>{application.status || 'Pending'}</Text>
          </View>
        </View>

        {/* Scheme Information */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>📋 Scheme Information</Text>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Scheme Name:</Text>
            <Text style={styles.infoValue}>{application.schemeName}</Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Application ID:</Text>
            <Text style={styles.infoValue}>{application.applicationId || application._id}</Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Submitted On:</Text>
            <Text style={styles.infoValue}>{formatDate(application.submittedAt)}</Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Last Updated:</Text>
            <Text style={styles.infoValue}>{formatDate(application.updatedAt)}</Text>
          </View>
        </View>

        {/* Personal Details */}
        {application.formData && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>👤 Personal Details</Text>
            
            {application.formData.fullName && (
              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>Full Name:</Text>
                <Text style={styles.infoValue}>{application.formData.fullName}</Text>
              </View>
            )}
            
            {application.formData.fatherName && (
              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>Father's Name:</Text>
                <Text style={styles.infoValue}>{application.formData.fatherName}</Text>
              </View>
            )}
            
            {application.formData.motherName && (
              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>Mother's Name:</Text>
                <Text style={styles.infoValue}>{application.formData.motherName}</Text>
              </View>
            )}
            
            {application.formData.address && (
              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>Address:</Text>
                <Text style={styles.infoValue}>{application.formData.address}</Text>
              </View>
            )}
            
            {application.formData.pincode && (
              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>Pincode:</Text>
                <Text style={styles.infoValue}>{application.formData.pincode}</Text>
              </View>
            )}
            
            {application.formData.age && (
              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>Age:</Text>
                <Text style={styles.infoValue}>{application.formData.age}</Text>
              </View>
            )}
          </View>
        )}

        {/* Bank Details */}
        {(application.formData?.bankAccount || application.formData?.ifscCode) && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>🏦 Bank Details</Text>
            
            {application.formData.bankAccount && (
              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>Account Number:</Text>
                <Text style={styles.infoValue}>{application.formData.bankAccount}</Text>
              </View>
            )}
            
            {application.formData.ifscCode && (
              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>IFSC Code:</Text>
                <Text style={styles.infoValue}>{application.formData.ifscCode}</Text>
              </View>
            )}
          </View>
        )}

        {/* Submitted Documents */}
        {application.documents && application.documents.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>📎 Submitted Documents</Text>
            {application.documents.map((doc, index) => (
              <View key={index} style={styles.documentItem}>
                <Text style={styles.documentIcon}>📄</Text>
                <Text style={styles.documentName}>{doc.type || doc.name}</Text>
              </View>
            ))}
          </View>
        )}

        {/* Remarks */}
        {application.remarks && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>💬 Remarks</Text>
            <View style={styles.remarksBox}>
              <Text style={styles.remarksText}>{application.remarks}</Text>
            </View>
          </View>
        )}

        {/* Status Timeline */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>📅 Timeline</Text>
          
          <View style={styles.timelineItem}>
            <View style={styles.timelineDot} />
            <View style={styles.timelineContent}>
              <Text style={styles.timelineTitle}>Application Submitted</Text>
              <Text style={styles.timelineDate}>{formatDate(application.submittedAt)}</Text>
            </View>
          </View>
          
          {application.status !== 'Pending' && (
            <View style={styles.timelineItem}>
              <View style={[styles.timelineDot, { backgroundColor: statusColors[application.status] }]} />
              <View style={styles.timelineContent}>
                <Text style={styles.timelineTitle}>Status: {application.status}</Text>
                <Text style={styles.timelineDate}>{formatDate(application.updatedAt)}</Text>
              </View>
            </View>
          )}
        </View>

        {/* Action Buttons */}
        <View style={styles.actionsContainer}>
          <TouchableOpacity
            style={styles.actionButton}
            onPress={() => router.back()}
          >
            <Text style={styles.actionButtonText}>← Back to List</Text>
          </TouchableOpacity>
        </View>

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
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    color: '#6B7280',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
  },
  emptyIcon: {
    fontSize: 64,
    marginBottom: 16,
  },
  emptyText: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1F2937',
    marginBottom: 24,
  },
  backButton: {
    backgroundColor: '#A78BFA',
    borderRadius: 12,
    paddingHorizontal: 24,
    paddingVertical: 12,
  },
  backButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  statusCard: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 24,
    marginTop: 20,
    marginBottom: 20,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  statusIconContainer: {
    width: 80,
    height: 80,
    backgroundColor: '#F3F4F6',
    borderRadius: 40,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  statusIcon: {
    fontSize: 40,
  },
  statusTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1F2937',
    marginBottom: 12,
  },
  statusBadge: {
    paddingHorizontal: 20,
    paddingVertical: 8,
    borderRadius: 20,
  },
  statusBadgeText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: 'bold',
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
  infoRow: {
    marginBottom: 12,
  },
  infoLabel: {
    fontSize: 14,
    color: '#6B7280',
    marginBottom: 4,
  },
  infoValue: {
    fontSize: 16,
    color: '#1F2937',
    fontWeight: '500',
  },
  documentItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F3F4F6',
    borderRadius: 8,
    padding: 12,
    marginBottom: 8,
  },
  documentIcon: {
    fontSize: 20,
    marginRight: 12,
  },
  documentName: {
    flex: 1,
    fontSize: 14,
    color: '#1F2937',
  },
  remarksBox: {
    backgroundColor: '#FEF3C7',
    borderRadius: 8,
    padding: 16,
    borderLeftWidth: 4,
    borderLeftColor: '#F59E0B',
  },
  remarksText: {
    fontSize: 14,
    color: '#1F2937',
    lineHeight: 20,
  },
  timelineItem: {
    flexDirection: 'row',
    marginBottom: 16,
  },
  timelineDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: '#A78BFA',
    marginRight: 12,
    marginTop: 4,
  },
  timelineContent: {
    flex: 1,
  },
  timelineTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 4,
  },
  timelineDate: {
    fontSize: 14,
    color: '#6B7280',
  },
  actionsContainer: {
    marginTop: 8,
    marginBottom: 16,
  },
  actionButton: {
    backgroundColor: '#A78BFA',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
  },
  actionButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  bottomSpacing: {
    height: 100,
  },
});