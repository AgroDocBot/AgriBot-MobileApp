import React, { useEffect, useState } from 'react';
import { View, Text, Modal, TouchableOpacity, ScrollView, StyleSheet, Dimensions } from 'react-native';
import WebView from 'react-native-webview';
import Ionicons from '@expo/vector-icons/Ionicons';
import MeasurementCard from './MeasurementCard';
import { DiseasedPlant } from '@/constants/types/PlantsInterfaces';
import { useSelector } from 'react-redux';
import { RootState } from '@/redux/store';
import { Image } from 'react-native';
import DiseaseModalContent from './DiseaseModalContent';
import { DiseaseType } from '@/constants/types/DiseaseInterfaces';
import { FieldType, MeasurementFieldData } from '@/constants/types/FieldInterfaces';
import i18n from '@/translations/i18n';

interface CustomModalProps {
  visible: boolean;
  onClose: () => void;
  data: any;
  activeTab: string;
}

const CustomModal: React.FC<CustomModalProps> = ({ visible, onClose, data, activeTab }) => {

  const [plantsSet, setPlantsSet] = useState<Array<DiseasedPlant> | null>([]);
  const [fieldPlantSet, setFieldPlantSet] = useState<Array<DiseasedPlant | null>>([]);
  const [diseaseData, setDiseaseData] = useState<DiseaseType | null>(null);

  const user = useSelector((state: RootState) => state.auth.user);

  const { language, controlStyle, unitsSystem } = useSelector((state: RootState) => state.settings);

  if(language === 'English') i18n.locale = 'en';
  else if(language === 'Български') i18n.locale = 'bg';
  else i18n.locale = 'de';

  useEffect(() => {
    //differentiating between measurements and fields based on their properties (measurements have fieldId, where fields have ownerId)
    if(data?.fieldId) { fetch(`https://agribot-backend-abck.onrender.com/plants/diseased/measurement/${data.id}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': 'https://agribot-backend-abck.onrender.com'
        },
      })
        .then((response) => response.json())
        .then((data) => {setPlantsSet(data); console.log(JSON.stringify(data)); console.log(data.id)})
        .catch((error) => console.error('Error fetching plants:', error));
    } else if(data?.ownerId) {
      fetch(`https://agribot-backend-abck.onrender.com/plants/diseased/user/${user?.id}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': 'https://agribot-backend-abck.onrender.com'
        },
      })
        .then((response) => response.json())
        .then((data) => {setFieldPlantSet(data); console.log(JSON.stringify(data)); console.log(data.id)})
        .catch((error) => console.error('Error fetching plants:', error));
    } else {
      setDiseaseData(data);
    }
  }, [visible])

  useEffect(() => {
    console.log("Plants state: "+JSON.stringify(plantsSet));
    console.log("Field plant state: "+JSON.stringify(fieldPlantSet));
  }, [plantsSet, fieldPlantSet])

  const renderModalContent = () => {
    switch (activeTab) {
      case 'fields':
        return (
          <>
            <Text style={styles.modalTitle}>{data.fieldname}</Text>
            <Text style={styles.modalText}>
              <Ionicons name="leaf-outline" size={16} color="#fff" /> {i18n.t("modals.crops")}: {data.crop}
            </Text>
            <View style={styles.mapContainer}>
              <WebView
                source={{ uri: 'file:///android_asset/map_field.html' }}
                style={styles.map}
                injectedJavaScript={`window.postMessage(${JSON.stringify({ lat: data.latitude, lng: data.longitude })}, "*");`}
              />
            </View>
            <Text style={styles.modalText}>{i18n.t("modals.diseased_plants")}:</Text>
            {fieldPlantSet ? (
                <ScrollView>
                {fieldPlantSet?.slice(0, 6).map((plant: DiseasedPlant | null) => (
                  <>
                    <MeasurementCard key={plant?.id} plant={plant!} />
                  </>
                ))}
              </ScrollView>
            ) : (
              <Text style={styles.modalText}>{i18n.t("modals.no_diseased_plants")}</Text>
            )}
          </>
        );

      case 'measurements':
        return (
          <>
            <Text style={styles.modalTitle}>{i18n.t('modals.measurement')} - {data.createdAt.substring(0, 10)}</Text>
            <Text style={styles.modalText}>
              <Ionicons name="location-outline" size={16} color="#fff" /> {i18n.t("modals.field")}: {data.fieldId}
            </Text>
            <View style={styles.mapContainer}>
              <WebView
                source={{ uri: 'file:///android_asset/map_measurement.html' }}
                style={styles.map}
                injectedJavaScript={` 
                (function() {
                  const plants = ${JSON.stringify(plantsSet?.map(plant => ({
                    lat: plant.latitude,
                    lng: plant.longitude
                  })))};
                  
                  window.postMessage({ plants }, "*");
                })();
                `}
              />
            </View>
            <Text style={styles.modalText}>{i18n.t("modals.recent_plants")}:</Text>
            <ScrollView>
              {plantsSet?.map((plant: DiseasedPlant) => (
                <>
                  <MeasurementCard key={plant.id} plant={plant} />
                </>
              ))}
            </ScrollView>
          </>
        );

      case 'diseases':
        console.log("MODAL_REACTAPP: "+JSON.stringify(diseaseData));

        return (
          <>
            <ScrollView>
              <DiseaseModalContent disease={diseaseData!}/>
            </ScrollView>
          </>
        )

      default:
        return <Text style={styles.modalText}>{i18n.t('modals.no_data')}</Text>;
    }
  };

  return (
    <Modal visible={visible} animationType="slide">
      <ScrollView contentContainerStyle={styles.modalContent}>
        {renderModalContent()}
        <TouchableOpacity onPress={onClose} style={styles.closeButton}>
          <Ionicons name="close-outline" size={32} color="#fff" />
        </TouchableOpacity>
      </ScrollView>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalContent: { flex: 1, backgroundColor: '#222', padding: 20 },
  modalTitle: { color: '#fff', fontSize: 22, fontWeight: 'bold', marginBottom: 10 },
  modalText: { color: '#ccc', marginVertical: 5 },
  mapContainer: { height: 300, marginVertical: 10 },
  map: { flex: 1 },
  closeButton: { alignSelf: 'center', marginTop: 20 },
});

export default CustomModal;
