import { PermissionsAndroid } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

export default async function RequestImageRWPermission() {

    const savedPermission = await AsyncStorage.getItem('imagePermission');

    if (savedPermission === 'granted')  return;

    const granted = await PermissionsAndroid.request(
        PermissionsAndroid.PERMISSIONS.READ_MEDIA_IMAGES,
        {
            title: 'Permission to read images is required for using the AI service of the robot',
            message:
            'This app needs permission to read and write images as this is required  ' +
            'to use the AI analyzing services.',
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