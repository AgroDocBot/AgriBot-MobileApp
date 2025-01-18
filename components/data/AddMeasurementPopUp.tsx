import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet } from 'react-native';
import {Picker} from '@react-native-picker/picker';
import { PaperProvider, Modal } from 'react-native-paper';

interface AddMeasurementPopupProps {
  visible: boolean;
  onClose: () => void;
  onSubmit: (measurementData: any) => void;
  userId: number;
}


export default function AddMeasurementPopup({
  visible,
  onClose,
  onSubmit,
  userId,
}: AddMeasurementPopupProps) {
  const [fields, setFields] = useState<any[]>([]);
  const [selectedField, setSelectedField] = useState('');

  useEffect(() => {
    if (userId) {
      fetch(`https://agribot-backend-abck.onrender.com/fields/getfields/${userId}`)
        .then((response) => response.json())
        .then((data) => setFields(data))
        .catch((error) => console.error('Error fetching fields:', error));
    }
  }, [userId]);

  const handleSubmit = () => {
    if (!selectedField) {
      alert('Please select a field.');
      console.log('Error in handlesubmit')
      return;
    }

    console.log(selectedField);
    onSubmit({
      fieldId: selectedField
    });
    onClose();
  };

  if (!visible) return null;

  return (
    <PaperProvider>
      <Modal visible={visible} contentContainerStyle={styles.container}>
        <Text style={styles.title}>Add Measurement</Text>
        <Picker
          selectedValue={selectedField}
          onValueChange={(itemValue : any) => setSelectedField(itemValue)}
          style={styles.picker}>
          <Picker.Item label="Select a Field" value="" />
          {fields.map((field) => (
            <Picker.Item key={field.id} label={field.fieldname} value={field.id} />
          ))}
        </Picker>
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
  overlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'red',
    height: '100%',
    width: '100%',
    elevation: 1000,
    zIndex: 1001
  },
  container: {
    backgroundColor: '#333333',
    position: "absolute",
    bottom: 0,
    borderRadius: 10,
    width: '100%',
    padding: '1rem',
    height: 200
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 15,
    textAlign: 'center',
    color: 'white'
  },
  picker: {
    height: 50,
    borderColor: '#ddd',
    borderWidth: 1,
    borderRadius: 8,
    marginBottom: 15,
    backgroundColor: '#f9f9f9',
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
