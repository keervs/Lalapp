import { Tabs } from 'expo-router';

export default function TabsLayout() {
  return (
    <Tabs screenOptions={{ headerShown: false, tabBarStyle: { display: 'none' } }}>
      <Tabs.Screen name="splash" />
      <Tabs.Screen name="index" />
      <Tabs.Screen name="signin" />
      <Tabs.Screen name="signup" />
      <Tabs.Screen name="home" />
    </Tabs>
  );
}