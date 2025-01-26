import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert, Dimensions } from 'react-native';
import Card from './Card';
import Ionicons from '@expo/vector-icons/Ionicons';
import AddFieldPopup from './AddFieldPopUp';
import { useSelector } from 'react-redux';
import AddMeasurementPopup from './AddMeasurementPopUp';
import i18n from '@/translations/i18n';

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

  const { language, controlStyle, unitsSystem } = useSelector((state: any) => state.settings);

  if(language === 'English') i18n.locale = 'en';
  else if(language === 'Български') i18n.locale = 'bg';
  else i18n.locale = 'de';

  useEffect(() => {
    if (userId) {
      fetch(`https://agribot-backend-abck.onrender.com/fields/getfields/${userId}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': 'https://agribot-backend-abck.onrender.com'
        },
      })
        .then((response) => response.json())
        .then((data) => setFields(data))
        .catch((error) => console.error('Error fetching fields:', error));
    }

    if (username) {
      fetch(`https://agribot-backend-abck.onrender.com/measurements/read/${username}`, {
        method: 'GET',
      })
        .then((response) => response.json())
        .then((data) => setMeasurements(data))
        .catch((error) => console.error('Error fetching measurements:', error));
    }

    fetch(`https://agribot-backend-abck.onrender.com/diseases/all`, { method: 'GET' })
      .then((response) => response.json())
      .then((data) => setDiseases(data))
      .catch((error) => console.error('Error fetching diseases:', error));
    //console.log(diseases)
  }, [userId, username, fields]);

  const handleAdd = (fieldData: any) => {
    console.log("Current user: "+user.username);
    console.log("Current User ID: " + user.id);
    const curId = user.id;
    console.log("Added id: "+curId);
    fetch('https://agribot-backend-abck.onrender.com/fields/create', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': 'https://agribot-backend-abck.onrender.com'
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
    fetch(`https://agribot-backend-abck.onrender.com/fields/edit`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': 'https://agribot-backend-abck.onrender.com'
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
    fetch(`https://agribot-backend-abck.onrender.com/fields/delete`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': 'https://agribot-backend-abck.onrender.com'
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

  const handleAddMeasurement = (measurementData: any) => {
    fetch('https://agribot-backend-abck.onrender.com/measurements/create', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': 'https://agribot-backend-abck.onrender.com'

      },
      body: JSON.stringify({ ...measurementData, userId }),
    })
      .then((response) => response.json())
      .then((data) => {
        setMeasurements((prev) => [...prev, data]);
        setPopupVisible(false);
      })
      .catch((error) => console.error('Error adding measurement:', error));
  };

  const handleEditMeasurement = (measurementData: any) => {
    fetch(`https://agribot-backend-abck.onrender.com/measurements/edit`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': 'https://agribot-backend-abck.onrender.com'

      },
      body: JSON.stringify({ ...measurementData, userId }),
    })
      .then((response) => response.json())
      .then((data) => {
        setMeasurements((prev) =>
          prev.map((measurement) =>
            measurement.id === measurementData.id ? data : measurement
          )
        );
        setPopupVisible(false);
      })
      .catch((error) => console.error('Error editing measurement:', error));
  };

  const handleDeleteMeasurement = (measurementData: any) => {
    fetch(`https://agribot-backend-abck.onrender.com/measurements/delete`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': 'https://agribot-backend-abck.onrender.com'
      },
      body: JSON.stringify({ measurementId: measurementData.id, userId }),
    })
      .then(() => {
        setMeasurements((prev) =>
          prev.filter((measurement) => measurement.id !== measurementData.id)
        );
      })
      .catch((error) => console.error('Error deleting measurement:', error));
  };

  const filteredData =
    activeTab === 'fields'
      ? (
          fields.filter((item) =>
            item.fieldname.toLowerCase().includes(searchQuery.toLowerCase())
            
      ))
      : activeTab === 'measurements'
      ? (
          measurements.filter((item) =>
            item.createdAt.toLowerCase().includes(searchQuery.toLowerCase()) 
      ))
      : (
        diseases.filter((item) =>
            item.diseaseName.toLowerCase().includes(searchQuery.toLowerCase())

      ));

  return (
    <View style={styles.wrapper}>
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
            onRemove={activeTab === 'measurements' ? handleDeleteMeasurement : handleDelete}
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

      {activeTab === 'measurements' && (
        <AddMeasurementPopup
          visible={isPopupVisible}
          onClose={() => setPopupVisible(false)}
          onSubmit={popupMode === 'add' ? handleAddMeasurement : handleEditMeasurement}
          userId={userId}
        />
      )}
    </View>
  );
}

const screenHeight = Dimensions.get('window').height;

const styles = StyleSheet.create({
  noResults: { color: '#ccc', textAlign: 'center', marginTop: 20 },
  addButton: {
    backgroundColor: '#4CAF50',
    padding: 10,
    marginTop: 10,
    alignItems: 'center',
    borderRadius: 8,
  },
  wrapper: {
    height: screenHeight * 0.75,
  }
});

