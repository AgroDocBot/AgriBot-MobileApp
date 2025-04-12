// components/FullScreenLoader.tsx
import React from 'react';
import { View, ActivityIndicator, StyleSheet, Text, Dimensions } from 'react-native';

const FullScreenLoader = () => {
  return (
    <View style={styles.overlay}>
      <ActivityIndicator size="large" color="#fff" />
      <Text style={styles.text}>Connecting...</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  overlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    height: Dimensions.get('window').height,
    width: Dimensions.get('window').width,
    backgroundColor: 'rgba(0,0,0,0.5)',
    zIndex: 999,
    justifyContent: 'center',
    alignItems: 'center',
  },
  text: {
    color: '#fff',
    marginTop: 12,
    fontSize: 16,
  },
});

export default FullScreenLoader;
