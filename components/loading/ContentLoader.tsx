import React from 'react';
import { View, ActivityIndicator, StyleSheet } from 'react-native';

const ContentLoader = () => {
  return (
    <View style={styles.container}>
      <ActivityIndicator size="large" color="#4CAF50" />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
});

export default ContentLoader;
