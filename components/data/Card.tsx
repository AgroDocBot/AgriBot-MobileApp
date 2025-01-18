import React, { useState, useSyncExternalStore, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Modal, ScrollView, Pressable } from 'react-native';
import Ionicons from '@expo/vector-icons/Ionicons';
import { startMeasurement, stopMeasurement, incrementDuration } from '@/redux/measurementSlice';
import { useDispatch, useSelector } from 'react-redux';

export default function Card({ data, activeTab, onEdit, onRemove }: any) {
  const [modalVisible, setModalVisible] = useState(false);
  const [measurementRunning, setMeasurementRunning] = useState<boolean>(false);

  const dispatch = useDispatch();

  const toggleMeasurement = () => {
    if (measurementRunning) {
      setMeasurementRunning(false);
      dispatch(stopMeasurement());
    } else {
      setMeasurementRunning(true);
      dispatch(startMeasurement(data.id));
    }
  };

  useEffect(() => {
    let interval: NodeJS.Timeout | null = null;

    if (measurementRunning) {
      interval = setInterval(() => {
        dispatch(incrementDuration());
        console.log('sec added');
        console.log(JSON.stringify({duration: interval, explored: data.explored, measurementId: data.id }));
        fetch(`https://agribot-backend-abck.onrender.com/measurements/edit`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': 'https://agribot-backend-abck.onrender.com'
          },
          body: JSON.stringify({duration: interval, explored: data.explored, measurementId: data.id }),
        });
      }, 1000);
    } else if (!measurementRunning && interval) {
      clearInterval(interval);
    }

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [measurementRunning, dispatch]);

  const renderContent = () => {
    switch (activeTab) {
      case 'fields':
        return (
          <>
            <Text style={styles.cardTitle}>{data.fieldname}</Text>
            <Text style={styles.cardText}>
              <Ionicons name="leaf-outline" size={16} color="#fff" /> Crops: {data.crop}
            </Text>
            <Text style={styles.cardText}>
              <Ionicons name="location-outline" size={16} color="#fff" /> Location: {data.longitude}
            </Text>
          </>
        );
      case 'measurements':
        return (
          <>
            <View style={styles.title_buttonWrapper}>
              <Text style={styles.cardTitle}>{data.fieldId}</Text>
              <TouchableOpacity onPress={() => {toggleMeasurement()}} style={styles.playButton}>
                <Ionicons name={measurementRunning ? 'pause' : 'play'} size={30} color="#fff" />
              </TouchableOpacity>
            </View>
            <Text style={styles.cardText}>
              <Ionicons name="calendar-outline" size={16} color="#fff" /> Date: {data.createdAt.substring(0, 10)}
            </Text>
            <Text style={styles.cardText}>
              <Ionicons name="time-outline" size={16} color="#fff" /> Duration: {data.duration}
            </Text>
            <Text style={styles.cardText}>
              <Ionicons name="stats-chart-outline" size={16} color="#fff" /> Percent: {data.explored}
            </Text>

          </>
        );
      case 'diseases':
        return (
          <>
            <Text style={styles.cardTitle}>{data.diseaseName}</Text>
            <Text style={styles.cardText}>
              <Ionicons name="flower-outline" size={16} color="#fff" /> Plant: {data.affectedPlants}
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
      <TouchableOpacity onPress={() => setModalVisible(true)}>{renderContent()}</TouchableOpacity>
      <View style={styles.actionButtons}>
        <TouchableOpacity onPress={() => onEdit(data)}>
          <Ionicons name="create-outline" size={24} color="#fff" />
        </TouchableOpacity>
        <TouchableOpacity onPress={() => onRemove(data)}>
          <Ionicons name="trash-outline" size={24} color="#fff" />
        </TouchableOpacity>
      </View>

      <Modal visible={modalVisible} animationType="slide">
        <ScrollView contentContainerStyle={styles.modalContent}>
          <Text style={styles.modalTitle}>Details</Text>
          <Text style={styles.modalText}>{JSON.stringify(data, null, 2)}</Text>
          <TouchableOpacity
            onPress={() => setModalVisible(false)}
            style={styles.closeButton}>
            <Ionicons name="close-outline" size={32} color="#fff" />
          </TouchableOpacity>
        </ScrollView>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  card: { padding: 15, borderRadius: 8, marginVertical: 5 },
  fieldsCard: { backgroundColor: '#333333' },
  measurementsCard: { backgroundColor: '#333333' },
  diseasesCard: { backgroundColor: '#333333' },
  cardTitle: { color: '#fff', fontSize: 18, fontWeight: 'bold' },
  cardText: { color: '#ccc', marginTop: 5 },
  actionButtons: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 10 },
  modalContent: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#222', padding: 20 },
  modalTitle: { color: '#fff', fontSize: 22, marginBottom: 10 },
  modalText: { color: '#ccc', textAlign: 'center' },
  closeButton: { marginTop: 20 },
  playButton: {
    width : '3rem',
    height: '3rem',
    borderRadius: 10,
    backgroundColor: '#4CAF50',
    display: 'flex',
    justifyContent: 'center',
    alignContent: 'center',
    paddingLeft: '0.6rem'
  },
  title_buttonWrapper: {
    width: '100%',
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'space-between',
    //backgroundColor: 'red'
  }
});
