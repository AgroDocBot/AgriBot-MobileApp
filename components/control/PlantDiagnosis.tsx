import { View, Text } from 'react-native';
import { StyleSheet } from 'react-native';
import { useSelector } from 'react-redux';
import i18n from '@/translations/i18n';
import { RootState } from '@/redux/store';

const PlantDiagnosis = ({ message }: { message: string }) => {
    const { language } = useSelector((state: RootState) => state.settings);
    const user = useSelector((state: RootState) => state.auth.user);
  
    if (language === 'English') i18n.locale = 'en';
    else if (language === 'Български') i18n.locale = 'bg';
    else i18n.locale = 'de';
  

    const cleanAndTranslateMessage = (message: string) => {
        if (!message) return '';

        // Normalize the message (replace underscores and remove extra characters)
        let cleanMessage = message.replace(/___/g, ' ')
                                  .replace(/_/g, ' ')
                                  .replace(/_\(/g, '')
                                  .replace(/,_/g, '')
                                  .trim(); 

        // Extract the crop and disease
        let parts = cleanMessage.split(' ');
        if (parts.length < 2) {
            return i18n.t('diseases.Healthy'); // Handle healthy cases
        }

        // Extract crop and disease
        let crop = parts[0]; 
        let disease = parts.slice(1).join(' '); 

        // Special cases mapping for crops with multiple words
        const cropMapping: { [key: string]: string } = {
            'Corn_(maize)': 'Corn',
            'Pepper,_bell': 'Pepper'
        };
        if (cropMapping[crop]) {
            crop = cropMapping[crop];
        }

        // Translate using i18n keys
        const translatedCrop = i18n.t(`classification.crops.${crop}`); // Default to crop name if not found
        const translatedDisease = i18n.t(`classification.diseases.${disease}`); // Default to disease name if not found

        return `${translatedCrop} - ${translatedDisease}`;
    };

    return (
        <View style={styles.textBox}>
            <Text>{message}</Text>
        </View>
    );
};

const styles = StyleSheet.create({
    textBox: {
        width: '100%',
        height: 50,
        backgroundColor: '#e0e0e0',
        borderColor: '#ccc',
        borderWidth: 2,
        justifyContent: 'center',
        alignItems: 'center',
        borderRadius: 5,
      },
})
export default PlantDiagnosis;
