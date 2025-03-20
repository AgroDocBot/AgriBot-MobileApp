import { PropsWithChildren, useEffect, useState } from 'react';
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
import { NativeModules } from 'react-native';
import { Alert } from 'react-native';
import i18n from '@/translations/i18n';
import { useDispatch, useSelector } from 'react-redux';

interface ConnectScreenProps {
  setConnectedState : Function
}

export function ConnectScreen({setConnectedState} : ConnectScreenProps) {
  
  const theme = useColorScheme() ?? 'dark';

  const dispatch = useDispatch();
  const [failedBindingCount, setFailedBindingCount] = useState<number>(0);

  const { language, controlStyle, unitsSystem } = useSelector((state: any) => state.settings);

  if(language === 'English') i18n.locale = 'en';
  else if(language === 'Български') i18n.locale = 'bg';
  else i18n.locale = 'de';

  const { NetworkManager } = NativeModules;

  useEffect(() => {
    console.log(failedBindingCount);
    if(failedBindingCount > 0) {
      connectToBot();
    }
  }, [failedBindingCount]);

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

    }).then(() => setConnectedState()).then( async () => {
      await new Promise((resolve) => setTimeout(resolve, 5000));
      NetworkManager.testPackage()
      NetworkManager.bindToMobileData();

      try {
        const response = await fetch('https://www.google.com', {
          method: 'GET',
          headers: {
            Accept: 'text/html',
          },
        });
  
        if (response.ok) {
          Alert.alert('Success', 'Internet connection is working properly!');
        } else {
          Alert.alert('Error', 'Internet connection is not stable or reachable.');
        }
      } catch (error) {
        //Alert.alert('Error', 'Failed to connect to the internet.');
        console.error('Connection check failed:', error);
        console.log("Trying again!");
        setFailedBindingCount((prev) => prev + 1);
      }
    });
  }

  return (
    <ThemedView style={styles.main}>
      <ThemedView style={styles.container}>
      <Text style={styles.connect_text}>{i18n.t("connect.not_connected")}</Text>
        <Pressable style={styles.connect_btn} onPress={connectToBot}>
          <TabBarIcon name={'wifi'} color={"white"} size={60}/>     
        </Pressable>
        <Text style={styles.connect_text}>{i18n.t("connect.connect")}</Text>
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