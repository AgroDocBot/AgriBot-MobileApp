import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert } from 'react-native';
import Card from './Card';
import Ionicons from '@expo/vector-icons/Ionicons';
import AddFieldPopup from './AddFieldPopUp';
import { useSelector } from 'react-redux';

export default function CardList({ activeTab, searchQuery }: any) {
  const [isPopupVisible, setPopupVisible] = useState(false);
  const [popupMode, setPopupMode] = useState<'add' | 'edit'>('add');
  const [fields, setFields] = useState<any[]>([]);
  const [measurements, setMeasurements] = useState<any[]>([]);
  const [diseases, setDiseases] = useState<any[]>([]);
  const [editData, setEditData] = useState<any>(null);

  const userId = useSelector((state: any) => state.auth.user?.id);
  const user = useSelector((state: any) => state.auth.user);
  const username = useSelector((state: any) => state.auth.user?.username);

  useEffect(() => {
    if (userId) {
      fetch(`http://localhost:3000/fields/getfields/${userId}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      })
        .then((response) => response.json())
        .then((data) => setFields(data))
        .catch((error) => console.error('Error fetching fields:', error));
    }

    if (username) {
      fetch(`http://localhost:3000/measurements/read/${username}`, {
        method: 'GET',
      })
        .then((response) => response.json())
        .then((data) => setMeasurements(data))
        .catch((error) => console.error('Error fetching measurements:', error));
    }

    fetch(`http://localhost:3000/diseases/all`, { method: 'GET' })
      .then((response) => response.json())
      .then((data) => setDiseases(data))
      .catch((error) => console.error('Error fetching diseases:', error));
  }, [userId, username, fields]);

  const handleAdd = (fieldData: any) => {
    console.log("Current user: "+user.username);
    console.log("Current User ID: " + user.id);
    const curId = user.id;
    console.log("Added id: "+curId);
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
        userId: curId,
      }),
    })
      .then((response) => response.json())
      .then((data) => {
        setFields((prev) => [...prev, data]);
        setPopupVisible(false);
      })
      .catch((error) => console.error('Error adding field:', error));
  };

  const handleEdit = (fieldData: any) => {
    fetch(`http://localhost:3000/fields/edit`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        fieldname: fieldData.fieldName,
        crop: fieldData.crop,
        latitude: fieldData.location.latitude,
        longitude: fieldData.location.longitude,
        userId: user.id,
      }),
    })
      .then((response) => response.json())
      .then((data) => {
        setFields((prev) =>
          prev.map((field) =>
            field.fieldname === fieldData.fieldName ? data : field
          )
        );
        setPopupVisible(false);
      })
      .catch((error) => console.error('Error editing field:', error));
  };

  const handleDelete = (fieldData: any) => {
    fetch(`http://localhost:3000/fields/delete`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        fieldname: fieldData.fieldname,
        userId: user.id,
      }),
    })
      .then(() => {
        setFields((prev) =>
          prev.filter((field) => field.fieldname !== fieldData.fieldname)
        );
      })
      .catch((error) => console.error('Error deleting field:', error));
  };

  const filteredData =
    activeTab === 'fields'
      ? fields
      : activeTab === 'measurements'
      ? measurements
      : diseases;

  return (
    <View>
      {filteredData.length ? (
        filteredData.map((item: any, index: number) => (
          <Card
            key={index}
            data={item}
            activeTab={activeTab}
            onEdit={(data: any) => {
              setEditData(data);
              setPopupMode('edit');
              setPopupVisible(true);
            }}
            onRemove={handleDelete}
          />
        ))
      ) : (
        <Text style={styles.noResults}>No results found</Text>
      )}

      {activeTab === 'fields' && (
        <TouchableOpacity
          style={styles.addButton}
          onPress={() => {
            setPopupMode('add');
            setEditData(null);
            setPopupVisible(true);
          }}>
          <Ionicons name="add-outline" size={32} color="#fff" />
        </TouchableOpacity>
      )}

      {activeTab === 'measurements' && (
        <TouchableOpacity
          style={styles.addButton}
          onPress={() => {
            setPopupMode('add');
            setEditData(null);
            setPopupVisible(true);
          }}>
          <Ionicons name="add-outline" size={32} color="#fff" />
        </TouchableOpacity>
      )}

      {activeTab === 'fields' && (
        <AddFieldPopup
          visible={isPopupVisible}
          onClose={() => setPopupVisible(false)}
          onSubmit={popupMode === 'add' ? handleAdd : handleEdit}
          initialValues={editData}
        />
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

