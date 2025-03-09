import React, { useRef, useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Dimensions, Modal } from 'react-native';
import { WebView } from 'react-native-webview';

export default function AddFieldPopup({ visible, onClose, onSubmit, initialValues, mode }: any) {
  const webViewRef = useRef(null);

  const [id, setId] = useState<number | null>(null);
  const [fieldName, setFieldName] = useState<string>('');
  const [crop, setCrop] = useState<string>('');
  const [latitude, setLatitude] = useState('');
  const [longitude, setLongitude] = useState('');

  let script = '';

  useEffect(() => {
    if (visible) {
      if (mode === "add") {
        // resets fields for a new entry
        setId(null);
        setFieldName('');
        setCrop('');
        setLatitude('');
        setLongitude('');
      } else if (initialValues) {
        // populating fields when editing
        setId(initialValues.id || null)
        setFieldName(initialValues.fieldname || '');
        setCrop(initialValues.crop || '');
        setLatitude(initialValues.latitude?.toString() || '');
        setLongitude(initialValues.longitude?.toString() || '');
      }
    }

    if (webViewRef.current && initialValues && mode !== "add") {
      script = `
        window.setInitialMarker(${initialValues.longitude}, ${initialValues.latitude});
      `;
      //webViewRef.current.injectJavascript(script);
    }

  }, [visible, initialValues]);

  const handleWebViewMessage = (event: any) => {
    const data = JSON.parse(event.nativeEvent.data);
    setLatitude(String(Math.round((Number(data.lat) + Number.EPSILON) * 100) / 100));
    setLongitude(String(Math.round((Number(data.lng) + Number.EPSILON) * 100) / 100));
    console.log("Received data from WV: "+JSON.stringify(data));
  };

  const handleSubmit = () => {
    const parsedLatitude = parseFloat(latitude);
    const parsedLongitude = parseFloat(longitude);

    if (isNaN(parsedLatitude) || isNaN(parsedLongitude)) {
      alert('Please enter valid latitude and longitude.');
      return;
    }

    onSubmit({ id: id, fieldName : fieldName, crop : crop, location: { latitude: parsedLatitude, longitude: parsedLongitude } });
    onClose();
  };

  if (!visible) return null;

  console.log('Script: '+script);

  return (
    <Modal visible={visible} animationType="slide" transparent>
      <View style={styles.modalContainer}>
        <View style={styles.modal}>
          <Text style={styles.title}>{mode === 'add' ? "Add New" : "Edit"} Field</Text>
          <TextInput
            style={styles.input}
            placeholder="Field Name"
            placeholderTextColor="#888"
            value={fieldName}
            onChangeText={setFieldName}
            keyboardType="default"
          />
          <TextInput
            style={styles.input}
            placeholder="Crop Type"
            placeholderTextColor="#888"
            value={crop}
            onChangeText={setCrop}
            keyboardType="default"
          />
          <View style={styles.mapContainer}>
            {mode !== "add" ? 
              <WebView
                ref={webViewRef}
                source={{ uri: 'file:///android_asset/map.html' }}
                onMessage={handleWebViewMessage}
                style={styles.map}
                injectedJavaScript={`window.setInitialMarker(${longitude}, ${latitude});`}
              />
              :
              <WebView
              ref={webViewRef}
              source={{ uri: 'file:///android_asset/map.html' }}
              onMessage={handleWebViewMessage}
              style={styles.map}
            />
            }
          </View>
          <View style={styles.buttonContainer}>
            <TouchableOpacity style={styles.button} onPress={handleSubmit}>
              <Text style={styles.buttonText}>Submit</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.button} onPress={onClose}>
              <Text style={styles.buttonText}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
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
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
  },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    padding: 10,
    marginBottom: 15,
  },
  mapContainer: {
    height: 200,
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    overflow: 'hidden',
    marginBottom: 15,
  },
  map: {
    flex: 1,
  },
  mapButton: {
    backgroundColor: '#4CAF50',
    padding: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  mapButtonText: {
    color: '#fff',
    fontWeight: 'bold',
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 20,
  },
  button: {
    flex: 1,
    backgroundColor: '#4CAF50',
    padding: 10,
    marginHorizontal: 5,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 8,
  },
  buttonText: {
    color: '#fff',
    fontWeight: 'bold',
  },
});







