import React, { useState } from 'react';
import { StyleSheet, View, Text, Image, TouchableOpacity, Alert } from 'react-native';

export default function RobotControl() {
  const [photo, setPhoto] = useState(null);
  const [message, setMessage] = useState('No data');

  const takePhoto = async () => {
    try {
      const response = await fetch('http://192.168.4.1/shoot/show');  //192.168.4.1:3000 -> ExpressJS server on the RP5
      const data = await response.json();
      setPhoto(data.photo); 
      setMessage(data.string);
    } catch (error) {
      console.error('Error taking photo:', error);
      Alert.alert('Error', 'Failed to take photo');
    }
  };

  const sendControlRequest = async (direction : string) => {
    try {
      const response = await fetch(`http://192.168.4.18/move/${direction}`, { method: 'POST' }); //192.168.4.18:8080 -> MicroPython server on the ESP32-C3 
      const data = await response.text();
      console.log(data);
    } catch (error) {
      console.error('Error:', error);
    }
  };

  const stopMovement = async () => {
    try {
      const response = await fetch(`http://192.168.4.18/stop`, { method: 'POST' });
      const data = await response.text();
      console.log(data);
    } catch (error) {
      console.error('Error stopping:', error);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Robot Control</Text>

      <View style={styles.photoBox}>
        {photo ? (
          <Image source={{ uri: photo }} style={styles.image} />
        ) : (
          <Text>No Image</Text>
        )}
      </View>

      <View style={styles.textBox}>
        <Text>{message}</Text>
      </View>

      <TouchableOpacity style={styles.button} onPress={takePhoto}>
        <Text style={styles.buttonText}>Take Photo</Text>
      </TouchableOpacity>

      <View style={styles.controlContainer}>
        <View style={styles.emptySpace} />
        <TouchableOpacity
          style={styles.controlButton}
          onPressIn={() => sendControlRequest('forward')}
          onPressOut={stopMovement}
        >
          <Text style={styles.controlText}>↑</Text>
        </TouchableOpacity>
        <View style={styles.emptySpace} />

        <TouchableOpacity
          style={styles.controlButton}
          onPressIn={() => sendControlRequest('left')}
          onPressOut={stopMovement}
        >
          <Text style={styles.controlText}>←</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.controlButton}
          onPressIn={stopMovement}
        >
          <Text style={styles.controlText}>■</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.controlButton}
          onPressIn={() => sendControlRequest('right')}
          onPressOut={stopMovement}
        >
          <Text style={styles.controlText}>→</Text>
        </TouchableOpacity>

        <View style={styles.emptySpace} />
        <TouchableOpacity
          style={styles.controlButton}
          onPressIn={() => sendControlRequest('backward')}
          onPressOut={stopMovement}
        >
          <Text style={styles.controlText}>↓</Text>
        </TouchableOpacity>
        <View style={styles.emptySpace} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f4f4f4',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  photoBox: {
    width: '80%',
    maxHeight: 250,
    backgroundColor: '#f0f0f0',
    borderColor: '#ccc',
    borderWidth: 2,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
  },
  image: {
    width: '100%',
    height: '100%',
  },
  textBox: {
    width: '80%',
    padding: 10,
    backgroundColor: '#f0f0f0',
    borderColor: '#ccc',
    borderWidth: 2,
    marginBottom: 20,
    alignItems: 'center',
  },
  button: {
    backgroundColor: '#333',
    padding: 15,
    width: '80%',
    alignItems: 'center',
    borderRadius: 5,
    marginBottom: 20,
  },
  buttonText: {
    color: 'white',
    fontSize: 18,
  },
  controlContainer: {
    width: '80%',
    maxWidth: 300,
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  controlButton: {
    width: '30%',
    padding: 20,
    backgroundColor: '#333',
    alignItems: 'center',
    borderRadius: 5,
    margin: 5,
  },
  controlText: {
    color: 'white',
    fontSize: 18,
  },
  emptySpace: {
    width: '30%',
  },
});
