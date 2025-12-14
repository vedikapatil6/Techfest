import { Ionicons } from '@expo/vector-icons';
import axios from 'axios';
import * as Speech from 'expo-speech';
import React, { useEffect, useRef, useState } from 'react';
import {
    ActivityIndicator,
    Alert,
    KeyboardAvoidingView,
    Platform,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from 'react-native';

// Replace with your backend IP address from the server startup logs
const API_BASE_URL = 'http://10.183.248.187:5000/api/chatbot';

const ChatbotScreen = () => {
  const [messages, setMessages] = useState([
    {
      id: '1',
      text: 'Hello! I am your government schemes assistant. How can I help you today?',
      sender: 'bot',
      timestamp: new Date(),
      language: 'en'
    }
  ]);
  const [inputText, setInputText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [language, setLanguage] = useState('en');
  const [isSpeaking, setIsSpeaking] = useState(false);
  const scrollViewRef = useRef(null);

  useEffect(() => {
    // Scroll to bottom when new messages arrive
    scrollViewRef.current?.scrollToEnd({ animated: true });
  }, [messages]);

  useEffect(() => {
    // Update welcome message when language changes
    const welcomeMessages = {
      en: 'Hello! I am your government schemes assistant. How can I help you today?',
      hi: 'नमस्ते! मैं आपका सरकारी योजना सहायक हूं। आज मैं आपकी कैसे मदद कर सकता हूं?'
    };

    setMessages([{
      id: '1',
      text: welcomeMessages[language],
      sender: 'bot',
      timestamp: new Date(),
      language: language
    }]);
  }, [language]);

  const sendMessage = async () => {
    if (!inputText.trim()) return;

    const userMessage = {
      id: Date.now().toString(),
      text: inputText.trim(),
      sender: 'user',
      timestamp: new Date(),
      language: language
    };

    setMessages(prev => [...prev, userMessage]);
    setInputText('');
    setIsLoading(true);

    try {
      // Prepare conversation history for context
      const conversationHistory = messages
        .filter(msg => msg.sender !== 'system')
        .map(msg => ({
          role: msg.sender === 'user' ? 'user' : 'assistant',
          content: msg.text
        }));

      const response = await axios.post(
        `${API_BASE_URL}/chat`,
        {
          message: userMessage.text,
          language: language,
          conversationHistory: conversationHistory
        },
        {
          timeout: 30000,
          headers: {
            'Content-Type': 'application/json'
          }
        }
      );

      if (response.data.success) {
        const botMessage = {
          id: (Date.now() + 1).toString(),
          text: response.data.response,
          sender: 'bot',
          timestamp: new Date(),
          language: language
        };

        setMessages(prev => [...prev, botMessage]);
      } else {
        throw new Error(response.data.message || 'Failed to get response');
      }
    } catch (error) {
      console.error('Chat error:', error);
      
      let errorMessage = language === 'hi' 
        ? 'क्षमा करें, कुछ गलत हो गया। कृपया पुनः प्रयास करें।'
        : 'Sorry, something went wrong. Please try again.';

      if (error.code === 'ECONNABORTED') {
        errorMessage = language === 'hi'
          ? 'कनेक्शन टाइमआउट। कृपया पुनः प्रयास करें।'
          : 'Connection timeout. Please try again.';
      } else if (error.response?.status === 429) {
        errorMessage = language === 'hi'
          ? 'बहुत सारे अनुरोध। कृपया कुछ देर बाद प्रयास करें।'
          : 'Too many requests. Please try again later.';
      } else if (!error.response) {
        errorMessage = language === 'hi'
          ? 'सर्वर से कनेक्ट नहीं हो सका। अपना इंटरनेट कनेक्शन जांचें।'
          : 'Could not connect to server. Check your internet connection.';
      }

      Alert.alert(
        language === 'hi' ? 'त्रुटि' : 'Error',
        errorMessage
      );
    } finally {
      setIsLoading(false);
    }
  };

  const speakText = (text) => {
    if (isSpeaking) {
      Speech.stop();
      setIsSpeaking(false);
      return;
    }

    const languageCode = language === 'hi' ? 'hi-IN' : 'en-US';

    Speech.speak(text, {
      language: languageCode,
      pitch: 1.0,
      rate: 0.9,
      onStart: () => setIsSpeaking(true),
      onDone: () => setIsSpeaking(false),
      onStopped: () => setIsSpeaking(false),
      onError: () => {
        setIsSpeaking(false);
        Alert.alert(
          language === 'hi' ? 'त्रुटि' : 'Error',
          language === 'hi' 
            ? 'ऑडियो चलाने में समस्या हुई।'
            : 'Failed to play audio.'
        );
      }
    });
  };

  const toggleLanguage = () => {
    setLanguage(prev => prev === 'en' ? 'hi' : 'en');
    Speech.stop();
    setIsSpeaking(false);
  };

  const clearChat = () => {
    Alert.alert(
      language === 'hi' ? 'चैट साफ़ करें' : 'Clear Chat',
      language === 'hi' 
        ? 'क्या आप सभी संदेश हटाना चाहते हैं?'
        : 'Do you want to delete all messages?',
      [
        {
          text: language === 'hi' ? 'रद्द करें' : 'Cancel',
          style: 'cancel'
        },
        {
          text: language === 'hi' ? 'हटाएं' : 'Delete',
          onPress: () => {
            const welcomeMessages = {
              en: 'Hello! I am your government schemes assistant. How can I help you today?',
              hi: 'नमस्ते! मैं आपका सरकारी योजना सहायक हूं। आज मैं आपकी कैसे मदद कर सकता हूं?'
            };

            setMessages([{
              id: '1',
              text: welcomeMessages[language],
              sender: 'bot',
              timestamp: new Date(),
              language: language
            }]);
            Speech.stop();
            setIsSpeaking(false);
          },
          style: 'destructive'
        }
      ]
    );
  };

  const formatTime = (date) => {
    return date.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}
    >
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <Ionicons name="chatbubbles" size={24} color="#fff" />
          <Text style={styles.headerTitle}>
            {language === 'hi' ? 'सरकारी योजना सहायक' : 'Scheme Assistant'}
          </Text>
        </View>
        <View style={styles.headerRight}>
          <TouchableOpacity
            style={styles.headerButton}
            onPress={toggleLanguage}
          >
            <Text style={styles.languageText}>
              {language === 'en' ? 'अ' : 'A'}
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.headerButton}
            onPress={clearChat}
          >
            <Ionicons name="trash-outline" size={20} color="#fff" />
          </TouchableOpacity>
        </View>
      </View>

      {/* Messages */}
      <ScrollView
        ref={scrollViewRef}
        style={styles.messagesContainer}
        contentContainerStyle={styles.messagesContent}
        onContentSizeChange={() => scrollViewRef.current?.scrollToEnd({ animated: true })}
      >
        {messages.map((message) => (
          <View
            key={message.id}
            style={[
              styles.messageWrapper,
              message.sender === 'user' ? styles.userMessageWrapper : styles.botMessageWrapper
            ]}
          >
            <View
              style={[
                styles.messageBubble,
                message.sender === 'user' ? styles.userMessage : styles.botMessage
              ]}
            >
              <Text
                style={[
                  styles.messageText,
                  message.sender === 'user' ? styles.userMessageText : styles.botMessageText
                ]}
              >
                {message.text}
              </Text>
              <Text
                style={[
                  styles.timestamp,
                  message.sender === 'user' ? styles.userTimestamp : styles.botTimestamp
                ]}
              >
                {formatTime(message.timestamp)}
              </Text>
            </View>
            {message.sender === 'bot' && (
              <TouchableOpacity
                style={styles.speakerButton}
                onPress={() => speakText(message.text)}
              >
                <Ionicons
                  name={isSpeaking ? "volume-high" : "volume-medium-outline"}
                  size={20}
                  color="#6366f1"
                />
              </TouchableOpacity>
            )}
          </View>
        ))}
        {isLoading && (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="small" color="#6366f1" />
            <Text style={styles.loadingText}>
              {language === 'hi' ? 'टाइप कर रहा है...' : 'Typing...'}
            </Text>
          </View>
        )}
      </ScrollView>

      {/* Input */}
      <View style={styles.inputContainer}>
        <TextInput
          style={styles.input}
          value={inputText}
          onChangeText={setInputText}
          placeholder={
            language === 'hi'
              ? 'अपना प्रश्न लिखें...'
              : 'Type your question...'
          }
          placeholderTextColor="#9ca3af"
          multiline
          maxLength={500}
          editable={!isLoading}
        />
        <TouchableOpacity
          style={[
            styles.sendButton,
            (!inputText.trim() || isLoading) && styles.sendButtonDisabled
          ]}
          onPress={sendMessage}
          disabled={!inputText.trim() || isLoading}
        >
          {isLoading ? (
            <ActivityIndicator size="small" color="#fff" />
          ) : (
            <Ionicons name="send" size={20} color="#fff" />
          )}
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f9fafb',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#6366f1',
    paddingHorizontal: 16,
    paddingVertical: 12,
    paddingTop: Platform.OS === 'ios' ? 50 : 12,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#fff',
  },
  headerRight: {
    flexDirection: 'row',
    gap: 12,
  },
  headerButton: {
    padding: 6,
  },
  languageText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#fff',
  },
  messagesContainer: {
    flex: 1,
  },
  messagesContent: {
    padding: 16,
    paddingBottom: 8,
  },
  messageWrapper: {
    marginBottom: 16,
    flexDirection: 'row',
    alignItems: 'flex-end',
  },
  userMessageWrapper: {
    justifyContent: 'flex-end',
  },
  botMessageWrapper: {
    justifyContent: 'flex-start',
  },
  messageBubble: {
    maxWidth: '80%',
    padding: 12,
    borderRadius: 16,
  },
  userMessage: {
    backgroundColor: '#6366f1',
    borderBottomRightRadius: 4,
  },
  botMessage: {
    backgroundColor: '#fff',
    borderBottomLeftRadius: 4,
    elevation: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
  },
  messageText: {
    fontSize: 15,
    lineHeight: 20,
  },
  userMessageText: {
    color: '#fff',
  },
  botMessageText: {
    color: '#1f2937',
  },
  timestamp: {
    fontSize: 11,
    marginTop: 4,
  },
  userTimestamp: {
    color: '#e0e7ff',
    textAlign: 'right',
  },
  botTimestamp: {
    color: '#9ca3af',
  },
  speakerButton: {
    marginLeft: 8,
    padding: 8,
  },
  loadingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    padding: 12,
    borderRadius: 16,
    maxWidth: '80%',
    elevation: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
  },
  loadingText: {
    marginLeft: 8,
    fontSize: 14,
    color: '#6b7280',
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    backgroundColor: '#fff',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderTopWidth: 1,
    borderTopColor: '#e5e7eb',
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  input: {
    flex: 1,
    backgroundColor: '#f3f4f6',
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 10,
    paddingTop: 10,
    fontSize: 15,
    maxHeight: 100,
    color: '#1f2937',
  },
  sendButton: {
    backgroundColor: '#6366f1',
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 8,
  },
  sendButtonDisabled: {
    backgroundColor: '#c7d2fe',
  },
});

export default ChatbotScreen;