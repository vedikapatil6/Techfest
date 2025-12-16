import AsyncStorage from '@react-native-async-storage/async-storage';
import { useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, RefreshControl, ScrollView, StatusBar, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import AppHeader from './components/AppHeader';
import BottomNav from './components/BottomNav';

const API_URL = process.env.EXPO_PUBLIC_API_URL || 'http://localhost:5000/api';
const EXTERNAL_API = 'https://2ae4b041fab2.ngrok-free.app/api';

const statusColors = {
  pending: '#F59E0B',
  under_review: '#3B82F6',
  approved: '#10B981',
  rejected: '#EF4444',
  resolved: '#10B981',
  in_progress: '#3B82F6',
  Pending: '#F59E0B',
  'Under Review': '#3B82F6',
  'In Progress': '#3B82F6',
  Approved: '#10B981',
  Resolved: '#10B981',
  Rejected: '#EF4444',
};

const priorityColors = {
  critical: '#DC2626',
  high: '#F59E0B',
  medium: '#3B82F6',
  low: '#10B981',
};

export default function CheckStatusScreen() {
  const router = useRouter();
  const [applications, setApplications] = useState([]);
  const [complaints, setComplaints] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [activeTab, setActiveTab] = useState('schemes'); // 'schemes' or 'complaints'

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const token = await AsyncStorage.getItem('@auth_token');
      
      // Get or create device ID - always use this for tracking
      let deviceId = await AsyncStorage.getItem('@device_id');
      if (!deviceId) {
        deviceId = `device_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
        await AsyncStorage.setItem('@device_id', deviceId);
      }

      console.log('📱 Loading data with deviceId:', deviceId);

      const headers = {
        'Content-Type': 'application/json',
      };

      // Add auth token if available
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }

      // Load Schemes Applications
      const appsUrl = `${API_URL}/applications/my-applications?deviceId=${deviceId}`;
      console.log('📤 Fetching applications from:', appsUrl);
      
      try {
        const appsResponse = await fetch(appsUrl, { headers });
        const appsData = await appsResponse.json();
        console.log('📥 Applications response:', appsData);
        
        if (appsData.success) {
          setApplications(appsData.applications || []);
          console.log(`✅ Loaded ${appsData.applications?.length || 0} applications`);
        } else {
          console.error('❌ Failed to load applications:', appsData.message);
        }
      } catch (error) {
        console.error('❌ Error loading applications:', error);
      }

      // Load Complaints from External API
      console.log('📤 Fetching complaints from external API');
      
      try {
        const complaintsResponse = await fetch(`${EXTERNAL_API}/complaints`, {
          headers: {
            'Content-Type': 'application/json',
          },
        });
        
        if (complaintsResponse.ok) {
          const complaintsData = await complaintsResponse.json();
          console.log('📥 Complaints response:', complaintsData);
          
          // Sort by created_at descending
          const sortedComplaints = (complaintsData || []).sort((a, b) => {
            const dateA = new Date(a.created_at || 0);
            const dateB = new Date(b.created_at || 0);
            return dateB - dateA;
          });
          
          setComplaints(sortedComplaints);
          console.log(`✅ Loaded ${sortedComplaints.length} complaints`);
        } else {
          console.error('❌ Failed to load complaints:', complaintsResponse.status);
        }
      } catch (error) {
        console.error('❌ Error loading complaints:', error);
      }
    } catch (error) {
      console.error('❌ Error loading data:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    loadData();
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    });
  };

  const formatDateTime = (dateString) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-IN', { 
      day: 'numeric', 
      month: 'short', 
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#1F2937" />
      
      <AppHeader title="Check Status" />

      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#A78BFA" />
          <Text style={styles.loadingText}>Loading...</Text>
        </View>
      ) : (
        <ScrollView 
          style={styles.content} 
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={['#A78BFA']} />
          }
        >
          {/* Tabs */}
          <View style={styles.tabsContainer}>
            <TouchableOpacity
              style={[styles.tab, activeTab === 'schemes' && styles.tabActive]}
              onPress={() => setActiveTab('schemes')}
            >
              <Text style={[styles.tabText, activeTab === 'schemes' && styles.tabTextActive]}>
                Schemes ({applications.length})
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.tab, activeTab === 'complaints' && styles.tabActive]}
              onPress={() => setActiveTab('complaints')}
            >
              <Text style={[styles.tabText, activeTab === 'complaints' && styles.tabTextActive]}>
                Complaints ({complaints.length})
              </Text>
            </TouchableOpacity>
          </View>

          {/* Schemes Tab */}
          {activeTab === 'schemes' && (
            <>
              {applications.length === 0 ? (
                <View style={styles.emptyContainer}>
                  <Text style={styles.emptyIcon}>📋</Text>
                  <Text style={styles.emptyText}>No Applications Found</Text>
                  <Text style={styles.emptySubtext}>You haven't applied for any schemes yet</Text>
                  <TouchableOpacity
                    style={styles.applyButton}
                    onPress={() => router.push('/apply-schemes')}
                  >
                    <Text style={styles.applyButtonText}>Apply for Schemes</Text>
                  </TouchableOpacity>
                </View>
              ) : (
                <>
                  <Text style={styles.sectionTitle}>Your Applications</Text>
                  {applications.map((app) => (
                    <TouchableOpacity
                      key={app._id}
                      style={styles.applicationCard}
                      onPress={() => {
                        console.log('Navigating to application details:', app._id);
                        router.push({
                          pathname: '/application-details',
                          params: { 
                            applicationId: app._id || app.applicationId
                          }
                        });
                      }}
                    >
                      <View style={styles.cardHeader}>
                        <View style={styles.schemeInfo}>
                          <Text style={styles.schemeName}>{app.schemeName}</Text>
                          <Text style={styles.submittedDate}>
                            Submitted on {formatDate(app.submittedAt)}
                          </Text>
                        </View>
                        <View style={[styles.statusBadge, { backgroundColor: statusColors[app.status] || statusColors.Pending }]}>
                          <Text style={styles.statusText}>{app.status || 'Pending'}</Text>
                        </View>
                      </View>
                      
                      {app.remarks && (
                        <View style={styles.remarksContainer}>
                          <Text style={styles.remarksLabel}>Remarks:</Text>
                          <Text style={styles.remarksText}>{app.remarks}</Text>
                        </View>
                      )}
                      
                      <View style={styles.cardFooter}>
                        <Text style={styles.viewDetails}>View Details →</Text>
                      </View>
                    </TouchableOpacity>
                  ))}
                </>
              )}
            </>
          )}

          {/* Complaints Tab */}
          {activeTab === 'complaints' && (
            <>
              {complaints.length === 0 ? (
                <View style={styles.emptyContainer}>
                  <Text style={styles.emptyIcon}>📢</Text>
                  <Text style={styles.emptyText}>No Complaints Found</Text>
                  <Text style={styles.emptySubtext}>You haven't raised any complaints yet</Text>
                  <TouchableOpacity
                    style={styles.applyButton}
                    onPress={() => router.push('/complaints')}
                  >
                    <Text style={styles.applyButtonText}>Raise a Complaint</Text>
                  </TouchableOpacity>
                </View>
              ) : (
                <>
                  <Text style={styles.sectionTitle}>Your Complaints</Text>
                  {complaints.map((complaint) => (
                    <View
                      key={complaint.id}
                      style={styles.complaintCard}
                    >
                      {/* Header with Ticket Number and Status */}
                      <View style={styles.cardHeader}>
                        <View style={styles.ticketInfo}>
                          <Text style={styles.ticketNumber}>#{complaint.ticket_number}</Text>
                          {complaint.priority && (
                            <View style={[styles.priorityBadge, { backgroundColor: priorityColors[complaint.priority] || priorityColors.medium }]}>
                              <Text style={styles.priorityText}>
                                {complaint.priority?.toUpperCase()}
                              </Text>
                            </View>
                          )}
                        </View>
                        <View style={[styles.statusBadge, { backgroundColor: statusColors[complaint.status] || statusColors.pending }]}>
                          <Text style={styles.statusText}>
                            {complaint.status?.toUpperCase() || 'PENDING'}
                          </Text>
                        </View>
                      </View>

                      {/* Title */}
                      <Text style={styles.complaintTitle}>{complaint.title}</Text>

                      {/* Category Badge */}
                      <View style={styles.categoryContainer}>
                        <View style={styles.categoryBadge}>
                          <Text style={styles.categoryText}>
                            {complaint.category?.toUpperCase() || 'N/A'}
                          </Text>
                        </View>
                      </View>

                      {/* Location */}
                      {complaint.location_name && (
                        <View style={styles.infoRow}>
                          <Text style={styles.locationIcon}>📍</Text>
                          <Text style={styles.locationText}>{complaint.location_name}</Text>
                        </View>
                      )}

                      {/* Description */}
                      <Text style={styles.descriptionText} numberOfLines={3}>
                        {complaint.description}
                      </Text>

                      {/* Dates */}
                      <View style={styles.dateContainer}>
                        <Text style={styles.dateText}>
                          Created: {formatDateTime(complaint.created_at)}
                        </Text>
                        {complaint.resolved_at && (
                          <Text style={styles.dateText}>
                            Resolved: {formatDateTime(complaint.resolved_at)}
                          </Text>
                        )}
                      </View>

                      {/* Attachments Count */}
                      {complaint.attachments && complaint.attachments.length > 0 && (
                        <View style={styles.attachmentInfo}>
                          <Text style={styles.attachmentText}>
                            📎 {complaint.attachments.length} attachment(s)
                          </Text>
                        </View>
                      )}
                    </View>
                  ))}
                </>
              )}
            </>
          )}

          <View style={styles.bottomSpacing} />
        </ScrollView>
      )}

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
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1F2937',
    marginTop: 24,
    marginBottom: 16,
  },
  applicationCard: {
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
  complaintCard: {
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
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  schemeInfo: {
    flex: 1,
    marginRight: 12,
  },
  ticketInfo: {
    flex: 1,
    marginRight: 12,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  ticketNumber: {
    fontSize: 14,
    fontWeight: '700',
    color: '#6B7280',
    fontFamily: 'monospace',
  },
  priorityBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  priorityText: {
    color: '#fff',
    fontSize: 10,
    fontWeight: 'bold',
  },
  schemeName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1F2937',
    marginBottom: 4,
  },
  complaintTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1F2937',
    marginBottom: 12,
  },
  submittedDate: {
    fontSize: 14,
    color: '#6B7280',
  },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  statusText: {
    color: '#fff',
    fontSize: 11,
    fontWeight: 'bold',
  },
  categoryContainer: {
    marginBottom: 12,
  },
  categoryBadge: {
    backgroundColor: '#E0E7FF',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
    alignSelf: 'flex-start',
  },
  categoryText: {
    color: '#4338CA',
    fontSize: 11,
    fontWeight: '600',
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  locationIcon: {
    fontSize: 14,
    marginRight: 6,
  },
  locationText: {
    fontSize: 14,
    color: '#1F2937',
    flex: 1,
  },
  descriptionText: {
    fontSize: 14,
    color: '#4B5563',
    lineHeight: 20,
    marginBottom: 12,
  },
  dateContainer: {
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
  },
  dateText: {
    fontSize: 12,
    color: '#6B7280',
    marginBottom: 4,
  },
  attachmentInfo: {
    marginTop: 8,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
  },
  attachmentText: {
    fontSize: 12,
    color: '#6B7280',
  },
  remarksContainer: {
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
  },
  remarksLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#6B7280',
    marginBottom: 4,
  },
  remarksText: {
    fontSize: 14,
    color: '#1F2937',
  },
  cardFooter: {
    marginTop: 12,
    alignItems: 'flex-end',
  },
  viewDetails: {
    fontSize: 14,
    color: '#A78BFA',
    fontWeight: '600',
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
    marginTop: 40,
  },
  emptyIcon: {
    fontSize: 64,
    marginBottom: 16,
  },
  emptyText: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1F2937',
    marginBottom: 8,
  },
  emptySubtext: {
    fontSize: 14,
    color: '#6B7280',
    textAlign: 'center',
    marginBottom: 24,
  },
  applyButton: {
    backgroundColor: '#A78BFA',
    borderRadius: 12,
    paddingHorizontal: 24,
    paddingVertical: 12,
  },
  applyButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  bottomSpacing: {
    height: 100,
  },
  tabsContainer: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 4,
    marginBottom: 20,
    marginTop: 20,
  },
  tab: {
    flex: 1,
    paddingVertical: 12,
    alignItems: 'center',
    borderRadius: 8,
  },
  tabActive: {
    backgroundColor: '#A78BFA',
  },
  tabText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#6B7280',
  },
  tabTextActive: {
    color: '#fff',
  },
});