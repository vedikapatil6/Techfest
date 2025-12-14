import { View, Text, StyleSheet } from 'react-native';
import { Link } from 'expo-router';

export default function HelplineScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>My Schemes</Text>
      <Text style={styles.subtitle}>Coming Soon...</Text>
      <Link href="/" style={styles.link}>← Go Back</Link>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#fff' },
  title: { fontSize: 24, fontWeight: 'bold', marginBottom: 10 },
  subtitle: { fontSize: 16, color: '#666', marginBottom: 20 },
  link: { color: '#2563EB', fontSize: 16 },
});