import AsyncStorage from '@react-native-async-storage/async-storage';
import * as DocumentPicker from 'expo-document-picker';
import * as FileSystem from 'expo-file-system/legacy';
import { useRouter } from 'expo-router';
import * as Sharing from 'expo-sharing';
import React, { useEffect, useState } from 'react';
import { Alert, Modal, ScrollView, StatusBar, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import AppHeader from './components/AppHeader';
import BottomNav from './components/BottomNav';

const DocumentItem = ({ fileName, timestamp, onPress, onDelete }) => (
  <TouchableOpacity style={styles.documentItem} onPress={onPress}>
    <View style={styles.pdfIcon}>
      <Text style={styles.pdfText}>PDF</Text>
    </View>
    <View style={styles.documentInfo}>
      <Text style={styles.timestamp}>{timestamp}</Text>
      <Text style={styles.documentName}>{fileName}</Text>
    </View>
    <TouchableOpacity 
      style={styles.deleteButton}
      onPress={(e) => {
        e.stopPropagation();
        onDelete();
      }}
    >
      <Text style={styles.deleteIcon}>🗑️</Text>
    </TouchableOpacity>
  </TouchableOpacity>
);

const STORAGE_KEY = '@documents_list';

export default function DocumentsScreen() {
  const router = useRouter();
  const [documents, setDocuments] = useState([]);
  
  const [modalVisible, setModalVisible] = useState(false);
  const [fileName, setFileName] = useState('');
  const [selectedFile, setSelectedFile] = useState(null);

  // Load documents from AsyncStorage on mount
  useEffect(() => {
    loadDocuments();
  }, []);

  const loadDocuments = async () => {
    try {
      const stored = await AsyncStorage.getItem(STORAGE_KEY);
      if (stored) {
        const savedDocs = JSON.parse(stored);
        setDocuments(savedDocs);
      }
    } catch (error) {
      console.log('Error loading documents:', error);
    }
  };

  const saveDocuments = async (docs) => {
    try {
      const docsToSave = docs.filter(d => d.uri !== null);
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(docsToSave));
    } catch (error) {
      console.log('Error saving documents:', error);
    }
  };

  const pickDocument = async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: ['application/pdf', 'image/*'],
        copyToCacheDirectory: true,
        multiple: false,
      });

      console.log('Document picker result:', result);

      if (!result.canceled && result.assets && result.assets.length > 0) {
        const file = result.assets[0];
        console.log('Selected file:', file);
        setSelectedFile(file);
        setModalVisible(true);
      } else {
        console.log('Document selection canceled');
      }
    } catch (error) {
      console.log('Error picking document:', error);
      Alert.alert('Error', `Failed to pick document: ${error.message}`);
    }
  };

  const handleUpload = async () => {
    if (!fileName.trim()) {
      Alert.alert('Error', 'Please enter a file name');
      return;
    }

    if (!selectedFile) {
      Alert.alert('Error', 'Please select a file first');
      return;
    }

    try {
      console.log('Starting upload process...');
      console.log('Selected file URI:', selectedFile.uri);
      
      // Get file info
      const fileInfo = await FileSystem.getInfoAsync(selectedFile.uri);
      console.log('File info:', fileInfo);

      if (!fileInfo.exists) {
        throw new Error('Selected file does not exist');
      }

      // Create documents directory
      const docDir = `${FileSystem.documentDirectory}documents/`;
      console.log('Document directory:', docDir);
      
      const dirInfo = await FileSystem.getInfoAsync(docDir);
      
      if (!dirInfo.exists) {
        console.log('Creating directory...');
        await FileSystem.makeDirectoryAsync(docDir, { intermediates: true });
      }

      // Generate new filename
      const timestamp = Date.now();
      const fileExtension = selectedFile.name.split('.').pop() || 'pdf';
      const sanitizedFileName = fileName.replace(/[^a-zA-Z0-9]/g, '_');
      const newFileName = `${timestamp}_${sanitizedFileName}.${fileExtension}`;
      const newUri = `${docDir}${newFileName}`;
      
      console.log('Copying file to:', newUri);

      // Copy file
      await FileSystem.copyAsync({
        from: selectedFile.uri,
        to: newUri,
      });

      console.log('File copied successfully');

      // Verify the copy
      const copiedFileInfo = await FileSystem.getInfoAsync(newUri);
      console.log('Copied file info:', copiedFileInfo);

      if (!copiedFileInfo.exists) {
        throw new Error('File copy verification failed');
      }

      // Create document entry
      const newDoc = {
        id: timestamp,
        name: fileName,
        timestamp: 'Just now',
        uri: newUri,
        originalName: selectedFile.name,
        size: selectedFile.size,
        mimeType: selectedFile.mimeType,
      };

      // Update state
      const updatedDocs = [newDoc, ...documents];
      setDocuments(updatedDocs);
      
      // Save to AsyncStorage
      await saveDocuments(updatedDocs);

      // Reset and close
      setFileName('');
      setSelectedFile(null);
      setModalVisible(false);
      
      Alert.alert('Success', 'Document uploaded successfully!');
      console.log('Upload complete');
    } catch (error) {
      console.error('Upload error:', error);
      Alert.alert('Error', `Failed to upload: ${error.message}`);
    }
  };

  const openDocument = async (doc) => {
    if (!doc.uri) {
      Alert.alert('Info', 'This is a sample document. Upload a real document to view it.');
      return;
    }

    try {
      console.log('Opening document:', doc.uri);
      
      const fileInfo = await FileSystem.getInfoAsync(doc.uri);
      console.log('File info:', fileInfo);
      
      if (!fileInfo.exists) {
        Alert.alert('Error', 'Document not found. It may have been deleted.');
        return;
      }

      const canShare = await Sharing.isAvailableAsync();
      
      if (canShare) {
        await Sharing.shareAsync(doc.uri, {
          mimeType: doc.mimeType || 'application/pdf',
          dialogTitle: `Open ${doc.name}`,
          UTI: doc.mimeType || 'application/pdf',
        });
      } else {
        Alert.alert('Info', 'Opening documents is not available on this device');
      }
    } catch (error) {
      console.error('Error opening document:', error);
      Alert.alert('Error', `Failed to open document: ${error.message}`);
    }
  };

  const confirmDeleteDocument = (doc) => {
    Alert.alert(
      'Delete Document',
      `Are you sure you want to delete "${doc.name}"?`,
      [
        {
          text: 'Cancel',
          style: 'cancel'
        },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => deleteDocument(doc.id)
        }
      ]
    );
  };

  const deleteDocument = async (docId) => {
    const doc = documents.find(d => d.id === docId);
    if (!doc) return;

    try {
      // Delete the physical file if it exists
      if (doc.uri) {
        const fileInfo = await FileSystem.getInfoAsync(doc.uri);
        if (fileInfo.exists) {
          await FileSystem.deleteAsync(doc.uri, { idempotent: true });
          console.log('File deleted:', doc.uri);
        }
      }
      
      // Remove from state and storage
      const updatedDocs = documents.filter(d => d.id !== docId);
      setDocuments(updatedDocs);
      await saveDocuments(updatedDocs);
      
      Alert.alert('Success', 'Document deleted successfully');
    } catch (error) {
      console.log('Error deleting document:', error);
      Alert.alert('Error', 'Failed to delete document');
    }
  };

  const navigateToVerifiedDocuments = () => {
    // Navigate to verified documents screen
    router.push('/verified-documents');
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#1F2937" />
      
      {/* Header */}
      <AppHeader title="My Documents" />

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* My Verified Documents Button */}
        <TouchableOpacity 
          style={styles.verifiedButton}
          onPress={navigateToVerifiedDocuments}
        >
          <View style={styles.verifiedButtonContent}>
            <View style={styles.verifiedIconContainer}>
              <Text style={styles.verifiedIcon}>✓</Text>
            </View>
            <Text style={styles.verifiedButtonText}>My Verified Documents</Text>
          </View>
          <Text style={styles.verifiedArrow}>→</Text>
        </TouchableOpacity>

        {/* Documents List */}
        <View style={styles.documentsContainer}>
          <Text style={styles.sectionTitle}>Your Documents</Text>
          
          <View style={styles.documentsList}>
            {documents.length > 0 ? (
              documents.map((doc) => (
                <DocumentItem
                  key={doc.id}
                  fileName={doc.name}
                  timestamp={doc.timestamp}
                  onPress={() => openDocument(doc)}
                  onDelete={() => confirmDeleteDocument(doc)}
                />
              ))
            ) : (
              <View style={styles.emptyState}>
                <Text style={styles.emptyStateText}>No documents uploaded yet</Text>
                <Text style={styles.emptyStateSubtext}>Upload your first document to get started</Text>
              </View>
            )}
          </View>
        </View>

        {/* Upload Button */}
        <TouchableOpacity 
          style={styles.uploadButton}
          onPress={pickDocument}
        >
          <Text style={styles.uploadButtonText}>Upload Document</Text>
        </TouchableOpacity>

        <View style={styles.bottomSpacing} />
      </ScrollView>

      {/* Upload Modal */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Documents</Text>
              <View style={styles.headerIcons}>
                <TouchableOpacity style={styles.headerIcon}>
                  <Text style={styles.headerIconText}>💬</Text>
                </TouchableOpacity>
                <TouchableOpacity style={[styles.headerIcon, { backgroundColor: '#BFDBFE' }]}>
                  <Text style={styles.headerIconText}>🔔</Text>
                </TouchableOpacity>
                <TouchableOpacity style={[styles.headerIcon, { backgroundColor: '#93C5FD' }]}>
                  <Text style={styles.headerIconText}>👤</Text>
                </TouchableOpacity>
              </View>
            </View>

            <ScrollView style={styles.modalBody} showsVerticalScrollIndicator={false}>
              <Text style={styles.inputLabel}>File Name</Text>
              <TextInput
                style={styles.input}
                placeholder="Enter file name"
                value={fileName}
                onChangeText={setFileName}
                autoCapitalize="words"
              />

              <Text style={styles.inputLabel}>Upload</Text>
              <TouchableOpacity 
                style={styles.uploadArea}
                onPress={pickDocument}
              >
                <View style={styles.uploadIcon}>
                  <Text style={styles.uploadIconText}>📄</Text>
                  <Text style={styles.uploadIconArrow}>↑</Text>
                </View>
                {selectedFile && (
                  <Text style={styles.selectedFileName}>{selectedFile.name}</Text>
                )}
                {!selectedFile && (
                  <Text style={styles.uploadHint}>Tap to select a file</Text>
                )}
              </TouchableOpacity>

              <TouchableOpacity 
                style={[
                  styles.modalUploadButton,
                  (!fileName.trim() || !selectedFile) && styles.disabledButton
                ]}
                onPress={handleUpload}
                disabled={!fileName.trim() || !selectedFile}
              >
                <Text style={styles.modalUploadButtonText}>Upload Document</Text>
              </TouchableOpacity>

              <TouchableOpacity 
                style={styles.cancelButton}
                onPress={() => {
                  setModalVisible(false);
                  setFileName('');
                  setSelectedFile(null);
                }}
              >
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>
            </ScrollView>
          </View>
        </View>
      </Modal>

      {/* Bottom Navigation */}
      <BottomNav />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
  },
  verifiedButton: {
    backgroundColor: '#10B981',
    borderRadius: 16,
    padding: 20,
    marginTop: 24,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  verifiedButtonContent: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  verifiedIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  verifiedIcon: {
    fontSize: 24,
    color: '#10B981',
    fontWeight: 'bold',
  },
  verifiedButtonText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#fff',
  },
  verifiedArrow: {
    fontSize: 24,
    color: '#fff',
    fontWeight: 'bold',
  },
  documentsContainer: {
    backgroundColor: '#E5E7EB',
    borderRadius: 16,
    padding: 20,
    marginTop: 24,
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1F2937',
    marginBottom: 20,
  },
  documentsList: {
    gap: 16,
  },
  documentItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 12,
  },
  pdfIcon: {
    width: 48,
    height: 56,
    backgroundColor: '#F3F4F6',
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
    borderWidth: 2,
    borderColor: '#D1D5DB',
  },
  pdfText: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#6B7280',
  },
  documentInfo: {
    flex: 1,
  },
  timestamp: {
    fontSize: 12,
    color: '#6B7280',
    marginBottom: 4,
  },
  documentName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1F2937',
  },
  deleteButton: {
    padding: 8,
    marginLeft: 8,
  },
  deleteIcon: {
    fontSize: 20,
  },
  emptyState: {
    alignItems: 'center',
    padding: 32,
  },
  emptyStateText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#6B7280',
    marginBottom: 8,
  },
  emptyStateSubtext: {
    fontSize: 14,
    color: '#9CA3AF',
    textAlign: 'center',
  },
  uploadButton: {
    backgroundColor: '#A78BFA',
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
    marginBottom: 24,
  },
  uploadButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    maxHeight: '85%',
  },
  modalHeader: {
    backgroundColor: '#1F2937',
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 16,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  modalTitle: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
    flex: 1,
  },
  headerIcons: {
    flexDirection: 'row',
    gap: 8,
  },
  headerIcon: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#E0E7FF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerIconText: {
    fontSize: 16,
  },
  modalBody: {
    padding: 20,
  },
  inputLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 8,
    marginTop: 16,
  },
  input: {
    backgroundColor: '#F3F4F6',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 16,
    color: '#1F2937',
  },
  uploadArea: {
    backgroundColor: '#F3F4F6',
    borderRadius: 12,
    padding: 40,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 200,
    borderWidth: 2,
    borderColor: '#D1D5DB',
    borderStyle: 'dashed',
  },
  uploadIcon: {
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  uploadIconText: {
    fontSize: 64,
    marginBottom: 8,
  },
  uploadIconArrow: {
    fontSize: 32,
    position: 'absolute',
    bottom: 10,
    right: -5,
  },
  selectedFileName: {
    marginTop: 16,
    fontSize: 14,
    color: '#1F2937',
    textAlign: 'center',
    fontWeight: '600',
  },
  uploadHint: {
    marginTop: 16,
    fontSize: 14,
    color: '#9CA3AF',
    textAlign: 'center',
  },
  modalUploadButton: {
    backgroundColor: '#A78BFA',
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
    marginTop: 24,
  },
  disabledButton: {
    backgroundColor: '#D1D5DB',
  },
  modalUploadButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  cancelButton: {
    paddingVertical: 16,
    alignItems: 'center',
    marginTop: 12,
    marginBottom: 20,
  },
  cancelButtonText: {
    color: '#6B7280',
    fontSize: 16,
    fontWeight: '600',
  },
  bottomSpacing: {
    height: 100,
  },
});