import { Tabs } from 'expo-router';
import React from 'react';
import { TabBarIcon } from '@/components/navigation/TabBarIcon';
import { Colors } from '@/constants/Colors';
import { useColorScheme } from '@/hooks/useColorScheme';

export default function TabLayout() {
  const colorScheme = useColorScheme();

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: Colors[colorScheme ?? 'dark'].tint,
        headerShown: false,
      }}>
      <Tabs.Screen
        name="index"
        options={{
          title: '',
          tabBarIcon: ({ color, focused }) => (
            <TabBarIcon name={focused ? 'home' : 'home-outline'} color={"#5cb85c"} />
          ),
        }}
      />
      <Tabs.Screen
      name="control"
      options={{
        title: '',
        tabBarIcon: ({ color, focused }) => (
          <TabBarIcon name={focused ? 'game-controller' : 'game-controller-outline'} color={"#5cb85c"} />
        ),
      }}
      />
      <Tabs.Screen
        name="data"
        options={{
          title: '',
          tabBarIcon: ({ color, focused }) => (
            <TabBarIcon name={focused ? 'file-tray-full' : 'file-tray-full-outline'} color={"#5cb85c"} />
          ),
        }}
      />
      <Tabs.Screen
        name="account"
        options={{
          title: '',
          tabBarIcon: ({ color, focused }) => (
            <TabBarIcon name={focused ? 'person' : 'person-outline'} color={"#5cb85c"} />
          ),
        }}
      />
    </Tabs>
  );
}
