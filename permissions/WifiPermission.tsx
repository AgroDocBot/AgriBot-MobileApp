import { PermissionsAndroid } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

export default async function RequestWifiPermission() {

    const savedPermission = await AsyncStorage.getItem('wifiPermission');

    if (savedPermission === 'granted')  return;

    const granted = await PermissionsAndroid.request(
        PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
        {
            title: 'Location permission is required for WiFi connections',
            message:
            'This app needs location permission as this is required  ' +
            'to scan for wifi networks.',
            buttonNegative: 'DENY',
            buttonPositive: 'ALLOW',
        },
    );

    if (granted ===  PermissionsAndroid.RESULTS.GRANTED) {
        await AsyncStorage.setItem('wifiPermission', 'true');
    } else {
        await AsyncStorage.setItem('wifiPermission', 'false');
    }
}