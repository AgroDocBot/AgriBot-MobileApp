import React, { useState } from 'react';
import { StyleSheet, View, Text, Image, TouchableOpacity, Alert, Pressable } from 'react-native';
import { Dimensions } from 'react-native';
import { TabBarIcon } from '@/components/navigation/TabBarIcon';
import { useEffect } from 'react';
import { NetworkInfo } from 'react-native-network-info';
import { useSelector } from 'react-redux';
import { RootState } from '@/redux/store';
import { useDispatch } from 'react-redux';
import axios from 'axios';
import { AppDispatch } from '@/redux/store';
import { setBatteryStatus } from '@/redux/batteryUsageSlice';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useFocusEffect } from '@react-navigation/native';
import RNFS from 'react-native-fs';
import { Platform } from 'react-native';
import RNBlobUtil from 'react-native-blob-util';
import { updateBattery, setLastConnection, setSessionDuration, updateUsage } from '@/redux/batteryUsageSlice';
import { preventAutoHideAsync } from 'expo-splash-screen/build';
import PlantDiagnosis from './PlantDiagnosis';

export default function RobotControl({ isConnected }: { isConnected: boolean}) {
  const [photo, setPhoto] = useState<any>('');
  const [message, setMessage] = useState('No data');
  const [isAuto, setAuto] = useState(false);
  const [esp32Ws, setEsp32Ws] = useState<WebSocket>();
  const [rp5Ws, setRp5Ws] = useState<WebSocket>();
  const [currentPlant, setCurrentPlant] = useState<any>({isHealthy: false, data: {}});
  const [latestMessage, setLatestMessage] = useState();
  const [imageBlob, setImageBlob] = useState<Blob | null>(null);

  //const [currentMeasurement, setCurrentMeasurement] = useState();
  const measurementId = useSelector((state: RootState) => state.measurementnew.measurementId);
  const user = useSelector((state: RootState) => state.auth.user);

  let connectionStartTime: number | null = null;
  let curPlantId: number | null = null;

  const dispatch = useDispatch<AppDispatch>();

  /*useFocusEffect(
    React.useCallback(() => {
      const fetchData = async () => {
        console.log("Getting measurement...")
        const value = await AsyncStorage.getItem('measurementId');
        if (value) setCurrentMeasurement(JSON.parse(value));
      };

      fetchData();
    }, []))*/

    const uploadImageToBackend = async (base64ImageData: Blob) => {
      console.log("Attempting to upload image!");
    
      let plantState: "healthy" | "diseased" = currentPlant.isHealthy ? "healthy" : "diseased";
    
      console.log(`https://agribot-backend-abck.onrender.com/${plantState}/edit`);
      console.log("Before processing: " + JSON.stringify(base64ImageData));
    
      var reader = new FileReader();
      reader.readAsDataURL(base64ImageData); 
      reader.onloadend = async function() {
        var base64dataString = reader.result;                
        console.log(base64dataString);
        const base64data = (base64dataString as string).split(',')[1];
        console.log(base64data);
        try {
          // Check the platform to handle Blob correctly
          let imageUri;
          if (Platform.OS === 'android') {
            // Create a path to save the image file in the cache directory
            const filePath = `${RNBlobUtil.fs.dirs.CacheDir}/image_${Date.now()}.jpg`;
            console.log("Attempt to save")
            // Convert Blob to file and save it using RNBlobUtil
            await RNBlobUtil.fs.writeFile(filePath, base64data as string, 'base64');  // Using base64 encoding
            console.log("Image saved!")
            // Set the URI for Android to upload via FormData
            imageUri = `file://${filePath}`; // file:// URI for Android
          } else {
            // Handle iOS or web differently, using Blob directly or its URI if necessary
            imageUri = await RNBlobUtil.fs.readFile(base64data as string, 'base64');  // Assuming the Blob is a file URI or Base64
          }
      
          // Now append to FormData
          console.log("Now appending to frormadaa")
          const formData = new FormData();
          formData.append('image', {
            uri: imageUri,
            name: `image.jpg`, // Adjust based on file type
            type: 'image/jpeg', // Adjust MIME type if needed
          } as any);

          console.log("Formdata appended!")
      
          const uploadResponse = await fetch(`https://agribot-backend-abck.onrender.com/image`, {
            method: 'POST',
            body: formData,
          });
      
          if (!uploadResponse.ok) {
            throw new Error(`Image upload failed: ${uploadResponse.statusText}`);
          }
      
          const responseData = await uploadResponse.json();
          console.log('Image uploaded successfully:', responseData);
      
          // Extract uploaded image URL
          const uploadedImageUrl = responseData.imageUrl;
          console.log('Uploaded image URL:', uploadedImageUrl);
      
          console.log("Current plant"+JSON.stringify(currentPlant.data))
          console.log("Current plant id"+curPlantId);

          // Update the image using PUT request with the received URL
          const updateResponse = await fetch(`https://agribot-backend-abck.onrender.com/plants/${plantState}/edit`, {
            method: 'PUT',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              id: curPlantId,
              imageUrl: uploadedImageUrl,
            }),
          });
      
          if (!updateResponse.ok) {
            throw new Error(`Image update failed: ${updateResponse.statusText}`);
          }
      
          const updateData = await updateResponse.json();
          console.log('Image updated successfully:', updateData);
      
        } catch (error) {
          console.error('Error uploading image to backend:', error);
        }
      }

      
    };

  const collectPlantData = (plantData: any, isHealthy : boolean) => {
    const endpoint = isHealthy
      ? 'https://agribot-backend-abck.onrender.com/plants/healthy/add'
      : 'https://agribot-backend-abck.onrender.com/plants/diseased/add';

    fetch(endpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...plantData, measurementId: measurementId }),
    })
      .then((response) => response.json())
      .then((data) => {console.log(JSON.stringify(data.id)); curPlantId = data.id; setCurrentPlant({data: {id: data.id}, isHealthy: isHealthy}); uploadImageToBackend(imageBlob!)})
      .catch((error) => console.error('Error:', error));
  };
  
  useEffect(() => {

    const connectWebSockets = async () => {
  
      let attempts = 0;
      let rp5Socket: WebSocket | null = null;
  
      while (!rp5Socket || rp5Socket.readyState !== WebSocket.OPEN) { 
        try {
          rp5Socket = new WebSocket('ws://192.168.4.1:3003');
          rp5Socket.binaryType = 'blob';

          rp5Socket.onopen = () => {
            console.log('Connected to main logic module');
            dispatch(setLastConnection(Date.now()));
            connectionStartTime = Date.now();
          };
  
          rp5Socket.onmessage = (ev) => {
            console.log("Extra raw: "+JSON.stringify(ev.data));
            handleWebSocketMessage(ev.data);
          };
  
          rp5Socket.onerror = (e) => {
            console.error('RP5 WebSocket error:', e.timeStamp);
          };
  
          rp5Socket.onclose = (e) => {
            console.log('RP5 WebSocket closed:', e.code, e.reason);
            const duration = Date.now() - connectionStartTime!;
            dispatch(setSessionDuration(duration));
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
  
  useEffect(() => {
    const requestBatteryData = () => {
      if (rp5Ws?.readyState === WebSocket.OPEN) {  // Ensure the latest rp5Ws is used
        rp5Ws.send(JSON.stringify({ action: 'get_battery' }));
      }
    };
  
    const intervalId = setInterval(() => {
      requestBatteryData();
      
      //if(user && measurementId) dispatch(updateUsage({userId: user?.id, timeUsed: Date.now() - connectionStartTime!}))
    }, 60000); 
  
    return () => clearInterval(intervalId); // Cleanup interval on unmount
  }, [rp5Ws]); 

  useEffect(() => {
    const processPlantData = (data: any) => {
      let result = JSON.stringify(data);

      let s = result.indexOf("Predicted class:");
      let e = result.indexOf("certainty:");
      let resClass = result.substring(s + 16, e - 2).trim();
  
      console.log("Processing measurement: " + measurementId);

      const latIndex = result.indexOf("lat:");
      const lonIndex = result.indexOf("lon:");
  
      let latitude = latIndex !== -1 ? parseFloat(result.substring(latIndex + 4, latIndex + 12).trim()) : 42.0;
      let longitude = lonIndex !== -1 ? parseFloat(result.substring(lonIndex + 4, lonIndex + 12).trim()) : 21.0;
  
      // Determine if the plant is healthy
      const isHealthy = resClass.toLowerCase().includes("healthy");
  
      // Extract crop and disease
      let crop = resClass.split("___")[0] || "Unknown";
      let disease = isHealthy ? undefined : resClass.split("___")[1] || "Unknown";
  
      const plantData = {
        latitude,
        longitude,
        crop,
        measurementId,
        ...(isHealthy ? {} : { disease }),
      };
  
      collectPlantData(plantData, isHealthy);
      setMessage(resClass.replace(/_/g, ' '));
    };
  
    if (latestMessage) {
      processPlantData(latestMessage);
    }
  }, [measurementId, latestMessage]);

  const handleWebSocketMessage = (data: any) => {
    if (data instanceof Blob) {
      console.log("image detected");
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64data = reader.result;
        setPhoto(base64data);
        setImageBlob(data);
        //uploadImageToBackend(data);
      };
      reader.readAsDataURL(data);
    } else if (JSON.stringify(data).includes("battery")) {
      const parsedData = JSON.parse(data);
      if (
        parsedData.battery !== undefined &&
        parsedData.power !== undefined &&
        parsedData.voltage !== undefined
      ) {
        dispatch(setBatteryStatus(parsedData));
       // if(user) dispatch(updateBattery({ userId: user?.id, battery: data.battery}))
      }
    } else {
      // Instead of processing here, we store the latest message
      setLatestMessage(data);
    }
  };

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
        <PlantDiagnosis message={message}/>
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