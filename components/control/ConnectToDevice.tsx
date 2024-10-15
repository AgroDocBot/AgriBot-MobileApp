import { PropsWithChildren, useState } from 'react';
import { Pressable, StyleSheet, TouchableOpacity, useColorScheme } from 'react-native';
import { TabBarIcon } from '@/components/navigation/TabBarIcon';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { Colors } from '@/constants/Colors';
import { Text } from 'react-native'; 
import { Dimensions } from 'react-native';
import RequestWifiPermission from '@/permissions/WifiPermission';
import WifiManager from "react-native-wifi-reborn";
import { ConnectToProtectedSSIDParams } from 'react-native-wifi-reborn';

interface ConnectScreenProps {
  setConnectedState : Function
}

export function ConnectScreen({setConnectedState} : ConnectScreenProps) {
  
  const theme = useColorScheme() ?? 'dark';

  async function connectToBot() {

    const wifiConfig : ConnectToProtectedSSIDParams = {
      ssid: 'AgriBot',
      password: 'ilovemaven',
      isWEP: true, 
    };

    await RequestWifiPermission().then(() => {
      WifiManager.connectToProtectedWifiSSID(wifiConfig).then(
        () => {
          console.log("Connected successfully!");
        },
        () => {
          console.log("Connection failed!");
        }
      );
    }).then(() => setConnectedState());
  }

  return (
    <ThemedView style={styles.main}>
      <ThemedView style={styles.container}>
      <Text style={styles.connect_text}>Oops, it seems you are not connected!</Text>
        <Pressable style={styles.connect_btn}>
          <TabBarIcon name={'wifi'} color={"white"} size={60}/>     
        </Pressable>
        <Text style={styles.connect_text}>Connect</Text>
      </ThemedView>
    </ThemedView>
  );
}

const { width: screenWidth, height: screenHeight } = Dimensions.get('window');

const styles = StyleSheet.create({
  heading: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  content: {
    marginTop: 6,
    marginLeft: 24,
  },
  connect_btn : {
    width : 100,
    height : 100,
    borderRadius : 25,
    backgroundColor : "#5cb85c",
    display : 'flex',
    flexDirection : 'column',
    justifyContent : 'center',
    alignItems : 'center'
  },
  container : {
    display : 'flex',
    flexDirection : 'column',
    justifyContent : 'center',
    alignItems : 'center',
    backgroundColor : '#222c2e',
    width : screenWidth * 0.65,
    gap : 30
  },
  main : {
    backgroundColor : '#222c2e',
    width : screenWidth,
    height : screenHeight,
    flexDirection : 'column',
    justifyContent : 'center',
    alignItems : 'center'
  },
  connect_text : {
    color : 'white',
    textAlign : 'center',
    fontSize : 24
  }
});
