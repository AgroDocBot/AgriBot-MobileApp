import React, { useState, useSyncExternalStore, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Modal, ScrollView, Pressable, Dimensions } from 'react-native';
import Ionicons from '@expo/vector-icons/Ionicons';
import { startMeasurement, stopMeasurement, incrementDuration } from '@/redux/measurementNewSlice';
import { useDispatch, useSelector } from 'react-redux';
import CustomModal from './CustomModal';
import i18n from '@/translations/i18n';
//import { updateExplored } from '@/redux/measurementSlice';
import { io } from "socket.io-client";
import { AppDispatch } from '@/redux/store';
import { RootState } from '@/redux/store';
import AsyncStorage from '@react-native-async-storage/async-storage';

const socket = io("wss://agribot-backend-abck.onrender.com")

export default function Card({ data, activeTab, onEdit, onRemove, fields }: any) {
  const [modalVisible, setModalVisible] = useState(false);
  const [measurementRunning, setMeasurementRunning] = useState<boolean>(false);

  const [measurementData, setMeasurementData] = useState([{plant : "TestPlant", index: '2'}]);

  const dispatch = useDispatch<AppDispatch>();

  const { language, controlStyle, unitsSystem } = useSelector((state: RootState) => state.settings);
  const measurementId = useSelector((state: RootState) => state.measurementnew.measurementId);

  if(language === 'English') i18n.locale = 'en';
  else if(language === 'Български') i18n.locale = 'bg';
  else i18n.locale = 'de';

  //console.log("Data passed to card:"+JSON.stringify(data))

  useEffect(() => {
    console.log("Updated activeMeasurement from Redux:" + measurementId);
  }, [measurementId]);

  const openModal = () => {
    setModalVisible(true);
    fetchPlantData(data.id).then(setMeasurementData);
  };

  const fetchPlantData = (measurementId: number) => {
    return fetch(`https://agribot-backend-abck.onrender.com/plants/diseased/measurement/${measurementId}`)
      .then((response) => response.json())
      .catch((error) => console.error('Error fetching plant data:', error));
  };

  const toggleMeasurement = async () => {
    if (measurementRunning) {
      setMeasurementRunning(false);
      dispatch(stopMeasurement());
    } else {
      setMeasurementRunning(true);
      dispatch(startMeasurement(data.id));
      await AsyncStorage.setItem('measurementId', JSON.stringify(data.id));
      console.log("Setting measurement to: "+measurementId);
    }
  };

  useEffect(() => {
    let interval: NodeJS.Timeout | null = null;
  
    if (measurementRunning) {
      interval = setInterval(() => {
        dispatch(incrementDuration());
      }, 1000);
      console.log("Attempting to increment from component")
    } else if (!measurementRunning && interval) {
      clearInterval(interval);
    }
  
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [measurementRunning, dispatch]);
  
  useEffect(() => {
    socket.on('measurementUpdated', (data) => {
      if (data.measurementId === data.id) {
        //dispatch(updateExplored(data.explored));
      }
    });
  
    return () => {
      socket.off('measurementUpdated');
    };
  }, [dispatch]);

  const renderContent = () => {
    switch (activeTab) {
      case 'fields':
        return (
          <>
            <Text style={styles.cardTitle}>{data.fieldname}</Text>
            <Text style={styles.cardText}>
              <Ionicons name="leaf-outline" size={16} color="#fff" /> {i18n.t('fields.crops')}: {data.crop}
            </Text>
            <Text style={styles.cardText}>
              <Ionicons name="location-outline" size={16} color="#fff" /> {i18n.t('fields.location')}: {data.latitude}, {data.longitude}
            </Text>
          </>
        );
      case 'measurements':
        return (
          <>
            <View style={styles.title_buttonWrapper}>
              <Text style={styles.cardTitle}>{fields.find(field => field.id === data.fieldId).fieldname}</Text>
              <TouchableOpacity onPress={() => {toggleMeasurement()}} style={styles.playButton}>
                <Ionicons name={measurementRunning ? 'pause' : 'play'} size={30} color="#fff" />
              </TouchableOpacity>
            </View>
            <Text style={styles.cardText}>
              <Ionicons name="calendar-outline" size={16} color="#fff" /> {i18n.t('measurements.date')}: {data.createdAt.substring(0, 10)}
            </Text>
            <Text style={styles.cardText}>
              <Ionicons name="time-outline" size={16} color="#fff" /> {i18n.t('measurements.duration')}: {data.duration}
            </Text>
            <Text style={styles.cardText}>
              <Ionicons name="stats-chart-outline" size={16} color="#fff" /> {i18n.t('measurements.percent')}: {data.explored}
            </Text>

          </>
        );
      case 'diseases':
        return (
          <>
            <Text style={styles.cardTitle}>{data.diseaseName}</Text>
            <Text style={styles.cardText}>
              <Ionicons name="flower-outline" size={16} color="#fff" /> {i18n.t('fields.plant')}: {data.affectedPlants}
            </Text>
            <Text style={styles.cardText}>
              <Ionicons
                name="alert-circle-outline"
                size={16}
                color={data.encountered ? 'red' : 'green'}
              />{' '}
              Encountered: {data.encountered ? 'Yes' : 'No'}
            </Text>
          </>
        );
    }
  };

  return (
    <View style={[styles.card, styles[`${activeTab}Card`]]}>
      <TouchableOpacity onPress={() => openModal()}>{renderContent()}</TouchableOpacity>
      <View style={styles.actionButtons}>
        <TouchableOpacity onPress={() => onEdit(data, fields.find(field => field.id === data.fieldId))}>
          <Ionicons name="create-outline" size={24} color="#fff" />
        </TouchableOpacity>
        <TouchableOpacity onPress={() => onRemove(data)}>
          <Ionicons name="trash-outline" size={24} color="#fff" />
        </TouchableOpacity>
      </View>

      <CustomModal
        visible={modalVisible}
        onClose={() => setModalVisible(false)}
        activeTab={activeTab}
        data={data}
      />
    </View>
  );
}

const rootFont = Dimensions.get('window').fontScale;

const styles = StyleSheet.create({
  card: { padding: 15, borderRadius: 8, marginVertical: 5 },
  fieldsCard: { backgroundColor: '#333333' },
  measurementsCard: { backgroundColor: '#333333' },
  diseasesCard: { backgroundColor: '#333333' },
  cardTitle: { color: '#fff', fontSize: 18, fontWeight: 'bold' },
  cardText: { color: '#ccc', marginTop: 5 },
  actionButtons: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 10 },
  modalContent: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#222', padding: 20, color: 'white' },
  modalTitle: { color: '#fff', fontSize: 22, marginBottom: 10 },
  modalText: { color: '#ccc', textAlign: 'center' },
  closeButton: { marginTop: 20 },
  playButton: {
    width : 48,
    height: 48,
    borderRadius: 10,
    backgroundColor: '#4CAF50',
    display: 'flex',
    justifyContent: 'center',
    alignContent: 'center',
    paddingLeft: 8
  },
  title_buttonWrapper: {
    width: '100%',
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'space-between',
    //backgroundColor: 'red'
  },
  whiteText: {
    color: 'white'
  }
});
