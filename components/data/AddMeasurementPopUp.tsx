import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet } from 'react-native';
import { Picker } from '@react-native-picker/picker';
import { PaperProvider } from 'react-native-paper';
import { Modal } from 'react-native';
import { Dimensions } from 'react-native';
import i18n from '@/translations/i18n';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '@/redux/store';
import { FieldType } from '@/constants/types/FieldInterfaces';
import { AddMeasurementPopupProps } from '@/constants/types/PropsInterfaces';

export default function AddMeasurementPopup({
  visible,
  onClose,
  onSubmit,
  userId,
  initialField,
  mode,
  currentField
}: AddMeasurementPopupProps) {
  
  const [fields, setFields] = useState<Array<FieldType>>([]);
  const [selectedField, setSelectedField] = useState<number>();

  const dispatch = useDispatch();

  const { language, controlStyle, unitsSystem } = useSelector((state: RootState) => state.settings);

  if(language === 'English') i18n.locale = 'en';
  else if(language === 'Български') i18n.locale = 'bg';
  else i18n.locale = 'de';

  useEffect(() => {
    if (userId) {
      fetch(`https://agribot-backend-abck.onrender.com/fields/getfields/${userId}`)
        .then((response) => response.json())
        .then((data) => setFields(data))
        .catch((error) => console.error('Error fetching fields:', error));
    }
  }, [userId]);

  useEffect(() => {
    if(mode === "edit") setSelectedField(initialField.id);
  }, [visible, initialField])

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
      <Modal visible={visible} animationType="slide" transparent>
        <View style={styles.modalContainer}>
          <View style={styles.modal}>
            <Text style={styles.title}>{mode === 'add' ? i18n.t('add_edit_popup.add') : i18n.t('add_edit_popup.edit')} {i18n.t('add_edit_popup.measurement')}</Text>
            <Picker
              selectedValue={selectedField}
              onValueChange={(itemValue : number) => setSelectedField(itemValue)}
              style={styles.picker}>
              <Picker.Item label={i18n.t('add_edit_popup.selectField')} value=""/>
              {fields.map((field) => (
                <Picker.Item key={field.id} label={field.fieldname} value={field.id} />
              ))}
            </Picker>
            <View style={styles.buttonContainer}>
              <TouchableOpacity style={styles.submitButton} onPress={handleSubmit}>
                <Text style={styles.submitButtonText}>{i18n.t('add_edit_popup.submit')}</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.closeButton} onPress={onClose}>
                <Text style={styles.closeButtonText}>{i18n.t('add_edit_popup.close')}</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
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
    padding: 10,
    height: 200
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
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
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modal: {
    width: Dimensions.get('window').width * 0.9,
    padding: 20,
    backgroundColor: '#fff',
    borderRadius: 10,
    elevation: 5,
  },
});
