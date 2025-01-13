import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet } from 'react-native';

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
    <View style={styles.overlay}>
      <View style={styles.container}>
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
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  overlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
  },
  container: {
    backgroundColor: '#fff',
    padding: 20,
    borderRadius: 10,
    width: '90%',
    maxWidth: 400,
    shadowColor: '#000',
    shadowOpacity: 0.2,
    shadowRadius: 10,
    elevation: 500,
    zIndex: 999
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 15,
    textAlign: 'center',
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 8,
    marginBottom: 15,
    fontSize: 16,
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
