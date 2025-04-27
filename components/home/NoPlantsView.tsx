import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons'; // or 'react-native-vector-icons/Ionicons'

interface EmptyStateProps {
  iconName?: keyof typeof Ionicons.glyphMap;
  message?: string;
}

const EmptyState: React.FC<EmptyStateProps> = ({
  iconName = 'leaf-outline',
  message = 'No analyzed plants yet.',
}) => {
  return (
    <View style={styles.container}>
      <Ionicons name={iconName} size={64} color="#9FA6B2" style={styles.icon} />
      <Text style={styles.message}>{message}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  icon: {
    marginBottom: 10,
  },
  message: {
    fontSize: 18,
    color: '#9FA6B2',
    textAlign: 'center',
  },
});

export default EmptyState;
