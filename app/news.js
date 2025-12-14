import { useRouter } from 'expo-router';
import React from 'react';
import { ScrollView, StatusBar, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import AppHeader from './components/AppHeader';
import BottomNav from './components/BottomNav';

const newsItems = [
  {
    id: 1,
    title: 'New Health Centers Opened in Rural Areas',
    description: 'Government has opened 50 new primary health centers in rural villages to provide better healthcare access.',
    category: 'Health',
    date: '2 days ago',
    image: '🏥',
  },
  {
    id: 2,
    title: 'Free LPG Connections for Rural Women',
    titleHi: 'ग्रामीण महिलाओं के लिए मुफ्त एलपीजी कनेक्शन',
    description: 'Ujjwala Yojana extended to provide free LPG connections to more rural households. Apply now!',
    descriptionHi: 'उज्ज्वला योजना का विस्तार करके अधिक ग्रामीण परिवारों को मुफ्त एलपीजी कनेक्शन प्रदान किया जा रहा है। अभी आवेदन करें!',
    category: 'Women',
    date: '3 days ago',
    image: '🔥',
  },
  {
    id: 3,
    title: 'Digital Payment Training for Farmers',
    titleHi: 'किसानों के लिए डिजिटल भुगतान प्रशिक्षण',
    description: 'Free training programs on digital payments and banking services for farmers in rural areas.',
    descriptionHi: 'ग्रामीण क्षेत्रों के किसानों के लिए डिजिटल भुगतान और बैंकिंग सेवाओं पर मुफ्त प्रशिक्षण कार्यक्रम।',
    category: 'Agriculture',
    date: '5 days ago',
    image: '📱',
  },
  {
    id: 4,
    title: 'Clean Water Supply Project Launched',
    titleHi: 'स्वच्छ जल आपूर्ति परियोजना शुरू',
    description: 'New water supply projects to provide clean drinking water to 100 rural villages.',
    descriptionHi: '100 ग्रामीण गांवों को स्वच्छ पीने का पानी प्रदान करने के लिए नई जल आपूर्ति परियोजनाएं।',
    category: 'Infrastructure',
    date: '1 week ago',
    image: '💧',
  },
  {
    id: 5,
    title: 'Scholarship Applications Open for Students',
    titleHi: 'छात्रों के लिए छात्रवृत्ति आवेदन खुले',
    description: 'Apply for higher education scholarships. Last date: 31st December. Benefits up to ₹50,000 per year.',
    descriptionHi: 'उच्च शिक्षा छात्रवृत्ति के लिए आवेदन करें। अंतिम तिथि: 31 दिसंबर। प्रति वर्ष 50,000 रुपये तक लाभ।',
    category: 'Education',
    date: '1 week ago',
    image: '🎓',
  },
  {
    id: 6,
    title: 'Rural Road Construction Update',
    titleHi: 'ग्रामीण सड़क निर्माण अपडेट',
    description: '500 km of new roads constructed in rural areas to improve connectivity and access.',
    descriptionHi: 'कनेक्टिविटी और पहुंच में सुधार के लिए ग्रामीण क्षेत्रों में 500 किमी नई सड़कें निर्मित।',
    category: 'Infrastructure',
    date: '2 weeks ago',
    image: '🛣️',
  },
];

export default function NewsScreen() {
  const router = useRouter();

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#fff" />
      
      <AppHeader title="News & Updates" />

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <Text style={styles.sectionTitle}>Latest Updates</Text>
        <Text style={styles.sectionSubtitle}>Stay informed about government schemes and rural development</Text>

        {newsItems.map((item) => (
          <TouchableOpacity
            key={item.id}
            style={styles.newsCard}
            onPress={() => {
              // Could navigate to detailed news page
            }}
          >
            <View style={styles.newsImageContainer}>
              <Text style={styles.newsImage}>{item.image}</Text>
            </View>
            <View style={styles.newsContent}>
              <View style={styles.newsHeader}>
                <Text style={styles.newsCategory}>{item.category}</Text>
                <Text style={styles.newsDate}>{item.date}</Text>
              </View>
              <Text style={styles.newsTitle}>{item.title}</Text>
              <Text style={styles.newsDescription} numberOfLines={2}>
                {item.description}
              </Text>
              <TouchableOpacity style={styles.readMoreButton}>
                <Text style={styles.readMoreText}>Read More →</Text>
              </TouchableOpacity>
            </View>
          </TouchableOpacity>
        ))}

        <View style={styles.bottomSpacing} />
      </ScrollView>

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
    paddingTop: 20,
  },
  sectionTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1F2937',
    marginBottom: 8,
  },
  sectionSubtitle: {
    fontSize: 14,
    color: '#6B7280',
    marginBottom: 24,
  },
  newsCard: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  newsImageContainer: {
    width: 80,
    height: 80,
    backgroundColor: '#F3F4F6',
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
  newsImage: {
    fontSize: 40,
  },
  newsContent: {
    flex: 1,
  },
  newsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  newsCategory: {
    fontSize: 12,
    fontWeight: '600',
    color: '#6366F1',
    backgroundColor: '#EEF2FF',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  newsDate: {
    fontSize: 12,
    color: '#9CA3AF',
  },
  newsTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1F2937',
    marginBottom: 8,
    lineHeight: 22,
  },
  newsDescription: {
    fontSize: 14,
    color: '#6B7280',
    lineHeight: 20,
    marginBottom: 12,
  },
  readMoreButton: {
    alignSelf: 'flex-start',
  },
  readMoreText: {
    fontSize: 14,
    color: '#6366F1',
    fontWeight: '600',
  },
  bottomSpacing: {
    height: 100,
  },
});
