
import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Dimensions } from 'react-native';
import { PaperProvider, Modal } from 'react-native-paper';
import MapView, { Marker } from 'react-native-maps';

export default function AddFieldPopup({ visible, onClose, onSubmit, initialValues }: any) {
  if (!visible) return null;


  const [fieldName, setFieldName] = useState(initialValues?.fieldname || '');
  const [crop, setCrop] = useState(initialValues?.crop || '');
  const [latitude, setLatitude] = useState(initialValues?.latitude?.toString() || '');
  const [longitude, setLongitude] = useState(initialValues?.longitude?.toString() || '');

  const handleSubmit = () => {
    const parsedLatitude = parseFloat(latitude);
    const parsedLongitude = parseFloat(longitude);

    if (isNaN(parsedLatitude) || isNaN(parsedLongitude)) {
      alert('Please enter valid latitude and longitude.');
      return;
    }

    onSubmit({ fieldName, crop, location: { latitude: parsedLatitude, longitude: parsedLongitude } });
    onClose();
  };

  return (
    <PaperProvider>
      <Modal visible={visible} onDismiss={onClose} contentContainerStyle={styles.modal}>
        <Text style={styles.title}>Add New Field</Text>
        <TextInput
          style={styles.input}
          placeholder="Field Name"
          placeholderTextColor="#888"
          value={fieldName}
          onChangeText={setFieldName}
        />
        <TextInput
          style={styles.input}
          placeholder="Crop Type"
          placeholderTextColor="#888"
          value={crop}
          onChangeText={setCrop}
        />
        <TextInput
          style={styles.input}
          placeholder="Latitude"
          placeholderTextColor="#888"
          keyboardType="numeric"
          value={latitude}
          onChangeText={setLatitude}
        />
        <TextInput
          style={styles.input}
          placeholder="Longitude"
          placeholderTextColor="#888"
          keyboardType="numeric"
          value={longitude}
          onChangeText={setLongitude}
        />
        <View style={styles.buttonContainer}>
          <TouchableOpacity style={styles.submitButton} onPress={handleSubmit}>
            <Text style={styles.submitButtonText}>Submit</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.closeButton} onPress={onClose}>
            <Text style={styles.closeButtonText}>Close</Text>
          </TouchableOpacity>
        </View>
      </Modal>
    </PaperProvider>
  );
}

const styles = StyleSheet.create({
  modal: {
    backgroundColor: '#333333',
    position: 'absolute',
    bottom: 0,
    borderRadius: 10,
    width: '100%',
    padding: '1rem',
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 15,
    textAlign: 'center',
    color: 'white',
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 8,
    marginBottom: 15,
    fontSize: 16,
    color: 'white',
  },
  mapContainer: {
    height: Dimensions.get('window').height * 0.4,
    marginBottom: 15,
    borderRadius: 8,
    overflow: 'hidden',
  },
  map: {
    flex: 1,
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  submitButton: {
    backgroundColor: '#4CAF50',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 5,
  },
  submitButtonText: {
    color: '#fff',
    fontSize: 16,
  },
  closeButton: {
    backgroundColor: '#FF6347',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 5,
  },
  closeButtonText: {
    color: '#fff',
    fontSize: 16,
  },
});