import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';

export default function Menu({ activeTab, setActiveTab } : any) {
  const tabs = ['fields', 'measurements', 'diseases'];

  return (
    <View style={styles.menu}>
      {tabs.map((tab) => (
        <TouchableOpacity
          key={tab}
          onPress={() => setActiveTab(tab)}
          style={[styles.tab, activeTab === tab && styles.activeTab]}
        >
          <Text style={styles.tabText}>{tab.toUpperCase()}</Text>
        </TouchableOpacity>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  menu: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginVertical: 10,
  },
  tab: {
    padding: 10,
    backgroundColor: '#444',
    borderRadius: 5,
  },
  activeTab: {
    backgroundColor: '#666',
  },
  tabText: {
    color: '#fff',
  },
});
