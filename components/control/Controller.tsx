import React, { useState } from 'react';
import { StyleSheet, View, Text, Image, TouchableOpacity, Alert, Pressable } from 'react-native';
import { Dimensions } from 'react-native';
import { TabBarIcon } from '@/components/navigation/TabBarIcon';
import { useEffect } from 'react';
import { NetworkInfo } from 'react-native-network-info';
import { useSelector } from 'react-redux';

export default function RobotControl({ isConnected }: { isConnected: boolean }) {
  const [photo, setPhoto] = useState<any>('');
  const [message, setMessage] = useState('No data');
  const [isAuto, setAuto] = useState(false);
  const [esp32Ws, setEsp32Ws] = useState<WebSocket>();
  const [rp5Ws, setRp5Ws] = useState<WebSocket>();

  //const currentMeasurementId = useSelector((state: any) => state.measurement.currentMeasurementId);
  
  const collectPlantData = (plantData: any, isHealthy : boolean) => {
    const endpoint = isHealthy
      ? 'https://agribot-backend-abck.onrender.com/plants/healthy/add'
      : 'https://agribot-backend-abck.onrender.com/plants/diseased/add';

    fetch(endpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...plantData, measurementId: 3 }),
    })
      .then((response) => response.json())
      .then((data) => console.log('Plant data added:', data))
      .catch((error) => console.error('Error:', error));
  };
  
  useEffect(() => {

    const connectWebSockets = async () => {
  
      let attempts = 0;
      let rp5Socket: WebSocket | null = null;
  
      while (!rp5Socket || rp5Socket.readyState !== WebSocket.OPEN) { 
        try {
          rp5Socket = new WebSocket('ws://192.168.4.1:3003');
          
          rp5Socket.onopen = () => {
            console.log('Connected to main logic module');
          };
  
          rp5Socket.onmessage = (ev) => {
            if (ev.data instanceof Blob) {
              const reader = new FileReader();
              reader.onloadend = () => {
                const base64data = reader.result;
                setPhoto(base64data);
              };
              reader.readAsDataURL(ev.data); // Convert Blob to base64
            } else {
              const classMsg = ev.data;
              let result = JSON.stringify(classMsg);
              let s = result.indexOf("Predicted Class:");
              let e = result.indexOf("Prediction Probabilities:");
  
              let resClass = result.substring(s + 16, e - 3);
  
              console.log("Received raw from RP5: "+ result);

              const isHealthy: boolean = resClass.includes('Healthy');
  
              if (isHealthy) {
                const plantData = {
                  latitude: classMsg.latitude,
                  longitude: classMsg.longitude,
                  crop: resClass.substring(1, 5),
                  measurementId: 3
                };
                collectPlantData(plantData, isHealthy);
              } else {
                const plantData = {
                  latitude: classMsg.latitude,
                  longitude: classMsg.longitude,
                  crop: resClass.substring(1, 5),
                  disease: resClass.substring(6, e - 3),
                  measurementId: 3
                };
                collectPlantData(plantData, isHealthy);
              }

              console.log("Longitude: "+classMsg.longitude);
              setMessage(resClass);
            }
          };
  
          rp5Socket.onerror = (e) => {
            console.error('RP5 WebSocket error:', e.timeStamp);
          };
  
          rp5Socket.onclose = (e) => {
            console.log('RP5 WebSocket closed:', e.code, e.reason);
          };
  
          setRp5Ws(rp5Socket);

          await new Promise((resolve) => setTimeout(resolve, 2000)); // Retry after 1 second

        } catch (error) {
          console.log('Failed to connect, retrying...');
          attempts++;
          await new Promise((resolve) => setTimeout(resolve, 1000)); // Retry after 1 second
        }
      }
  
      Alert.alert('Success', 'Connected to main logic module!');
  
      const esp32Socket = new WebSocket('ws://192.168.4.18:81/ws');
      esp32Socket.onopen = () => {
        console.log('Connected to movement control module');
      };
  
      esp32Socket.onmessage = (e) => {
        console.log('Message from server:', e.data);
      };
  
      esp32Socket.onerror = (e) => {
        console.error('WebSocket error:', e.timeStamp);
      };
  
      esp32Socket.onclose = (e) => {
        console.log('WebSocket closed:', e.code, e.reason);
      };
  
      setEsp32Ws(esp32Socket);
    };
  
    connectWebSockets();
  
    return () => {
      esp32Ws?.close();
      rp5Ws?.close();
    };
  }, [isConnected]);
  
  const sendControlRequest = (direction : string) => {
    if (esp32Ws && esp32Ws.readyState === WebSocket.OPEN) {
      const message = { action: direction };
      esp32Ws.send(JSON.stringify(message));
      console.log(`Sent: ${JSON.stringify(message)}`);
    } else {
      console.log('WebSocket is not open');
    }
  };

  const turnOnAuto = () => {
    if (rp5Ws && rp5Ws.readyState === WebSocket.OPEN) {
      const message = { action: 'auto_on' };
      setAuto(isAuto!);
      esp32Ws!.close();
      rp5Ws.send(JSON.stringify(message));
      console.log('Auto mode activated via RP5 WebSocket');
    } else {
      console.log('RP5 WebSocket is not open');
    }
  };


  const takePhoto = () => {
    if (rp5Ws && rp5Ws.readyState === WebSocket.OPEN) {
      const messageTake = { action: 'shoot_assess_gps' }; // WebSocket command to take a photo
      rp5Ws.send(JSON.stringify(messageTake));
      console.log('Requested assessment')
      const messageGet = {action : 'shoot_show'};
      rp5Ws.send(JSON.stringify(messageGet));    
      console.log('Requested photo via RP5 WebSocket');
    } else {
      console.log('RP5 WebSocket is not open');
      Alert.alert('Error', 'RP5 WebSocket is not open');
    }
  };

  const sendCameraRequest = (direction : string) => {
    if (rp5Ws && rp5Ws.readyState === WebSocket.OPEN) {
      const messageTake = { action: direction };
      rp5Ws.send(JSON.stringify(messageTake));
      console.log('Requested camera movement');
    } else {
      console.log('RP5 WebSocket is not open');
      Alert.alert('Error', 'RP5 WebSocket is not open');
    }
  }

  const getGPSData = () => {
    if (rp5Ws && rp5Ws.readyState === WebSocket.OPEN) {
      const messageTake = { action: "gps" };
      rp5Ws.send(JSON.stringify(messageTake));
      console.log('Requested gps data');
    } else {
      console.log('RP5 WebSocket is not open');
    }
  }
  return (
    <View style={styles.container}>

      <View style={styles.displayBox}>
        <View style={styles.photoBox}>
          {photo ? (
            <Image source={{ uri: photo }} style={styles.image}/>
          ) : (
            <Text>No Image</Text>
          )}
        </View>
        <View style={styles.textBox}>
          <Text>{message}</Text>
        </View>
      </View>

      <TouchableOpacity
       style={styles.takePhotoButton} onPress={takePhoto}>
        <TabBarIcon name={'camera'} color={"white"} />
      </TouchableOpacity>

      <TouchableOpacity 
        style={styles.cameraControlLeft}
        onPressIn={() => sendCameraRequest('turn_left')}
        onPressOut={() => sendCameraRequest('stop_rotate')}
      >
        <Text style={styles.buttonText}>←</Text>
      </TouchableOpacity>

      <TouchableOpacity
       style={styles.cameraControlRight}
       onPressIn={() => sendCameraRequest('turn_right')}
       onPressOut={() => sendCameraRequest('stop_rotate')}
      >
        <Text style={styles.buttonText}>→</Text>
      </TouchableOpacity>

      <TouchableOpacity
       style={styles.cameraControlUp}
       onPressIn={() => sendCameraRequest('level_higher')}
       onPressOut={() => sendCameraRequest('stop_level')}
      >
        <Text style={styles.buttonText}>↑</Text>
      </TouchableOpacity>

      <TouchableOpacity 
        style={styles.cameraControlDown}
        onPressIn={() => sendCameraRequest('level_lower')}
        onPressOut={() => sendCameraRequest('stop_level')}
      >
        <Text style={styles.buttonText}>↓</Text>
      </TouchableOpacity>

      <View style={styles.buttonContainer}>
        <TouchableOpacity
          style={!isAuto ? styles.controlButton : styles.auto_controlButton}
          onPressIn={() => sendControlRequest('go_left_wide')}
          onPressOut={() => sendControlRequest('stop')}
        >
          <Text style={styles.buttonText}>↰</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={!isAuto ? styles.controlButton : styles.auto_controlButton}
          onPressIn={() => sendControlRequest('go_forward')}
          onPressOut={() => sendControlRequest('stop')}
        >
          <Text style={styles.buttonText}>↑</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={!isAuto ? styles.controlButton : styles.auto_controlButton}
          onPressIn={() => sendControlRequest('go_right_wide')}
          onPressOut={() => sendControlRequest('stop')}
        >
          <Text style={styles.buttonText}>↱</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={!isAuto ? styles.controlButton : styles.auto_controlButton}
          onPressIn={() => sendControlRequest('go_left')}
          onPressOut={() => sendControlRequest('stop')}
        >
          <Text style={styles.buttonText}>←</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={!isAuto ? styles.controlButton : styles.auto_controlButton}
          onPressIn={() => sendControlRequest('stop')}
          onPressOut={() => sendControlRequest('stop')}
        >
          <Text style={styles.buttonText}>■</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={!isAuto ? styles.controlButton : styles.auto_controlButton}
          onPressIn={() => sendControlRequest('go_right')}
          onPressOut={() => sendControlRequest('stop')}
        >
          <Text style={styles.buttonText}>→</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.auto_controlButton}
          onPress={() => getGPSData()}
        >
          <Text style={styles.buttonText}>GPS</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={!isAuto ? styles.controlButton : styles.auto_controlButton}
          onPressIn={() => sendControlRequest('go_backward')}
          onPressOut={() => sendControlRequest('stop')}
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

  cameraControlLeft: {
    position: 'absolute',
    top: 290,
    left: 20,
    width: screenWidth * 0.45,
    height: 30,
    backgroundColor: '#5cb85c',
    justifyContent: 'center',
    alignItems: 'center',
    borderBottomLeftRadius : 5
  },
  cameraControlRight: {
    position: 'absolute',
    top : 290,
    right: 20,
    width: screenWidth * 0.46,
    height: 30,
    backgroundColor: '#5cb85c',
    justifyContent: 'center',
    alignItems: 'center',
    borderBottomRightRadius : 5
  },
  cameraControlUp: {
    position: 'absolute',
    top: 20,
    right: 20,
    width: 30,
    height: 150,
    backgroundColor: '#5cb85c',
    justifyContent: 'center',
    alignItems: 'center',
    borderTopRightRadius : 5
  },
  cameraControlDown: {
    position: 'absolute',
    top: 20 + 150,
    right: 20,
    width: 30,
    height: 150,
    backgroundColor: '#5cb85c',
    justifyContent: 'center',
    alignItems: 'center',
    borderBottomRightRadius : 5
  },
});