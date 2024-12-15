import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import Card from './Card';
import Ionicons from '@expo/vector-icons/Ionicons';

export default function CardList({ activeTab, searchQuery, onAdd }: any) {
  const data: any = {
    fields: [
      { name: 'Field A', size: '10ha', crops: 'Wheat', location: 'Zone 1' },
      { name: 'Field B', size: '8ha', crops: 'Corn', location: 'Zone 2' },
    ],
    measurements: [
      { field: 'Field A', date: '2024-12-01', duration: '2h', percent: '75%' },
      { field: 'Field B', date: '2024-12-03', duration: '1.5h', percent: '60%' },
    ],
    diseases: [
      { name: 'Blight', plant: 'Wheat', encountered: true },
      { name: 'Rust', plant: 'Corn', encountered: false },
    ],
  };

  const filteredData = data[activeTab].filter((item: any) =>
    Object.values(item).some((value: any) =>
      value.toString().toLowerCase().includes(searchQuery.toLowerCase())
    )
  );

  return (
    <View>
      {filteredData.length ? (
        filteredData.map((item: any, index: number) => (
          <Card
            key={index}
            data={item}
            activeTab={activeTab}
            onEdit={(data: any) => console.log('Edit:', data)}
            onRemove={(data: any) => console.log('Remove:', data)}
          />
        ))
      ) : (
        <Text style={styles.noResults}>No results found</Text>
      )}

      {activeTab !== 'diseases' && (
        <TouchableOpacity
          style={styles.addButton}
          onPress={() => onAdd(activeTab)}>
          <Ionicons name="add-outline" size={32} color="#fff" />
        </TouchableOpacity>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  noResults: { color: '#ccc', textAlign: 'center', marginTop: 20 },
  addButton: {
    backgroundColor: '#4CAF50',
    padding: 10,
    marginTop: 10,
    alignItems: 'center',
    borderRadius: 8,
  },
});
