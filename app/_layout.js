import { Stack } from 'expo-router';

export default function RootLayout() {
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="index" />
      <Stack.Screen name="login" />
      <Stack.Screen name="profile-setup" />
      <Stack.Screen name="(tabs)" />
      <Stack.Screen name="schemes" options={{ headerShown: false }} />
      <Stack.Screen name="documents" options={{ headerShown: false }} />
      <Stack.Screen name="chatbot" options={{ headerShown: false }} />
      <Stack.Screen name="complaints" options={{ headerShown: false }} />
      <Stack.Screen name="news" options={{ headerShown: false }} />
      <Stack.Screen name="helpline" options={{ headerShown: false }} />
      <Stack.Screen name="explore-schemes" options={{ headerShown: false }} />
      <Stack.Screen name="schemes-by-category" options={{ headerShown: false }} />
      <Stack.Screen name="scheme-details" options={{ headerShown: false }} />
      <Stack.Screen name="application-form" options={{ headerShown: false }} />
      <Stack.Screen name="check-status" options={{ headerShown: false }} />
      <Stack.Screen name="menu" options={{ headerShown: false }} />
    </Stack>
  );
}