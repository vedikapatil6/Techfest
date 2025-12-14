import React, { useState, useRef, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, StatusBar, ScrollView, TextInput, KeyboardAvoidingView, Platform, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Speech from 'expo-speech';
import BottomNav from './components/BottomNav';
import AppHeader from './components/AppHeader';

const API_URL = process.env.EXPO_PUBLIC_API_URL || 'http://localhost:5000/api';

export default function ChatbotScreen() {
  const router = useRouter();
  const [showLanguageSelection, setShowLanguageSelection] = useState(true);
  const [messages, setMessages] = useState([]);
  const [inputText, setInputText] = useState('');
  const [loading, setLoading] = useState(false);
  const [language, setLanguage] = useState(null);
  const [voiceEnabled, setVoiceEnabled] = useState(true);
  const scrollViewRef = useRef(null);

  useEffect(() => {
    if (language && messages.length === 0) {
      const welcomeMessage = language === 'hi'
        ? 'नमस्ते! मैं नीति निधि सरकारी ऐप के लिए आपकी सहायक हूं। मैं सरकारी योजनाओं और सेवाओं के बारे में जानकारी प्रदान कर सकती हूं। मैं आपकी कैसे मदद कर सकती हूं?'
        : 'Hello! I\'m your assistant for Niti Nidhi. I can help you with information about government schemes and services. How can I assist you today?';
      
      setMessages([{
        id: 1,
        text: welcomeMessage,
        sender: 'bot',
      }]);
      speakText(welcomeMessage);
    }
  }, [language]);

  const selectLanguage = async (selectedLang) => {
    setLanguage(selectedLang);
    setShowLanguageSelection(false);
    await AsyncStorage.setItem('@user_language', selectedLang);
  };

  const speakText = (text) => {
    if (voiceEnabled) {
      Speech.speak(text, {
        language: language === 'hi' ? 'hi-IN' : 'en-US',
        pitch: 1.0,
        rate: 0.9,
      });
    }
  };

  const handleSend = async () => {
    if (!inputText.trim() || !language) return;

    const userMessage = {
      id: Date.now(),
      text: inputText,
      sender: 'user',
    };

    setMessages(prev => [...prev, userMessage]);
    const currentInput = inputText;
    setInputText('');
    setLoading(true);

    try {
      // Try to get token, but don't require it
      const token = await AsyncStorage.getItem('@auth_token');
      
      const headers = {
        'Content-Type': 'application/json',
      };
      
      // Add token if available, but don't fail if missing
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }

      const response = await fetch(`${API_URL}/chatbot/chat`, {
        method: 'POST',
        headers: headers,
        body: JSON.stringify({
          message: currentInput,
          language,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
      }

      const data = await response.json();

      if (data.success && data.response) {
        const botMessage = {
          id: Date.now() + 1,
          text: data.response,
          sender: 'bot',
        };

        setMessages(prev => [...prev, botMessage]);
        
        // Speak the bot's response
        speakText(data.response);
      } else {
        throw new Error(data.message || 'Failed to get response');
      }
    } catch (error) {
      console.error('Chat error:', error);
      const errorMessage = {
        id: Date.now() + 1,
        text: language === 'hi' 
          ? `क्षमा करें, कुछ त्रुटि हुई। कृपया बाद में पुनः प्रयास करें।`
          : `Sorry, an error occurred. Please try again later.`,
        sender: 'bot',
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setLoading(false);
    }
  };

  const toggleLanguage = async () => {
    const newLang = language === 'en' ? 'hi' : 'en';
    setLanguage(newLang);
    await AsyncStorage.setItem('@user_language', newLang);
  };

  const toggleVoice = () => {
    setVoiceEnabled(!voiceEnabled);
    if (voiceEnabled) {
      Speech.stop();
    }
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#1F2937" />
      
      {/* Header */}
      <AppHeader title="Chatbot" />
      
      {/* Language Selection at Top */}
      {language && (
        <View style={styles.headerControls}>
          <TouchableOpacity onPress={toggleLanguage} style={styles.controlButton}>
            <Text style={styles.controlText}>{language === 'en' ? 'हिं' : 'EN'}</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={toggleVoice} style={styles.controlButton}>
            <Text style={styles.controlIcon}>{voiceEnabled ? '🔊' : '🔇'}</Text>
          </TouchableOpacity>
        </View>
      )}

      {showLanguageSelection ? (
        <View style={styles.languageSelectionContainer}>
          <Text style={styles.languageTitle}>Choose Language / भाषा चुनें</Text>
          <TouchableOpacity
            style={styles.languageButton}
            onPress={() => selectLanguage('en')}
          >
            <Text style={styles.languageButtonText}>English</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.languageButton}
            onPress={() => selectLanguage('hi')}
          >
            <Text style={styles.languageButtonText}>हिंदी</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={styles.chatContainer}
          keyboardVerticalOffset={100}
        >
          <ScrollView
            ref={scrollViewRef}
            style={styles.messagesContainer}
            onContentSizeChange={() => scrollViewRef.current?.scrollToEnd({ animated: true })}
          >
            {messages.map((message) => (
              <View
                key={message.id}
                style={[
                  styles.message,
                  message.sender === 'user' ? styles.userMessage : styles.botMessage,
                ]}
              >
                <Text style={[
                  styles.messageText,
                  message.sender === 'user' ? styles.userMessageText : styles.botMessageText,
                ]}>
                  {message.text}
                </Text>
              </View>
            ))}
            {loading && (
              <View style={[styles.message, styles.botMessage]}>
                <ActivityIndicator size="small" color="#A78BFA" />
              </View>
            )}
          </ScrollView>

          <View style={styles.inputContainer}>
            <TextInput
              style={styles.input}
              placeholder={language === 'hi' ? 'अपना प्रश्न टाइप करें...' : 'Type your question...'}
              placeholderTextColor="#9CA3AF"
              value={inputText}
              onChangeText={setInputText}
              multiline
              onSubmitEditing={handleSend}
            />
            <TouchableOpacity
              style={[styles.sendButton, (!inputText.trim() || !language || loading) && styles.sendButtonDisabled]}
              onPress={handleSend}
              disabled={!inputText.trim() || !language || loading}
            >
              <Text style={styles.sendButtonText}>→</Text>
            </TouchableOpacity>
          </View>
        </KeyboardAvoidingView>
      )}

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
  headerControls: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: 12,
    backgroundColor: '#1F2937',
    gap: 12,
  },
  controlButton: {
    width: 40,
    height: 40,
    backgroundColor: '#374151',
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  controlText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: 'bold',
  },
  controlIcon: {
    fontSize: 20,
  },
  chatContainer: {
    flex: 1,
  },
  messagesContainer: {
    flex: 1,
    padding: 20,
  },
  message: {
    maxWidth: '80%',
    padding: 12,
    borderRadius: 16,
    marginBottom: 12,
  },
  userMessage: {
    alignSelf: 'flex-end',
    backgroundColor: '#A78BFA',
  },
  botMessage: {
    alignSelf: 'flex-start',
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  messageText: {
    fontSize: 16,
    lineHeight: 22,
  },
  userMessageText: {
    color: '#fff',
  },
  botMessageText: {
    color: '#1F2937',
  },
  inputContainer: {
    flexDirection: 'row',
    padding: 16,
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
    alignItems: 'flex-end',
  },
  input: {
    flex: 1,
    backgroundColor: '#F3F4F6',
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    color: '#1F2937',
    maxHeight: 100,
    marginRight: 12,
  },
  sendButton: {
    width: 44,
    height: 44,
    backgroundColor: '#A78BFA',
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
  },
  sendButtonDisabled: {
    backgroundColor: '#D1D5DB',
  },
  sendButtonText: {
    color: '#fff',
    fontSize: 20,
    fontWeight: 'bold',
  },
  languageSelectionContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
  },
  languageTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1F2937',
    marginBottom: 40,
    textAlign: 'center',
  },
  languageButton: {
    backgroundColor: '#A78BFA',
    borderRadius: 16,
    paddingVertical: 20,
    paddingHorizontal: 60,
    marginBottom: 20,
    width: '80%',
    alignItems: 'center',
  },
  languageButtonText: {
    color: '#fff',
    fontSize: 20,
    fontWeight: 'bold',
  },
});
