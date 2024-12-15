import React, { useState } from 'react';
import { View, StyleSheet, Dimensions, Text, TextInput, ScrollView } from 'react-native';
import Menu from '@/components/data/Menu';
import CardList from '@/components/data/CardList';

export default function DataScreen() {
  const [activeTab, setActiveTab] = useState('fields');
  const [searchQuery, setSearchQuery] = useState('');

  return (
    <View style={styles.main}>
      <Menu activeTab={activeTab} setActiveTab={setActiveTab} />
      <TextInput
        style={styles.searchBar}
        placeholder="Search..."
        placeholderTextColor="#ccc"
        value={searchQuery}
        onChangeText={setSearchQuery}
      />
      <ScrollView>
        <CardList activeTab={activeTab} searchQuery={searchQuery} />
      </ScrollView>
    </View>
  );
}

const { height: screenHeight } = Dimensions.get('window');

const styles = StyleSheet.create({
  main: {
    backgroundColor: '#222c2e',
    height: screenHeight * 0.95,
    padding: 10,
  },
  searchBar: {
    height: 40,
    backgroundColor: '#333',
    color: '#fff',
    paddingHorizontal: 10,
    borderRadius: 5,
    marginVertical: 10,
  },
});
