import React, { useState } from 'react';
import { View, Text, Image, TouchableOpacity, Modal, StyleSheet } from 'react-native';
import WebView from 'react-native-webview';
import Ionicons from '@expo/vector-icons/Ionicons';

interface MeasurementCardProps {
  plant: {
    name: string;
    photo: string;
    healthStatus: string;
    latitude: number;
    longitude: number;
    userLatitude: number;
    userLongitude: number;
  };
}

const MeasurementCard: React.FC<MeasurementCardProps> = ({ plant }) => {
  const [mapVisible, setMapVisible] = useState(false);

  return (
    <View style={styles.card}>
      <Image source={{ uri: plant.photo }} style={styles.image} />
      <View style={styles.info}>
        <Text style={styles.name}>{plant.name}</Text>
        <Text style={[styles.status, plant.healthStatus === 'healthy' ? styles.healthy : styles.diseased]}>
          {plant.healthStatus}
        </Text>
        <TouchableOpacity onPress={() => setMapVisible(true)}>
          <Ionicons name="map-outline" size={28} color="#fff" />
        </TouchableOpacity>
      </View>

      <Modal visible={mapVisible} animationType="slide">
        <View style={styles.mapContainer}>
          <WebView
            source={{ uri: 'file:///android_asset/map_measurement.html' }}
            style={styles.map}
            injectedJavaScript={`window.postMessage(${JSON.stringify({
              plantLat: plant.latitude,
              plantLng: plant.longitude,
              userLat: plant.userLatitude,
              userLng: plant.userLongitude,
            })}, "*");`}
          />
          <TouchableOpacity onPress={() => setMapVisible(false)} style={styles.closeButton}>
            <Ionicons name="close-outline" size={32} color="#fff" />
          </TouchableOpacity>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  card: { flexDirection: 'row', backgroundColor: '#333', padding: 10, borderRadius: 8, marginVertical: 5 },
  image: { width: 50, height: 50, borderRadius: 8 },
  info: { flex: 1, marginLeft: 10 },
  name: { color: '#fff', fontSize: 16, fontWeight: 'bold' },
  status: { fontSize: 14, fontWeight: 'bold', marginVertical: 5 },
  healthy: { color: 'green' },
  diseased: { color: 'red' },
  mapContainer: { flex: 1, backgroundColor: '#222' },
  map: { flex: 1 },
  closeButton: { alignSelf: 'center', marginTop: 20 },
});

export default MeasurementCard;
