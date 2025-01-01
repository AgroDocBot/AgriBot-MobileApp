import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import Card from './Card';
import Ionicons from '@expo/vector-icons/Ionicons';
import AddFieldPopup from './AddFieldPopUp';
import { useState } from 'react';
import authSlice from '@/redux/authSlice';

export default function CardList({ activeTab, searchQuery, onAdd }: any) {

  const [isPopupVisible, setPopupVisible] = useState(false);

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


  const handleAdd = (fieldData: any) => {
    fetch('http://localhost:3000/fields/create', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        fieldname: fieldData.fieldName,
        crop: fieldData.crop,
        latitude: fieldData.location.latitude,
        longitude: fieldData.location.longitude,
        userId: 1, 
      }),
    })
      .then((response) => response.json())
      .then((data) => console.log('Field added:', data))
      .catch((error) => console.error('Error:', error));
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
          onPress={() => {setPopupVisible(true)}}>
          <Ionicons name="add-outline" size={32} color="#fff" />
        </TouchableOpacity>
      )}
      {activeTab === 'fields' && (
        <>
          <AddFieldPopup
            visible={isPopupVisible}
            onClose={() => setPopupVisible(false)}
            onSubmit={handleAdd}
          />
        </>
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
