import { Ionicons } from '@expo/vector-icons';
import * as Speech from 'expo-speech';
import React, { useEffect, useRef, useState } from 'react';
import {
    ActivityIndicator,
    KeyboardAvoidingView,
    Platform,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from 'react-native';
import AppHeader from './components/AppHeader';
import BottomNav from './components/BottomNav';

// Simulated responses for demo
const simulatedResponses = {
  en: {
    'latest schemes': {
      text: 'Here are the latest government schemes available:\n\n1. **Ayushman Bharat** - Health insurance for poor families (up to ₹5 lakh coverage)\n2. **Pradhan Mantri Jan Arogya Yojana** - Free health insurance for economically weaker sections\n3. **National Health Mission** - Healthcare services in rural areas\n4. **Pradhan Mantri Awas Yojana** - Affordable housing scheme\n5. **Pradhan Mantri Kisan Samman Nidhi** - Income support of ₹6,000 per year for farmers\n\nWould you like to know more about any specific scheme?',
      audio: 'Here are the latest government schemes available. Ayushman Bharat provides health insurance for poor families. Pradhan Mantri Jan Arogya Yojana offers free health insurance. National Health Mission provides healthcare in rural areas. Pradhan Mantri Awas Yojana is for affordable housing. And Pradhan Mantri Kisan Samman Nidhi provides income support for farmers.',
    },
    'ayushman bharat': {
      text: '**Ayushman Bharat** - Health Insurance Scheme\n\n**Benefits:**\n• Health coverage up to ₹5 lakh per family per year\n• Cashless treatment at empaneled hospitals\n• Coverage for secondary and tertiary hospitalization\n• No premium payment required\n\n**Requirements:**\n• Family income less than ₹30,000 per month\n• Below poverty line\n• Valid Aadhar Card\n• Ration card or income certificate\n\n**Documents Needed:**\n• Aadhar Card\n• Ration Card\n• Income Certificate\n• Family Photo\n• Bank Account Details\n\nYou can apply for this scheme through the app!',
      audio: 'Ayushman Bharat is a health insurance scheme. It provides health coverage up to 5 lakh rupees per family per year. You get cashless treatment at hospitals. Your family income should be less than 30,000 rupees per month. You need Aadhar card, ration card, and income certificate to apply.',
    },
    'pradhan mantri jan arogya yojana': {
      text: '**Pradhan Mantri Jan Arogya Yojana** - Free Health Insurance\n\n**Benefits:**\n• Free health insurance coverage\n• Up to ₹5 lakh per family per year\n• Cashless treatment\n• Coverage for 1,400+ medical procedures\n\n**Requirements:**\n• Economically weaker sections\n• Family income less than ₹30,000 per month\n• Valid Aadhar Card\n\n**Documents Needed:**\n• Aadhar Card\n• Ration Card\n• Income Certificate\n• Family Photo\n\nApply now to get free health insurance!',
      audio: 'Pradhan Mantri Jan Arogya Yojana provides free health insurance. You get coverage up to 5 lakh rupees per family. Treatment is cashless at hospitals. You need to be from economically weaker sections with income less than 30,000 rupees per month.',
    },
    'national health mission': {
      text: '**National Health Mission** - Rural Healthcare\n\n**Benefits:**\n• Free healthcare services in rural areas\n• Maternal and child health services\n• Immunization programs\n• Access to primary healthcare centers\n\n**Requirements:**\n• Rural residents\n• All citizens eligible\n• Valid Aadhar Card\n\n**Documents Needed:**\n• Aadhar Card\n• Address Proof\n\nThis scheme ensures healthcare access for everyone in rural areas!',
      audio: 'National Health Mission provides free healthcare in rural areas. You get maternal and child health services, immunization programs, and access to health centers. All rural residents are eligible. You just need Aadhar card and address proof.',
    },
    'pradhan mantri awas yojana': {
      text: '**Pradhan Mantri Awas Yojana (PMAY)** - Housing Scheme\n\n**Benefits:**\n• Financial assistance up to ₹2.5 lakh\n• Interest subsidy on home loans\n• Affordable housing in urban and rural areas\n\n**Requirements:**\n• Age: 18 years and above\n• Income: Less than ₹50,000 per month\n• No existing pucca house\n• Valid Aadhar Card\n\n**Documents Needed:**\n• Aadhar Card\n• PAN Card\n• Income Certificate\n• Bank Account Details\n• Passport Size Photo\n• Address Proof\n\nGet your own house with government support!',
      audio: 'Pradhan Mantri Awas Yojana helps you get affordable housing. You can get financial assistance up to 2.5 lakh rupees and interest subsidy on loans. You need to be 18 years or above with income less than 50,000 rupees per month. You should not have an existing pucca house.',
    },
    'pradhan mantri kisan samman nidhi': {
      text: '**Pradhan Mantri Kisan Samman Nidhi (PM-KISAN)** - Farmer Support\n\n**Benefits:**\n• ₹6,000 per year in 3 installments\n• Direct benefit transfer to bank account\n• No middlemen involved\n\n**Requirements:**\n• Must be a farmer\n• Land ownership documents\n• Valid Aadhar Card\n• Bank account details\n\n**Documents Needed:**\n• Aadhar Card\n• Land Ownership Documents\n• Bank Account Details\n• Passport Size Photo\n\nSupport for our farmers!',
      audio: 'Pradhan Mantri Kisan Samman Nidhi provides 6,000 rupees per year to farmers in three installments. Money is directly transferred to your bank account. You need to be a farmer with land ownership documents and Aadhar card.',
    },
    default: {
      text: 'I can help you with information about government schemes. You can ask me about:\n\n• Latest schemes\n• Specific scheme details (like Ayushman Bharat, PM Awas Yojana, etc.)\n• Scheme benefits and requirements\n• Application process\n\nWhat would you like to know?',
      audio: 'I can help you with information about government schemes. You can ask me about latest schemes, specific scheme details, benefits, requirements, or the application process. What would you like to know?',
    },
  },
  hi: {
    'latest schemes': {
      text: 'यहाँ नवीनतम सरकारी योजनाएं उपलब्ध हैं:\n\n1. **आयुष्मान भारत** - गरीब परिवारों के लिए स्वास्थ्य बीमा (₹5 लाख तक कवरेज)\n2. **प्रधानमंत्री जन आरोग्य योजना** - आर्थिक रूप से कमजोर वर्गों के लिए मुफ्त स्वास्थ्य बीमा\n3. **राष्ट्रीय स्वास्थ्य मिशन** - ग्रामीण क्षेत्रों में स्वास्थ्य सेवाएं\n4. **प्रधानमंत्री आवास योजना** - सस्ती आवास योजना\n5. **प्रधानमंत्री किसान सम्मान निधि** - किसानों के लिए प्रति वर्ष ₹6,000 की आय सहायता\n\nक्या आप किसी विशिष्ट योजना के बारे में अधिक जानना चाहेंगे?',
      audio: 'यहाँ नवीनतम सरकारी योजनाएं हैं। आयुष्मान भारत गरीब परिवारों के लिए स्वास्थ्य बीमा प्रदान करता है। प्रधानमंत्री जन आरोग्य योजना मुफ्त स्वास्थ्य बीमा प्रदान करती है। राष्ट्रीय स्वास्थ्य मिशन ग्रामीण क्षेत्रों में स्वास्थ्य सेवाएं प्रदान करता है।',
    },
    'ayushman bharat': {
      text: '**आयुष्मान भारत** - स्वास्थ्य बीमा योजना\n\n**लाभ:**\n• प्रति परिवार प्रति वर्ष ₹5 लाख तक स्वास्थ्य कवरेज\n• अस्पतालों में नकद रहित उपचार\n• द्वितीयक और तृतीयक अस्पताल में भर्ती के लिए कवरेज\n• कोई प्रीमियम भुगतान आवश्यक नहीं\n\n**आवश्यकताएं:**\n• परिवार की आय ₹30,000 प्रति माह से कम\n• गरीबी रेखा से नीचे\n• वैध आधार कार्ड\n• राशन कार्ड या आय प्रमाणपत्र\n\n**आवश्यक दस्तावेज:**\n• आधार कार्ड\n• राशन कार्ड\n• आय प्रमाणपत्र\n• परिवार की फोटो\n• बैंक खाता विवरण\n\nआप ऐप के माध्यम से इस योजना के लिए आवेदन कर सकते हैं!',
      audio: 'आयुष्मान भारत एक स्वास्थ्य बीमा योजना है। यह प्रति परिवार प्रति वर्ष 5 लाख रुपये तक स्वास्थ्य कवरेज प्रदान करता है। आपको अस्पतालों में नकद रहित उपचार मिलता है। आपके परिवार की आय 30,000 रुपये प्रति माह से कम होनी चाहिए। आवेदन के लिए आधार कार्ड, राशन कार्ड और आय प्रमाणपत्र की आवश्यकता है।',
    },
    'pradhan mantri jan arogya yojana': {
      text: '**प्रधानमंत्री जन आरोग्य योजना** - मुफ्त स्वास्थ्य बीमा\n\n**लाभ:**\n• मुफ्त स्वास्थ्य बीमा कवरेज\n• प्रति परिवार प्रति वर्ष ₹5 लाख तक\n• नकद रहित उपचार\n• 1,400 से अधिक चिकित्सा प्रक्रियाओं के लिए कवरेज\n\n**आवश्यकताएं:**\n• आर्थिक रूप से कमजोर वर्ग\n• परिवार की आय ₹30,000 प्रति माह से कम\n• वैध आधार कार्ड\n\n**आवश्यक दस्तावेज:**\n• आधार कार्ड\n• राशन कार्ड\n• आय प्रमाणपत्र\n• परिवार की फोटो\n\nमुफ्त स्वास्थ्य बीमा पाने के लिए अभी आवेदन करें!',
      audio: 'प्रधानमंत्री जन आरोग्य योजना मुफ्त स्वास्थ्य बीमा प्रदान करती है। आपको प्रति परिवार 5 लाख रुपये तक कवरेज मिलता है। अस्पतालों में उपचार नकद रहित है। आपको आर्थिक रूप से कमजोर वर्ग से होना चाहिए और आय 30,000 रुपये प्रति माह से कम होनी चाहिए।',
    },
    'national health mission': {
      text: '**राष्ट्रीय स्वास्थ्य मिशन** - ग्रामीण स्वास्थ्य सेवा\n\n**लाभ:**\n• ग्रामीण क्षेत्रों में मुफ्त स्वास्थ्य सेवाएं\n• मातृ और बाल स्वास्थ्य सेवाएं\n• टीकाकरण कार्यक्रम\n• प्राथमिक स्वास्थ्य केंद्रों तक पहुंच\n\n**आवश्यकताएं:**\n• ग्रामीण निवासी\n• सभी नागरिक पात्र\n• वैध आधार कार्ड\n\n**आवश्यक दस्तावेज:**\n• आधार कार्ड\n• पता प्रमाण\n\nयह योजना ग्रामीण क्षेत्रों में सभी के लिए स्वास्थ्य सेवा सुनिश्चित करती है!',
      audio: 'राष्ट्रीय स्वास्थ्य मिशन ग्रामीण क्षेत्रों में मुफ्त स्वास्थ्य सेवाएं प्रदान करता है। आपको मातृ और बाल स्वास्थ्य सेवाएं, टीकाकरण कार्यक्रम और स्वास्थ्य केंद्रों तक पहुंच मिलती है। सभी ग्रामीण निवासी पात्र हैं। आपको बस आधार कार्ड और पता प्रमाण की आवश्यकता है।',
    },
    'pradhan mantri awas yojana': {
      text: '**प्रधानमंत्री आवास योजना (PMAY)** - आवास योजना\n\n**लाभ:**\n• ₹2.5 लाख तक वित्तीय सहायता\n• गृह ऋण पर ब्याज सब्सिडी\n• शहरी और ग्रामीण क्षेत्रों में सस्ती आवास\n\n**आवश्यकताएं:**\n• आयु: 18 वर्ष और उससे अधिक\n• आय: प्रति माह ₹50,000 से कम\n• कोई मौजूदा पक्का घर नहीं\n• वैध आधार कार्ड\n\n**आवश्यक दस्तावेज:**\n• आधार कार्ड\n• पैन कार्ड\n• आय प्रमाणपत्र\n• बैंक खाता विवरण\n• पासपोर्ट साइज फोटो\n• पता प्रमाण\n\nसरकारी सहायता के साथ अपना घर प्राप्त करें!',
      audio: 'प्रधानमंत्री आवास योजना आपको सस्ती आवास प्राप्त करने में मदद करती है। आप 2.5 लाख रुपये तक वित्तीय सहायता और ऋण पर ब्याज सब्सिडी प्राप्त कर सकते हैं। आपको 18 वर्ष या उससे अधिक होना चाहिए और आय 50,000 रुपये प्रति माह से कम होनी चाहिए। आपके पास मौजूदा पक्का घर नहीं होना चाहिए।',
    },
    'pradhan mantri kisan samman nidhi': {
      text: '**प्रधानमंत्री किसान सम्मान निधि (PM-KISAN)** - किसान सहायता\n\n**लाभ:**\n• 3 किस्तों में प्रति वर्ष ₹6,000\n• बैंक खाते में प्रत्यक्ष लाभ हस्तांतरण\n• कोई बिचौलिए शामिल नहीं\n\n**आवश्यकताएं:**\n• किसान होना चाहिए\n• भूमि स्वामित्व दस्तावेज\n• वैध आधार कार्ड\n• बैंक खाता विवरण\n\n**आवश्यक दस्तावेज:**\n• आधार कार्ड\n• भूमि स्वामित्व दस्तावेज\n• बैंक खाता विवरण\n• पासपोर्ट साइज फोटो\n\nहमारे किसानों के लिए सहायता!',
      audio: 'प्रधानमंत्री किसान सम्मान निधि किसानों को तीन किस्तों में प्रति वर्ष 6,000 रुपये प्रदान करती है। पैसा सीधे आपके बैंक खाते में स्थानांतरित किया जाता है। आपको किसान होना चाहिए और भूमि स्वामित्व दस्तावेज और आधार कार्ड की आवश्यकता है।',
    },
    default: {
      text: 'मैं सरकारी योजनाओं के बारे में जानकारी में आपकी मदद कर सकता हूं। आप मुझसे पूछ सकते हैं:\n\n• नवीनतम योजनाएं\n• विशिष्ट योजना विवरण\n• योजना लाभ और आवश्यकताएं\n• आवेदन प्रक्रिया\n\nआप क्या जानना चाहेंगे?',
      audio: 'मैं सरकारी योजनाओं के बारे में जानकारी में आपकी मदद कर सकता हूं। आप मुझसे नवीनतम योजनाओं, विशिष्ट योजना विवरण, लाभ, आवश्यकताओं या आवेदन प्रक्रिया के बारे में पूछ सकते हैं। आप क्या जानना चाहेंगे?',
    },
  },
};

export default function ChatbotScreen() {
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
    scrollViewRef.current?.scrollToEnd({ animated: true });
  }, [messages]);

  useEffect(() => {
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

  const getResponse = (userInput) => {
    const input = userInput.toLowerCase().trim();
    const responses = simulatedResponses[language];
    
    if (input.includes('latest') || input.includes('new') || input.includes('schemes')) {
      return responses['latest schemes'];
    } else if (input.includes('ayushman bharat') || input.includes('ayushman')) {
      return responses['ayushman bharat'];
    } else if (input.includes('jan arogya') || input.includes('arogya')) {
      return responses['pradhan mantri jan arogya yojana'] || responses.default;
    } else if (input.includes('health mission') || input.includes('national health')) {
      return responses['national health mission'] || responses.default;
    } else if (input.includes('awas') || input.includes('housing') || input.includes('pmay')) {
      return responses['pradhan mantri awas yojana'] || responses.default;
    } else if (input.includes('kisan') || input.includes('farmer') || input.includes('pm-kisan')) {
      return responses['pradhan mantri kisan samman nidhi'] || responses.default;
    }
    
    return responses.default;
  };

  const sendMessage = () => {
    if (!inputText.trim()) return;

    const userMessage = {
      id: Date.now().toString(),
      text: inputText.trim(),
      sender: 'user',
      timestamp: new Date(),
      language: language
    };

    setMessages(prev => [...prev, userMessage]);
    const currentInput = inputText.trim();
    setInputText('');
    setIsLoading(true);

    // Simulate API delay
    setTimeout(() => {
      const response = getResponse(currentInput);
      
      const botMessage = {
        id: (Date.now() + 1).toString(),
        text: response.text,
        sender: 'bot',
        timestamp: new Date(),
        language: language
      };

      setMessages(prev => [...prev, botMessage]);
      setIsLoading(false);
      
      // Auto-play audio
      speakText(response.audio || response.text);
    }, 1000);
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
      onError: () => setIsSpeaking(false),
    });
  };

  const toggleLanguage = () => {
    setLanguage(prev => prev === 'en' ? 'hi' : 'en');
    Speech.stop();
    setIsSpeaking(false);
  };

  const clearChat = () => {
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
      <StatusBar barStyle="dark-content" backgroundColor="#fff" />
      
      {/* Header */}
      <AppHeader title={language === 'hi' ? 'सरकारी योजना सहायक' : 'Scheme Assistant'} />
      
      {/* Language and Controls */}
      <View style={styles.controlsContainer}>
        <TouchableOpacity
          style={styles.controlButton}
          onPress={toggleLanguage}
        >
          <Text style={styles.controlText}>
            {language === 'en' ? 'हिं' : 'EN'}
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.controlButton}
          onPress={clearChat}
        >
          <Ionicons name="trash-outline" size={20} color="#6366F1" />
        </TouchableOpacity>
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
          onSubmitEditing={sendMessage}
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

      <BottomNav />
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  controlsContainer: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: 12,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
    gap: 12,
  },
  controlButton: {
    width: 44,
    height: 44,
    backgroundColor: '#F3F4F6',
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  controlText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#6366F1',
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
    backgroundColor: '#F3F4F6',
    borderBottomLeftRadius: 4,
    borderWidth: 1,
    borderColor: '#E5E7EB',
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
    backgroundColor: '#F3F4F6',
    padding: 12,
    borderRadius: 16,
    maxWidth: '80%',
    borderWidth: 1,
    borderColor: '#E5E7EB',
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
    borderWidth: 1,
    borderColor: '#E5E7EB',
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



