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
import FullScreenLoader from '../loading/FullScreenLoader';
import JoystickControl from './JoystickController';
import { ReceivedPlantDataD, ReceivedPlantDataH } from '@/constants/types/PlantsInterfaces';
import { Picker } from '@react-native-picker/picker';

export default function RobotControl({ isConnected }: { isConnected: boolean}) {
  const [photo, setPhoto] = useState<ArrayBuffer | string | null>(null);
  const [message, setMessage] = useState<string>('No data');
  const [isAuto, setAuto] = useState<boolean>(false);
  const [esp32Ws, setEsp32Ws] = useState<WebSocket>();
  const [rp5Ws, setRp5Ws] = useState<WebSocket>();
  const [currentPlant, setCurrentPlant] = useState<{isHealthy: boolean, data: {id: number} | null}>({isHealthy: false, data: null});
  const [latestMessage, setLatestMessage] = useState<string>();
  const [imageBlob, setImageBlob] = useState<Blob | null>(null);
  const [selectedCrop, setSelectedCrop] = useState('auto_detect');

  //const [currentMeasurement, setCurrentMeasurement] = useState();
  const measurementId = useSelector((state: RootState) => state.measurementnew.measurementId);
  const user = useSelector((state: RootState) => state.auth.user);
  const controlStyle = useSelector((state: RootState) => state.settings.controlStyle);


  let connectionStartTime: number | null = null;
  let curPlantId: number | null = null;

  const dispatch = useDispatch<AppDispatch>();


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
      
          // Append to FormData
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

  const collectPlantData = (plantData: ReceivedPlantDataH | ReceivedPlantDataD, isHealthy : boolean) => {
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
    const processPlantData = (data: string) => {
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
  
      const plantData: ReceivedPlantDataH | ReceivedPlantDataD = {
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

  const handleWebSocketMessage = async (data: Blob | string) => {
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
    } else if(JSON.stringify(data).includes("Auto")) {
      console.log("RECEIVED DATA FROM AUTO MODE!");
      console.log(JSON.stringify(data));
      try {
        await fetch('https://agribot-backend-abck.onrender.com/plant/bulk-import', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ measurementId, data }),
        });
      } catch (err) {
        console.error('Upload failed. Saved to backup.json');
      }
    } else {
      // Instead of processing here, we store the latest message
      setLatestMessage(data);
    }
  };

  const turnOnAuto = async () => {
    if (rp5Ws && rp5Ws.readyState === WebSocket.OPEN) {
      let message;
      if(!isAuto) {
        setAuto(true);
        message  = { action: 'auto_on' };
        console.log('Auto mode activated via RP5 WebSocket');
        esp32Ws!.close();
        rp5Ws.send(JSON.stringify(message));
      }
      else { 
        setAuto(false);
        message = { action: 'auto_off' };
        rp5Ws.send(JSON.stringify(message));
        await new Promise((resolve) => setTimeout(resolve, 3000)); 

        console.log('Auto mode activated via RP5 WebSocket');
        const esp32Socket = new WebSocket('ws://192.168.4.18:81/ws');
        console.log('Auto mode disabled');
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
      }

    } else {
      console.log('RP5 WebSocket is not open');
    }
  };

  const takePhoto = () => {
    if (rp5Ws && rp5Ws.readyState === WebSocket.OPEN) {
      const cropCommand =
        selectedCrop === 'auto_detect'
          ? 'shoot_assess'
          : `shoot_assess_${selectedCrop}`;
  
      const messageTake = { action: cropCommand };
      rp5Ws.send(JSON.stringify(messageTake));
      console.log(`Requested assessment: ${cropCommand}`);
  
      const messageGet = { action: 'shoot_show' };
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

  const sendControlRequest = (direction : string) => {
    if (esp32Ws && esp32Ws.readyState === WebSocket.OPEN) {
      const message = { action: direction };
      esp32Ws.send(JSON.stringify(message));
      console.log(`Sent: ${JSON.stringify(message)}`);
    } else {
      console.log('WebSocket is not open');
    }
  };

  if (rp5Ws?.readyState !== WebSocket.OPEN) return <FullScreenLoader/>
  
  return (
    <View style={styles.container}>

  <View style={styles.displayBox}>
    <View style={styles.photoBox}>
      {photo ? (
        <Image source={{ uri: photo as string }} style={styles.image}/>
      ) : (
        <Text>No Image</Text>
      )}
    </View>
    <PlantDiagnosis message={message}/>
  </View>

  {/* Take Photo Button */}
  <TouchableOpacity
    style={styles.takePhotoButton}
    onPress={takePhoto}
  >
    <TabBarIcon name="camera" color="white" />
  </TouchableOpacity>

  {/* Horizontal Camera Controls */}
  <View style={styles.cameraControlsContainer}>
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
  </View>

  {/* Vertical Camera Controls */}
  <View style={styles.verticalCameraControls}>
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
  </View>

  {/* Picker */}
  <View style={styles.pickerContainer}>
    <Text style={styles.pickerLabel}>Select Crop:</Text>
    <View style={styles.pickerBox}>
      <Picker
        selectedValue={selectedCrop}
        onValueChange={(itemValue) => setSelectedCrop(itemValue)}
        mode="dropdown"
        style={styles.picker}
      >
        <Picker.Item label="Auto Detect" value="auto_detect" />
        <Picker.Item label="Tomato" value="tomato" />
        <Picker.Item label="Maize" value="maize" />
        <Picker.Item label="Pepper" value="pepper" />
      </Picker>
    </View>
  </View>

      { controlStyle === "keypad" ? (
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
      ) : (
        <JoystickControl onMove={(direction) => sendControlRequest(direction)} />
      )}
    </View>
  );
}

const { width: screenWidth, height: screenHeight } = Dimensions.get('window');

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#222c2e',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 20,
  },
  displayBox: {
    width: '100%',
    alignItems: 'center',
  },
  photoBox: {
    width: '100%',
    aspectRatio: 4/3,
    backgroundColor: '#e0e0e0',
    borderColor: '#ccc',
    borderWidth: 2,
    borderRadius: 5,
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
    marginBottom: 10,
  },
  image: {
    width: '100%',
    height: '100%',
  },
  takePhotoButton: {
    position: 'absolute',
    top: 20,
    left: 20,
    backgroundColor: '#5cb85c',
    borderRadius: 5,
    padding: 10,
    zIndex: 10,
  },
  cameraControlsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginVertical: 10,
    position: 'absolute',
    top: 0,
    left: 0,
    width: screenWidth
  },
  cameraControlButton: {
    flex: 1,
    marginHorizontal: 5,
    backgroundColor: '#5cb85c',
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 5,
  },
  verticalCameraControls: {
    position: 'absolute',
    right: 0,
    top: 0,
    justifyContent: 'center',
    alignItems: 'center',
  },
  cameraControlVerticalButton: {
    backgroundColor: '#5cb85c',
    width: 40,
    height: 80,
    marginVertical: 5,
    borderRadius: 5,
    justifyContent: 'center',
    alignItems: 'center',
  },
  buttonContainer: {
    width: '100%',
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    marginTop: 20,
    maxWidth: 360
  },
  controlButton: {
    width: screenWidth * 0.22,
    maxWidth: 85,
    maxHeight: 85,
    height: screenWidth * 0.22,
    backgroundColor: '#5cb85c',
    borderRadius: 5,
    margin: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  auto_controlButton: {
    width: screenWidth * 0.22,
    height: screenWidth * 0.22,
    backgroundColor: '#9FA6B2',
    maxWidth: 85,
    maxHeight: 85,
    borderRadius: 5,
    margin: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  buttonText: {
    color: '#fff',
    fontSize: 18,
    textAlign: 'center',
  },
  pickerContainer: {
    width: '100%',
    marginBottom: 20,
  },
  pickerLabel: {
    color: 'white',
    fontWeight: 'bold',
    marginBottom: 5,
  },
  pickerBox: {
    borderWidth: 1,
    borderRadius: 8,
    borderColor: '#ccc',
    overflow: 'hidden',
  },
  picker: {
    height: 40,
    color: 'white',
    backgroundColor: '#333',
  },
  cameraControlLeft: {
    position: 'absolute',
    top: 3/4*screenWidth-60,
    left: 20,
    width: (screenWidth - 2*20)/2,
    height: 40,
    backgroundColor: '#5cb85c',
    justifyContent: 'center',
    alignItems: 'center',
    borderBottomLeftRadius: 8,
  },
  cameraControlRight: {
    position: 'absolute',
    top: 3/4*screenWidth-60,
    right: 20,
    width: (screenWidth - 2*20)/2,
    height: 40,
    backgroundColor: '#5cb85c',
    justifyContent: 'center',
    alignItems: 'center',
    borderBottomRightRadius: 8,
  },
  cameraControlUp: {
    position: 'absolute',
    top: 20,
    right: 20,
    width: 40,
    height: 3/8*screenWidth - 15,
    backgroundColor: '#5cb85c',
    justifyContent: 'center',
    alignItems: 'center',
    borderTopRightRadius: 8,
  },
  cameraControlDown: {
    position: 'absolute',
    top: 3/8*screenWidth,
    right: 20,
    width: 40,
    height: 3/8*screenWidth-15,
    backgroundColor: '#5cb85c',
    justifyContent: 'center',
    alignItems: 'center',
    borderBottomRightRadius: 8,
  },
  auto_btn : {
    height : 60,
    backgroundColor : "#5cb85c",
    borderRadius : 5,
    width : '100%',
    display : 'flex',
    justifyContent : 'center',
    alignItems : 'center'
  }, 
  header: {
    fontSize: 24,
    fontWeight: 'bold',
    marginTop: 20,
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
  emptyButton: {
    backgroundColor: 'transparent',
  }
});