import { PermissionsAndroid } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

export default async function RequestGPSPermission() {

    const savedPermission = await AsyncStorage.getItem('gpsPermission');

    if (savedPermission === 'granted')  return;

    const granted = await PermissionsAndroid.request(
        PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
        {
            title: 'Location permission is required for using GPS services',
            message:
            'This app needs location permission as this is required  ' +
            'to use GPS services.',
            buttonNegative: 'DENY',
            buttonPositive: 'ALLOW',
        },
    );
    
    if (granted ===  PermissionsAndroid.RESULTS.GRANTED) {
        await AsyncStorage.setItem('gpsPermission', 'true');
    } else {
        await AsyncStorage.setItem('gpsPermission', 'false');
    }
}