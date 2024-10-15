import React, { useState } from 'react';
import { StyleSheet, View, Text, Image, TouchableOpacity, Alert, Pressable } from 'react-native';
import { Dimensions } from 'react-native';
import { TabBarIcon } from '@/components/navigation/TabBarIcon';

export default function RobotControl() {
  const [photo, setPhoto] = useState(null);
  const [message, setMessage] = useState('No data');
  const [isAuto, setAuto] = useState(false);

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
      console.error('Stopping:', error);
    }
  };

  const turnOnAuto = async () => {
    try {
        const response = await fetch(`http://192.168.4.1/move/auto`, { method: 'POST' }); //API for autonomous movement
        const data = await response.text();
        console.log(data);
      } catch (error) {
        console.error('Auto turned on:', error);
      }
  } 

  return (
    <View style={styles.container}>

      <View style={styles.displayBox}>
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
      </View>

      <TouchableOpacity style={styles.takePhotoButton} onPress={takePhoto}>
        <TabBarIcon name={'camera'} color={"white"} />
      </TouchableOpacity>

      <View style={styles.buttonContainer}>
        <TouchableOpacity
          style={[styles.controlButton, styles.emptyButton]}
        ></TouchableOpacity>

        <TouchableOpacity
          style={styles.controlButton}
          onPress={() => sendControlRequest('forward')}
        >
          <Text style={styles.buttonText}>↑</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.controlButton, styles.emptyButton]}
        ></TouchableOpacity>

        <TouchableOpacity
          style={styles.controlButton}
          onPress={() => sendControlRequest('left')}
        >
          <Text style={styles.buttonText}>←</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.controlButton}
          onPress={() => stopMovement()}
        >
          <Text style={styles.buttonText}>■</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.controlButton}
          onPress={() => sendControlRequest('right')}
        >
          <Text style={styles.buttonText}>→</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.controlButton, styles.emptyButton]}
        ></TouchableOpacity>

        <TouchableOpacity
          style={styles.controlButton}
          onPress={() => sendControlRequest('backward')}
        >
          <Text style={styles.buttonText}>↓</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.auto_controlButton}
          onPress={() => turnOnAuto()}
        >
          <Text style={styles.buttonText}>Auto</Text>
        </TouchableOpacity>

      </View>
    </View>
  );
}

const { width: screenWidth, height: screenHeight } = Dimensions.get('window');

const styles = StyleSheet.create({
  auto_btn : {
    height : 60,
    backgroundColor : "#5cb85c",
    borderRadius : 5,
    width : '100%',
    display : 'flex',
    justifyContent : 'center',
    alignItems : 'center'
  }, 
  container: {
    display : 'flex',
    backgroundColor : '#222c2e',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
  },
  header: {
    fontSize: 24,
    fontWeight: 'bold',
    marginTop: 20,
  },
  displayBox: {
    alignItems: 'center',
    width: '100%',
  },
  photoBox: {
    width: '100%',
    height: 300,
    backgroundColor: '#e0e0e0',
    borderColor: '#ccc',
    borderWidth: 2,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
    borderRadius: 5,
  },
  image: {
    width: '100%',
    height: '100%',
  },
  textBox: {
    width: '100%',
    height: 50,
    backgroundColor: '#e0e0e0',
    borderColor: '#ccc',
    borderWidth: 2,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
    borderRadius: 5,
  },
  takePhotoButton: {
    paddingVertical: 15,
    paddingHorizontal: 40,
    borderRadius: 5,
    marginBottom: 20,
    position : 'absolute',
    top : 20,
    left : 20,
    backgroundColor : "#5cb85c",
 },
  buttonText: {
    color: '#fff',
    fontSize: 18,
    textAlign: 'center',
    userSelect : 'none'
  },
  buttonContainer: {
    width: '100%',
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    marginTop : screenHeight * 0.016
  },
  controlButton: {
    width: 85,
    height: 85,
    justifyContent: 'center',
    alignItems: 'center',
    margin: 10,
    borderRadius: 5,
    backgroundColor : "#5cb85c",
  },
  auto_controlButton: {
    width: 85,
    height: 85,
    justifyContent: 'center',
    alignItems: 'center',
    margin: 10,
    borderRadius: 5,
    backgroundColor : "#9FA6B2",
  },
  emptyButton: {
    backgroundColor: 'transparent',
  },
});