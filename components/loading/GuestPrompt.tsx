// components/LoginPrompt.tsx
import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Ionicons from '@expo/vector-icons/Ionicons';

const GuestPrompt = ({ feature }: { feature: string }) => {
  return (
    <View style={styles.container}>
      <Ionicons name="lock-closed-outline" size={40} color="#999" />
      <Text style={styles.text}>
        Log in or register to access {feature}.
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginTop: 40,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 20,
  },
  text: {
    marginTop: 12,
    fontSize: 16,
    color: '#555',
    textAlign: 'center',
  },
});

export default GuestPrompt;
